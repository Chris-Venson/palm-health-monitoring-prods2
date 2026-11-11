
import ee
from fastapi import FastAPI
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
# 2. LOAD RAMBAH HILIR BOUNDARY
# ==========================================

boundary = (
    ee.FeatureCollection(
        "projects/proyek-ds-488707/assets/gadm41_IDN_3"
    )
    .filter(ee.Filter.eq("NAME_3", "Rambah Hilir"))
)

roi = boundary.geometry()


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
# 4. CREATE SATELLITE IMAGE
# ==========================================

def create_satellite_image():

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(roi)
        .filterDate("2024-08-01", "2025-10-01")
        .filter(
            ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 80)
        )
        .map(mask_sentinel2)
    )

    image = (
        collection
        .median()
        .clip(roi)
    )

    return image.select(["B4", "B3", "B2"])


# ==========================================
# 5. CREATE BOUNDARY IMAGE
# ==========================================

def create_boundary_image():

    boundary_image = (
        ee.Image()
        .byte()
        .paint(boundary, 1, 3)
        .selfMask()
    )

    return boundary_image


# ==========================================
# 6. GENERATE MAP TILE URLS
# ==========================================

@lru_cache(maxsize=1)
def get_map_layers():

    satellite = create_satellite_image()

    rgb_map = satellite.getMapId({
        "min": 0,
        "max": 3000,
        "gamma": 1.2
    })

    boundary_map = create_boundary_image().getMapId({
        "palette": ["FFFFFF"]
    })

    return {
        "satellite": rgb_map["tile_fetcher"].url_format,
        "boundary": boundary_map["tile_fetcher"].url_format
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
def map_layers():

    return get_map_layers()
