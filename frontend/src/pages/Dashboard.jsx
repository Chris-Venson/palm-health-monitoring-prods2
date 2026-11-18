import { useState, useEffect } from "react";
import { TreePalm, Check, AlertCircle, Crosshair, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import MapPanel from "../components/MapPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DISTRICTS = [
  "Rambah Hilir",
  "Semua Kecamatan",
  "Bangun Purba",
  "Bonai Darussalam",
  "Kabun",
  "Kepenuhan",
  "Kepenuhan Hulu",
  "Kunto Darussalam",
  "Pagaran Tapah Darussalam",
  "Pendalian IV Koto",
  "Rambah",
  "Rambah Samo",
  "Rokan IV Koto",
  "Tambusai",
  "Tambusai Utara",
  "Tandun",
  "Ujung Batu",
];

function formatHa(value) {
  if (value === undefined || value === null) return "0 Ha";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " Ha";
}

function formatPct(value) {
  if (value === undefined || value === null) return "0%";
  return value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + "%";
}

function HealthDetails({ selectedDistrict, onSelectDistrict, data, loading, error }) {
  const sawitDeg = data ? (data.sawitPct / 100) * 360 : 0;
  const nonSawitDeg = data ? ((data.sawitPct + data.nonSawitPct) / 100) * 360 : 0;
  const donutStyle = data
    ? {
        background: `conic-gradient(#4c8a51 0deg ${sawitDeg}deg, #e16c60 ${sawitDeg}deg ${nonSawitDeg}deg, #c2cbc3 ${nonSawitDeg}deg 360deg)`,
      }
    : undefined;

  return (
    <aside className="detail-card">
      <h3>Pilih Kecamatan</h3>
      <select
        value={selectedDistrict}
        onChange={(e) => onSelectDistrict(e.target.value)}
      >
        {DISTRICTS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <h3 className="detail-heading">Detail Informasi</h3>

      {loading && (
        <div style={{ padding: "30px 10px", textAlign: "center", color: "#617065", fontSize: "12px" }}>
          <Loader2 size={20} className="map-loader" style={{ margin: "0 auto 8px" }} />
          <span>Menghitung statistik GEE...</span>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: "20px 10px", textAlign: "center", color: "#e16c60", fontSize: "11px" }}>
          Gagal memuat statistik dari GEE.
        </div>
      )}

      {!loading && data && (
        <>
          <div className="donut-wrap">
            <div className="donut" style={donutStyle}>
              <div>
                <b>{formatPct(data.sawitPct)}</b>
                <small>Sawit</small>
              </div>
            </div>
            <div className="donut-legend">
              <span>
                <i className="legend-dot healthy" />
                Sawit
                <small>
                  {formatHa(data.sawitHa)} ({formatPct(data.sawitPct)})
                </small>
              </span>
              <span>
                <i className="legend-dot sick" />
                Non-Sawit
                <small>
                  {formatHa(data.nonSawitHa)} ({formatPct(data.nonSawitPct)})
                </small>
              </span>
              <span>
                <i className="legend-dot unknown" />
                Tidak Teridentifikasi
                <small>
                  {formatHa(data.unidentifiedHa)} ({formatPct(data.unidentifiedPct)})
                </small>
              </span>
            </div>
          </div>

          <div className="detail-metrics">
            <div>
              <span>Luas Sawit</span>
              <b>{formatHa(data.sawitHa)}</b>
            </div>
            <div>
              <span>Luas Non-Sawit</span>
              <b>{formatHa(data.nonSawitHa)}</b>
            </div>
            <div>
              <span>Luas Total Wilayah</span>
              <b>{formatHa(data.totalAreaHa)}</b>
            </div>
          </div>

          {!data.hasData && (
            <p style={{ marginTop: "12px", fontSize: "9px", color: "#8a968d", fontStyle: "italic" }}>
              * Data klasifikasi GEE saat ini tersedia untuk Kecamatan Rambah Hilir.
            </p>
          )}
        </>
      )}
    </aside>
  );
}

export default function Dashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState("Rambah Hilir");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/statistics?district=${encodeURIComponent(selectedDistrict)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal mengambil data statistik");
        }
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          setStatsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDistrict]);

  const cards = [
    {
      icon: TreePalm,
      label: "Total Wilayah",
      value: statsData ? formatHa(statsData.totalAreaHa) : "...",
      note: "100% area analisis",
      tone: "green",
    },
    {
      icon: Check,
      label: "Sawit",
      value: statsData ? formatHa(statsData.sawitHa) : "...",
      note: statsData ? `${formatPct(statsData.sawitPct)} dari total` : "Menghitung...",
      tone: "green",
    },
    {
      icon: AlertCircle,
      label: "Non-Sawit",
      value: statsData ? formatHa(statsData.nonSawitHa) : "...",
      note: statsData ? `${formatPct(statsData.nonSawitPct)} dari total` : "Menghitung...",
      tone: "red",
    },
    {
      icon: Crosshair,
      label: "Area Analisis",
      value: selectedDistrict,
      note: "Kabupaten Rokan Hulu",
      tone: "green",
    },
  ];

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Beranda</h1>
        <p>Ringkasan kondisi perkebunan kelapa sawit berdasarkan klasifikasi Google Earth Engine</p>
      </div>

      <div className="stats-grid">
        {cards.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="dashboard-grid">
        <MapPanel
          district={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
        />
        <HealthDetails
          selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          data={statsData}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
