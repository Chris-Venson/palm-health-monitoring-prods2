import { useState } from "react";
import MapPanel from "../components/MapPanel";

const districts = [
  ["Rambah Hilir", "74,21%"],
  ["Tambusai", "78,82%"],
  ["Tambusai Utara", "75,29%"],
  ["Rambah", "73,76%"],
  ["Bangun Purba", "73,84%"],
];

export default function SpatialAnalysis() {
  const [district, setDistrict] = useState("Semua Kecamatan");
  const [layer, setLayer] = useState("Kesehatan Sawit");
  const [period, setPeriod] = useState("Ags 2024 – Sep 2025");
  const [opacity, setOpacity] = useState(70);

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Analisis Spasial</h1>
        <p>Eksplorasi layer, distribusi, dan kondisi kesehatan sawit secara geografis</p>
      </div>

      <div className="filter-row">
        <label className="filter-box">PILIH KECAMATAN
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option>Semua Kecamatan</option>
            <option>Bangun Purba</option>
            <option>Bonai Darussalam</option>
            <option>Kabun</option>
            <option>Kepenuhan</option>
            <option>Kepenuhan Hulu</option>
            <option>Kunto Darussalam</option>
            <option>Pagaran Tapah Darussalam</option>
            <option>Pendalian IV Koto</option>
            <option>Rambah</option>
            <option>Rambah Hilir</option>
            <option>Rambah Samo</option>
            <option>Rokan IV Koto</option>
            <option>Tambusai</option>
            <option>Tambusai Utara</option>
            <option>Tandun</option>
            <option>Ujung Batu</option>
          </select>
        </label>
        <label className="filter-box">LAYER AKTIF
          <select value={layer} onChange={(e) => setLayer(e.target.value)}>
            <option>RGB</option><option>Deteksi Sawit</option><option>Kesehatan Sawit</option>
          </select>
        </label>
        <label className="filter-box">RENTANG WAKTU
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Ags 2024 – Sep 2025</option><option>Jan 2025 – Jun 2025</option>
          </select>
        </label>
        <button className="export-button" onClick={() => window.print()}>↓ Ekspor Hasil Analisis</button>
      </div>

      <div className="analysis-grid">
        <div className="analysis-main">
          <MapPanel compact />
          <div className="available-layers">
            <strong>Layer tersedia</strong>
            <div className="layer-list">
              <div><b>RGB</b><span>Citra natural color</span></div>
              <div><b>Deteksi Sawit</b><span>Hasil deteksi objek</span></div>
              <div><b>Kesehatan Sawit</b><span>Klasifikasi kesehatan</span></div>
              <div><b>NDVI</b><span>Indeks vegetasi</span></div>
            </div>
          </div>
        </div>

        <aside className="analysis-settings">
          <h3>Pengaturan Analisis</h3>
          <label>Kecamatan<select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option>Semua Kecamatan</option><option>Rambah Hilir</option><option>Tambusai</option><option>Rambah</option>
          </select></label>
          <label>Layer<select value={layer} onChange={(e) => setLayer(e.target.value)}>
            <option>RGB</option><option>Deteksi Sawit</option><option>Kesehatan Sawit</option>
          </select></label>
          <label>Rentang waktu<select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Ags 2024 – Sep 2025</option><option>Jan 2025 – Jun 2025</option>
          </select></label>
          <label className="opacity-label">Transparansi Layer
            <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} />
            <small>{opacity}%</small>
          </label>
          <button className="apply-button">Terapkan Filter</button>
          <div className="district-summary">
            <h3>Ringkasan per Kecamatan</h3>
            {districts.map(([name, value]) => (
              <div className="district-row" key={name}>
                <span>{name}</span><i><b style={{ width: value }} /></i><strong>{value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
