import ee
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache

# ==========================================
# 1. INITIALIZE GOOGLE EARTH ENGINE
# ==========================================

PROJECT_ID = "proyek-ds-488707"

ee.Initialize(project=PROJECT_ID)

app = FastAPI(title="Palm Health Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 2. ASSETS & COORDINATE LOOKUP
# ==========================================

sawit_count = ee.Image(
    "projects/proyek-ds-488707/assets/sawit_classification_count_2015_2025"
)

# Centroids for all 16 kecamatan in Rokan Hulu
DISTRICT_CENTERS = {
    "Bangun Purba": [0.9141, 100.191],
    "Bonai Darussalam": [1.1626, 100.8362],
    "Kabun": [0.465, 100.746],
    "Kepenuhan": [1.1327, 100.623],
    "Kepenuhan Hulu": [0.9896, 100.515],
    "Kunto Darussalam": [0.9194, 100.6873],
    "Pagaran Tapah Darussalam": [0.7698, 100.604],
    "Pendalian IV Koto": [0.5026, 100.4863],
    "Pendalian Iv Koto": [0.5026, 100.4863],
    "Rambah": [0.8262, 100.2607],
    "Rambah Hilir": [0.9735, 100.3607],
    "Rambah Samo": [0.8184, 100.434],
    "Rokan IV Koto": [0.5835, 100.3461],
    "Rokan Iv Koto": [0.5835, 100.3461],
    "Tambusai": [1.0991, 100.2624],
    "Tambusai Utara": [1.2855, 100.3142],
    "Tandun": [0.5873, 100.6077],
    "Ujung Batu": [0.6925, 100.5262],
    "Semua Kecamatan": [0.85, 100.45],
}

def normalize_district_name(name: str) -> str:
    norm = name.strip()
    if norm.lower() == "pendalian iv koto":
        return "Pendalian Iv Koto"
    if norm.lower() == "rokan iv koto":
        return "Rokan Iv Koto"
    return norm


# ==========================================
# 3. SENTINEL-2 CLOUD MASK
# ==========================================

def mask_sentinel2(image):

    scl = image.select("SCL")

    mask = (
        scl.neq(3)
        .And(scl.neq(8))
        .And(scl.neq(9))
        .And(scl.neq(10))
    )

    return (
        image.updateMask(mask)
        .copyProperties(image, ["system:time_start"])
    )


# ==========================================
# 4. CREATE SATELLITE & BOUNDARY IMAGES
# ==========================================

def create_satellite_image(target_roi, year: int = 2025):
    if year >= 2025:
        start_date = "2024-08-01"
        end_date = "2025-10-01"
    else:
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(target_roi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 80))
        .map(mask_sentinel2)
    )

    image = (
        collection
        .median()
        .clip(target_roi)
    )

    return image.select(["B4", "B3", "B2"])


def create_boundary_image(feature_collection, width=5):

    boundary_image = (
        ee.Image()
        .byte()
        .paint(feature_collection, 1, width)
        .selfMask()
    )

    return boundary_image


@lru_cache(maxsize=1)
def get_all_boundaries_tile_url():
    all_districts = (
        ee.FeatureCollection("projects/proyek-ds-488707/assets/gadm41_IDN_3")
        .filter(ee.Filter.eq("NAME_2", "Rokan Hulu"))
    )
    # Increase width to 2 or 3 for thicker outlines
    all_boundary_img = create_boundary_image(all_districts, width=3)
    map_id = all_boundary_img.getMapId({"palette": ["FFFFFF"]})
    return map_id["tile_fetcher"].url_format


# ==========================================
# 5. GENERATE MAP TILE URLS PER KECAMATAN
# ==========================================

@lru_cache(maxsize=128)
def get_map_layers(district_name: str = "Rambah Hilir", year: int = 2025):
    norm_name = normalize_district_name(district_name)

    if norm_name == "Semua Kecamatan":
        dist_boundary = ee.FeatureCollection(
            "projects/proyek-ds-488707/assets/gadm41_IDN_3"
        ).filter(ee.Filter.eq("NAME_2", "Rokan Hulu"))
    else:
        dist_boundary = (
            ee.FeatureCollection("projects/proyek-ds-488707/assets/gadm41_IDN_3")
            .filter(ee.Filter.eq("NAME_3", norm_name))
        )

    dist_roi = dist_boundary.geometry()

    # Sentinel-2 RGB composite only generated for historical years (< 2025)
    satellite_url = None
    if year < 2025:
        satellite_img = create_satellite_image(dist_roi, year)
        satellite_map = satellite_img.getMapId({
            "min": 0,
            "max": 3000,
            "gamma": 1.2
        })
        satellite_url = satellite_map["tile_fetcher"].url_format

    # Thicker active boundary (width=4)
    boundary_map = create_boundary_image(dist_boundary, width=4).getMapId({
        "palette": ["FFFFFF"]
    })

    count_map = sawit_count.clip(dist_roi).getMapId({
        "min": 0,
        "max": 11,
        "palette": [
            "67000d", "a50f15", "cb181d", "ef3b2c",
            "fb6a4a", "c7e9c0", "a1d99b", "74c476",
            "41ab5d", "238b45", "006d2c", "00441b"
        ]
    })

    center = (
        DISTRICT_CENTERS.get(district_name)
        or DISTRICT_CENTERS.get(norm_name)
        or [0.9735, 100.3607]
    )
    zoom = 9 if norm_name == "Semua Kecamatan" else 11

    return {
        "allBoundaries": get_all_boundaries_tile_url(),
        "boundary": boundary_map["tile_fetcher"].url_format,
        "sawitCount": count_map["tile_fetcher"].url_format,
        "satellite": satellite_url,
        "center": center,
        "zoom": zoom,
        "district": district_name,
        "year": year,
    }


# ==========================================
# 6. CALCULATE AREA STATISTICS (GEE)
# ==========================================

@lru_cache(maxsize=32)
def calculate_statistics(district_name: str = "Rambah Hilir"):
    norm_name = normalize_district_name(district_name)

    if norm_name == "Semua Kecamatan":
        dist_boundary = ee.FeatureCollection(
            "projects/proyek-ds-488707/assets/gadm41_IDN_3"
        ).filter(ee.Filter.eq("NAME_2", "Rokan Hulu"))
    else:
        dist_boundary = (
            ee.FeatureCollection("projects/proyek-ds-488707/assets/gadm41_IDN_3")
            .filter(ee.Filter.eq("NAME_3", norm_name))
        )

    dist_roi = dist_boundary.geometry()
    pixel_area_ha = ee.Image.pixelArea().divide(10000)

    # Combine calculations into single reduceRegion call for speed
    combined = ee.Image.cat([
        pixel_area_ha.rename("total_area"),
        pixel_area_ha.updateMask(sawit_count.gte(5)).rename("sawit_area"),
        pixel_area_ha.updateMask(
            sawit_count.lt(5).And(sawit_count.gte(0))
        ).rename("non_sawit_area"),
    ])

    stats = combined.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=dist_roi,
        scale=30,
        maxPixels=1e9,
    ).getInfo()

    total_area = float(stats.get("total_area") or 0.0)
    sawit_area = float(stats.get("sawit_area") or 0.0)
    non_sawit_area = float(stats.get("non_sawit_area") or 0.0)

    classified_area = sawit_area + non_sawit_area
    unidentified_area = max(0.0, total_area - classified_area)

    sawit_pct = round((sawit_area / total_area * 100), 2) if total_area > 0 else 0.0
    non_sawit_pct = round((non_sawit_area / total_area * 100), 2) if total_area > 0 else 0.0
    unidentified_pct = round((unidentified_area / total_area * 100), 2) if total_area > 0 else 0.0

    has_data = classified_area > 100.0

    return {
        "district": district_name,
        "totalAreaHa": round(total_area, 2),
        "sawitHa": round(sawit_area, 2),
        "sawitPct": sawit_pct,
        "nonSawitHa": round(non_sawit_area, 2),
        "nonSawitPct": non_sawit_pct,
        "unidentifiedHa": round(unidentified_area, 2),
        "unidentifiedPct": unidentified_pct,
        "hasData": has_data,
    }


# ==========================================
# 7. API ENDPOINTS
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Palm Health Monitoring API",
        "status": "running"
    }


@app.get("/api/map-layers")
def map_layers(
    district: str = Query("Rambah Hilir"),
    year: int = Query(2025, ge=2018, le=2026)
):

    return get_map_layers(district, year)


@app.get("/api/statistics")
def statistics(district: str = Query("Rambah Hilir")):

    return calculate_statistics(district)
