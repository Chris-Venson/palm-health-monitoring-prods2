
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

export default function MapPanel({ compact = false }) {
  const [layers, setLayers] = useState(null);
  const [error, setError] = useState("");
  const [activeLayer, setActiveLayer] = useState("Kesehatan Sawit");
  const [opacity, setOpacity] = useState(0.85);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/map-layers`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil layer dari backend.");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.satellite || !data.boundary || !data.sawitCount) {
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
  }, []);

  return (
    <section className={`map-panel ${compact ? "map-compact" : ""}`}>
      <div className="map-art">

        {layers && (
          <MapContainer
            center={[0.95, 100.32]}
            zoom={11}
            scrollWheelZoom={true}
            className="gee-map"
          >
            <MapResize />

            {/* Citra Sentinel-2 dari GEE */}
            <TileLayer
              url={layers.satellite}
              attribution="Google Earth Engine / Copernicus Sentinel-2"
            />

            {/* Layer klasifikasi sawit */}
            {activeLayer === "Kesehatan Sawit" && (
              <TileLayer
                url={layers.sawitCount}
                opacity={opacity}
                attribution="Google Earth Engine"
              />
            )}

            {/* Batas wilayah Rambah Hilir */}
            <TileLayer
              url={layers.boundary}
              opacity={1}
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
                <strong>Memuat peta Google Earth Engine...</strong>
              </>
            )}
          </div>
        )}

        {/* Pilihan layer tetap mengikuti desain UI */}
        <div className="map-layer-tabs">
          <b>Layer:</b>

          {["RGB", "Deteksi Sawit", "Kesehatan Sawit"].map((item) => (
            <button
              key={item}
              type="button"
              className={activeLayer === item ? "selected" : ""}
              disabled={item === "Deteksi Sawit"}
              title={
                item === "Deteksi Sawit"
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

          {activeLayer === "Kesehatan Sawit" ? (
            <>
              <span>
                <i className="legend-dot healthy" />
                Sawit Sehat
              </span>

              <span>
                <i className="legend-dot sick" />
                Sawit Sakit
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
            <span>Citra Sentinel-2 RGB</span>
          )}

          <hr />
          <span className="legend-muted">
            □ Batas Kecamatan Rambah Hilir
          </span>
        </div>

        <div className="map-place-label">Rambah Hilir</div>

        <div className="map-credit">
          Google Earth Engine · Sentinel-2
        </div>

      </div>
    </section>
  );
}
