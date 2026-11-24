import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Plus,
  Minus,
  LocateFixed,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  Calendar,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import districtsGeoJson from "../data/rokan_hulu_districts.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Zoom level settings
const MAX_ZOOM = 20;
const MAX_NATIVE_ZOOM = 18;

function MapControls({ isFullscreen, onToggleFullscreen }) {
  const map = useMap();

  const locate = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung fitur lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 14);
      },
      () => alert("Lokasi tidak dapat diakses.")
    );
  };

  return (
    <div className="map-controls">
      <button type="button" aria-label="Perbesar" onClick={() => map.zoomIn()}>
        <Plus size={16} />
      </button>

      <button type="button" aria-label="Perkecil" onClick={() => map.zoomOut()}>
        <Minus size={16} />
      </button>

      <button type="button" aria-label="Lokasi" onClick={locate}>
        <LocateFixed size={16} />
      </button>

      <button
        type="button"
        aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
        title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>
    </div>
  );
}

function MapResize({ isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();

    const observer = new ResizeObserver(resize);
    const container = map.getContainer();

    observer.observe(container);
    requestAnimationFrame(resize);

    return () => observer.disconnect();
  }, [map, isFullscreen]);

  return null;
}

function MapFlyTo({ center, zoom, district }) {
  const map = useMap();
  const currentDistrictRef = useRef(district);

  useEffect(() => {
    // Only flyTo when the district has actually changed, never on year change
    if (currentDistrictRef.current !== district) {
      currentDistrictRef.current = district;
      if (center && center.length === 2) {
        map.flyTo(center, zoom || 11, { duration: 1.2 });
      }
    }
  }, [district, center, zoom, map]);

  return null;
}

export default function MapPanel({
  district = "Rambah Hilir",
  onSelectDistrict,
  compact = false,
}) {
  const [layers, setLayers] = useState(null);
  const [error, setError] = useState("");
  const [activeLayer, setActiveLayer] = useState("Deteksi Sawit");
  const [opacity, setOpacity] = useState(0.85);
  const [year, setYear] = useState(2025);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [legendMinimized, setLegendMinimized] = useState(false);

  const mapArtRef = useRef(null);
  const yearControlRef = useRef(null);
  const legendRef = useRef(null);

  // Prevent map drag/zoom when interacting with floating overlay controls
  useEffect(() => {
    if (yearControlRef.current) {
      L.DomEvent.disableClickPropagation(yearControlRef.current);
      L.DomEvent.disableScrollPropagation(yearControlRef.current);
    }
    if (legendRef.current) {
      L.DomEvent.disableClickPropagation(legendRef.current);
      L.DomEvent.disableScrollPropagation(legendRef.current);
    }
  }, [layers, legendMinimized]);

  // Handle browser native fullscreen change
  const toggleFullscreen = () => {
    if (!mapArtRef.current) return;

    if (!document.fullscreenElement) {
      mapArtRef.current.requestFullscreen().catch(() => {
        setIsFullscreen((prev) => !prev);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Fetch map layers for selected district and year
  useEffect(() => {
    const controller = new AbortController();
    setIsYearLoading(true);

    fetch(
      `${API_URL}/api/map-layers?district=${encodeURIComponent(district)}&year=${year}`,
      {
        signal: controller.signal,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil layer dari backend.");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.boundary || !data.sawitCount) {
          throw new Error("URL layer GEE belum lengkap.");
        }

        setLayers(data);
        setIsYearLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsYearLoading(false);
        }
      });

    return () => controller.abort();
  }, [district, year]);

  return (
    <section className={`map-panel ${compact ? "map-compact" : ""}`}>
      <div
        ref={mapArtRef}
        className={`map-art ${isFullscreen ? "is-fullscreen" : ""}`}
      >
        {layers && (
          <MapContainer
            center={layers.center || [0.9735, 100.3607]}
            zoom={layers.zoom || 11}
            maxZoom={MAX_ZOOM}
            scrollWheelZoom={true}
            zoomControl={false}
            className="gee-map"
          >
            <MapResize isFullscreen={isFullscreen} />
            <MapFlyTo center={layers.center} zoom={layers.zoom} district={district} />

            {/* Base Layer: Google Hybrid (HD Satellite View, aktif untuk seluruh dunia dan tahun 2025) */}
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={MAX_ZOOM}
              attribution="&copy; Google"
            />

            {/* Citra Sentinel-2 RGB hanya untuk tahun-tahun historis (< 2025) */}
            {year < 2025 && layers.satellite && (
              <TileLayer
                key={`satellite-${district}-${year}`}
                url={layers.satellite}
                maxZoom={MAX_ZOOM}
                maxNativeZoom={MAX_NATIVE_ZOOM}
                attribution="Google Earth Engine / Copernicus Sentinel-2"
              />
            )}

            {/* Batas semua 16 kecamatan (selalu terlihat di seluruh peta) */}
            {layers.allBoundaries && (
              <TileLayer
                url={layers.allBoundaries}
                opacity={0.85}
                maxZoom={MAX_ZOOM}
                maxNativeZoom={MAX_NATIVE_ZOOM}
                attribution="Google Earth Engine"
              />
            )}

            {/* Layer deteksi sawit */}
            {activeLayer === "Deteksi Sawit" && (
              <TileLayer
                key={`sawit-${district}`}
                url={layers.sawitCount}
                opacity={opacity}
                maxZoom={MAX_ZOOM}
                maxNativeZoom={MAX_NATIVE_ZOOM}
                attribution="Google Earth Engine"
              />
            )}

            {/* Batas interaktif 16 kecamatan (Bisa diklik & hover tooltip) */}
            <GeoJSON
              key={`geojson-${district}`}
              data={districtsGeoJson}
              style={(feature) => {
                const isSelected = feature?.properties?.NAME_3 === district;
                return {
                  color: "#FFFFFF",
                  weight: isSelected ? 4 : 2,
                  opacity: 0.95,
                  fillColor: "#47834b",
                  fillOpacity: isSelected ? 0.08 : 0.001,
                };
              }}
              onEachFeature={(feature, layer) => {
                const name = feature?.properties?.NAME_3;
                if (!name) return;

                layer.bindTooltip(`Kecamatan ${name}`, {
                  sticky: true,
                  direction: "top",
                  className: "map-tooltip",
                });

                layer.on({
                  click: () => {
                    if (onSelectDistrict) {
                      onSelectDistrict(name);
                    }
                  },
                  mouseover: (e) => {
                    const target = e.target;
                    target.setStyle({
                      weight: 3,
                      fillOpacity: 0.25,
                    });
                    target.bringToFront();
                  },
                  mouseout: (e) => {
                    const isSelected = name === district;
                    e.target.setStyle({
                      weight: isSelected ? 4 : 2,
                      fillOpacity: isSelected ? 0.08 : 0.001,
                    });
                  },
                });
              }}
            />

            <MapControls
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </MapContainer>
        )}

        {!layers && (
          <div className="map-status">
            {error ? (
              <>
                <strong>Peta gagal dimuat</strong>
                <span>{error}</span>
                <small>Pastikan backend GEE berjalan di port 8000.</small>
              </>
            ) : (
              <>
                <div className="map-loader" />
                <strong>
                  Memuat peta Google Earth Engine ({district} - {year})...
                </strong>
              </>
            )}
          </div>
        )}

        {/* Pilihan layer tetap mengikuti desain UI */}
        <div className="map-layer-tabs">
          <b>Layer:</b>

          {["Deteksi Sawit", "Kesehatan Sawit"].map((item) => (
            <button
              key={item}
              type="button"
              className={activeLayer === item ? "selected" : ""}
              disabled={item === "Kesehatan Sawit"}
              title={
                item === "Kesehatan Sawit"
                  ? "Layer belum tersedia dari backend"
                  : ""
              }
              onClick={() => setActiveLayer(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Legenda (Minimizeable) */}
        <div
          ref={legendRef}
          className={`map-legend ${legendMinimized ? "minimized" : ""}`}
        >
          <div
            className="map-legend-header"
            onClick={() => setLegendMinimized((prev) => !prev)}
            title={legendMinimized ? "Buka legenda" : "Kecilkan legenda"}
          >
            <strong>Legenda</strong>
            <button
              type="button"
              className="legend-toggle-btn"
              aria-label={legendMinimized ? "Buka legenda" : "Kecilkan legenda"}
            >
              {legendMinimized ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
            </button>
          </div>

          {!legendMinimized && (
            <div className="map-legend-body">
              {activeLayer === "Deteksi Sawit" ? (
                <>
                  <span>
                    <i className="legend-dot healthy" />
                    Sawit
                  </span>

                  <span>
                    <i className="legend-dot sick" />
                    Non-Sawit
                  </span>

                  <span>
                    <i className="legend-dot unknown" />
                    Tidak teridentifikasi
                  </span>

                  <hr />

                  <label className="map-opacity">
                    Transparansi
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(opacity * 100)}
                      onChange={(e) =>
                        setOpacity(Number(e.target.value) / 100)
                      }
                    />
                  </label>
                </>
              ) : (
                <span>Layer belum tersedia</span>
              )}

              <hr />
              <span className="legend-muted">
                — Batas 16 Kecamatan (Klik peta)
              </span>
              <span className="legend-muted">
                □ Batas{" "}
                {district === "Semua Kecamatan"
                  ? "Kabupaten Rokan Hulu"
                  : `Kecamatan ${district}`}
              </span>
            </div>
          )}
        </div>

        {/* Year Slider (2018 - Sekarang) */}
        <div className="map-year-control" ref={yearControlRef}>
          <div className="year-control-header">
            <div className="year-title">
              <Calendar size={13} />
              <span>Tahun Citra:</span>
              <strong>{year === 2025 ? `${year} (Sekarang)` : year}</strong>
            </div>
            {isYearLoading && (
              <span className="year-loading-pill">
                <Loader2 size={10} className="map-loader" /> Memuat citra...
              </span>
            )}
          </div>
          <div className="year-slider-row">
            <span className="year-endpoint">2018</span>
            <input
              type="range"
              min={2018}
              max={2025}
              step={1}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="year-slider-input"
              aria-label="Pilih tahun citra satelit"
            />
            <span className="year-endpoint">2025</span>
          </div>
          <div className="year-buttons">
            {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <button
                key={y}
                type="button"
                className={`year-btn ${y === year ? "active" : ""}`}
                onClick={() => setYear(y)}
              >
                {y === 2025 ? "Now" : y}
              </button>
            ))}
          </div>
        </div>

        <div className="map-place-label">{district}</div>

        <div className="map-credit">
          {year === 2025
            ? "Google Earth Engine · Google Hybrid (HD)"
            : `Google Earth Engine · Sentinel-2 (${year})`}
        </div>
      </div>
    </section>
  );
}
