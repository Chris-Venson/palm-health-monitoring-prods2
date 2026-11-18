import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  Plus,
  Minus,
  LocateFixed,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Zoom level settings
const MAX_ZOOM = 20;
const MAX_NATIVE_ZOOM = 18;

function MapControls() {
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
    </div>
  );
}

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();

    const observer = new ResizeObserver(resize);
    const container = map.getContainer();

    observer.observe(container);
    requestAnimationFrame(resize);

    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MapFlyTo({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom || 11, { duration: 1.2 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapPanel({ district = "Rambah Hilir", compact = false }) {
  const [layers, setLayers] = useState(null);
  const [error, setError] = useState("");
  const [activeLayer, setActiveLayer] = useState("Deteksi Sawit");
  const [opacity, setOpacity] = useState(0.85);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/map-layers?district=${encodeURIComponent(district)}`, {
      signal: controller.signal,
    })
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
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, [district]);

  return (
    <section className={`map-panel ${compact ? "map-compact" : ""}`}>
      <div className="map-art">

        {layers && (
          <MapContainer
            center={layers.center || [0.9735, 100.3607]}
            zoom={layers.zoom || 11}
            maxZoom={MAX_ZOOM}
            scrollWheelZoom={true}
            zoomControl={false}
            className="gee-map"
          >
            <MapResize />
            <MapFlyTo center={layers.center} zoom={layers.zoom} />

            {/* Base Layer: Google Hybrid (Menampilkan seluruh dunia / area sekitar) */}
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={MAX_ZOOM}
              attribution="&copy; Google"
            />

            {/* Batas semua 16 kecamatan (selalu terlihat di seluruh peta) */}
            {layers.allBoundaries && (
              <TileLayer
                url={layers.allBoundaries}
                opacity={1}
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

            {/* Batas wilayah kecamatan aktif (garis tebal) */}
            <TileLayer
              key={`boundary-${district}`}
              url={layers.boundary}
              opacity={1}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={MAX_NATIVE_ZOOM}
              attribution="Google Earth Engine"
            />

            <MapControls />
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
                <strong>Memuat peta Google Earth Engine ({district})...</strong>
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

        {/* Legenda */}
        <div className="map-legend">
          <strong>Legenda</strong>

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
            — Batas 16 Kecamatan
          </span>
          <span className="legend-muted">
            □ Batas {district === "Semua Kecamatan" ? "Kabupaten Rokan Hulu" : `Kecamatan ${district}`}
          </span>
        </div>

        <div className="map-place-label">{district}</div>

        <div className="map-credit">
          Google Earth Engine · Google Hybrid
        </div>

      </div>
    </section>
  );
}
