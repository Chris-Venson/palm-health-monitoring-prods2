import { TreePalm, Check, AlertCircle, Crosshair } from "lucide-react";
import StatCard from "../components/StatCard";
import MapPanel from "../components/MapPanel";

const stats = [
  { icon: TreePalm, label: "Total Sawit", value: "149.820 Ha", note: "100% area analisis", tone: "green" },
  { icon: Check, label: "Sawit Sehat", value: "112.436 Ha", note: "74,96% dari total", tone: "green" },
  { icon: AlertCircle, label: "Sawit Sakit", value: "37.384 Ha", note: "25,04% dari total", tone: "red" },
  { icon: Crosshair, label: "Area Analisis", value: "16 Kecamatan", note: "Kabupaten Rokan Hulu", tone: "green" },
];

function HealthDetails() {
  return (
    <aside className="detail-card">
      <h3>Pilih Kecamatan</h3>
      <select defaultValue="Rambah Hilir">
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
      <h3 className="detail-heading">Detail Informasi</h3>
      <div className="donut-wrap">
        <div className="donut"><div><b>74,21%</b><small>Sehat</small></div></div>
        <div className="donut-legend">
          <span><i className="legend-dot healthy" />Sawit Sehat<small>24.780 Ha (74,21%)</small></span>
          <span><i className="legend-dot sick" />Sawit Sakit<small>8.012 Ha (23,75%)</small></span>
          <span><i className="legend-dot unknown" />Tidak Teridentifikasi<small>375 Ha (1,04%)</small></span>
        </div>
      </div>
      <div className="detail-metrics">
        <div><span>Total Sawit</span><b>33.770 Ha</b></div>
        <div><span>Jumlah Petak</span><b>≈ 1.245 Petak</b></div>
        <div><span>Luas Area</span><b>33.770 Ha</b></div>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Beranda</h1>
        <p>Ringkasan kondisi kesehatan perkebunan kelapa sawit</p>
      </div>
      <div className="stats-grid">
        {stats.map((item) => <StatCard key={item.label} {...item} />)}
      </div>
      <div className="dashboard-grid">
        <MapPanel />
        <HealthDetails />
      </div>
    </div>
  );
}
