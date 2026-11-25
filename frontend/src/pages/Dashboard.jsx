
import { useEffect, useState } from "react";
import {
  TreePalm,
  Check,
  AlertCircle,
  Crosshair,
  Loader2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

import StatCard from "../components/StatCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==========================================
// FORMAT DATA
// ==========================================

function formatHa(value) {
  return (
    (value ?? 0).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    }) + " Ha"
  );
}

function formatPct(value) {
  return (
    (value ?? 0).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%"
  );
}

// ==========================================
// DONUT CHART
// ==========================================

function HealthDonut({ data }) {
  const sawit = data?.sawitPct || 0;
  const nonSawit = data?.nonSawitPct || 0;
  const unidentified = data?.unidentifiedPct || 0;

  return (
    <div className="overview-donut-content">
      <div
        className="overview-donut"
        style={{
          background: `conic-gradient(
            #568b59 0% ${sawit}%,
            #df786e ${sawit}% ${sawit + nonSawit}%,
            #c2cbc3 ${sawit + nonSawit}% 100%
          )`,
        }}
      >
        <div className="overview-donut-center">
          <strong>{formatPct(sawit)}</strong>
          <span>Sawit</span>
        </div>
      </div>

      <div className="overview-donut-legend">
        <div>
          <span className="overview-legend-dot green" />

          <section>
            <strong>Sawit</strong>
            <small>
              {formatHa(data?.sawitHa)} ({formatPct(sawit)})
            </small>
          </section>
        </div>

        <div>
          <span className="overview-legend-dot red" />

          <section>
            <strong>Non-Sawit</strong>
            <small>
              {formatHa(data?.nonSawitHa)} ({formatPct(nonSawit)})
            </small>
          </section>
        </div>

        <div>
          <span className="overview-legend-dot gray" />

          <section>
            <strong>Tidak Teridentifikasi</strong>
            <small>
              {formatHa(data?.unidentifiedHa)} ({formatPct(unidentified)})
            </small>
          </section>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DISTRICT COMPARISON CHART
// ==========================================

function DistrictComparison({ data, loading, error }) {
  return (
    <div className="comparison-card-content">
      {loading ? (
        <div className="chart-message">
          Memuat data kecamatan...
        </div>
      ) : error ? (
        <div className="chart-message">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="chart-message">
          Data perbandingan belum tersedia.
        </div>
      ) : (
        <div className="comparison-scroll">
          <div className="comparison-chart">
            {data.map((item) => (
              <div className="comparison-item" key={item.name}>
                <div className="comparison-label">
                  <span>{item.name}</span>
                  <strong>{formatPct(item.sawitPct)}</strong>
                </div>

                <div className="comparison-bar-track">
                  <div
                    className="comparison-bar-fill"
                    style={{
                      width: `${Math.min(item.sawitPct, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD
// ==========================================

export default function Dashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [districtStats, setDistrictStats] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(true);
  const [districtError, setDistrictError] = useState("");

  // ==========================================
  // FETCH MAIN STATISTICS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/statistics?district=${encodeURIComponent(
            "Semua Kecamatan"
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil statistik dari backend."
          );
        }

        const result = await response.json();
        setStatsData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchStatistics();

    return () => controller.abort();
  }, []);

  // ==========================================
  // FETCH STATISTICS FOR ALL DISTRICTS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDistrictStatistics() {
      try {
        setDistrictLoading(true);
        setDistrictError("");

        const response = await fetch(
          `${API_URL}/api/district-comparison`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil perbandingan statistik kecamatan."
          );
        }

        const result = await response.json();
        setDistrictStats(result.districts || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setDistrictError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDistrictLoading(false);
        }
      }
    }

    fetchDistrictStatistics();

    return () => controller.abort();
  }, []);

  // ==========================================
  // STATISTIC CARDS
  // ==========================================

  const cards = [
    {
      icon: TreePalm,
      label: "Total Wilayah",
      value: statsData
        ? formatHa(statsData.totalAreaHa)
        : "...",
      note: "100% area analisis",
      tone: "green",
    },

    {
      icon: Check,
      label: "Sawit",
      value: statsData
        ? formatHa(statsData.sawitHa)
        : "...",
      note: statsData
        ? `${formatPct(statsData.sawitPct)} dari total`
        : "Memuat data...",
      tone: "green",
    },

    {
      icon: AlertCircle,
      label: "Non-Sawit",
      value: statsData
        ? formatHa(statsData.nonSawitHa)
        : "...",
      note: statsData
        ? `${formatPct(statsData.nonSawitPct)} dari total`
        : "Memuat data...",
      tone: "red",
    },

    {
      icon: Crosshair,
      label: "Area Analisis",
      value: "16 Kecamatan",
      note: "Kabupaten Rokan Hulu",
      tone: "green",
    },
  ];

  // ==========================================
  // RENDER DASHBOARD
  // ==========================================

  return (
    <div className="page overview-page">

      {/* STATISTIK UTAMA */}

      <div className="stats-grid">
        {cards.map((item) => (
          <StatCard
            key={item.label}
            {...item}
          />
        ))}
      </div>

      {/* ERROR STATISTIK UTAMA */}

      {error && (
        <div className="overview-error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* GRAFIK UTAMA */}

      <div className="overview-chart-grid">

        {/* DONUT CHART */}

        <section className="overview-card donut-overview-card">
          <div className="overview-card-heading">
            <h3>Kondisi Sawit</h3>
            <span>
              Komposisi hasil klasifikasi
            </span>
          </div>

          {loading ? (
            <div className="overview-loading">
              <Loader2
                className="map-loader"
                size={22}
              />
              <span>
                Memuat statistik GEE...
              </span>
            </div>
          ) : statsData ? (
            <HealthDonut data={statsData} />
          ) : (
            <div className="overview-empty">
              Data statistik belum tersedia.
            </div>
          )}
        </section>

        {/* DISTRICT COMPARISON */}

        <section className="overview-card comparison-overview-card">
          <div className="overview-card-heading">
            <h3>Perbandingan per Kecamatan</h3>
            <span>
              Persentase area sawit
            </span>
          </div>

          <DistrictComparison
            data={districtStats}
            loading={districtLoading}
            error={districtError}
          />
        </section>

      </div>

      {/* TEMUAN PENTING */}

      <section className="overview-insight">
        <div className="overview-insight-icon">
          <Lightbulb size={22} />
        </div>

        <div className="overview-insight-content">
          <strong>Temuan Penting</strong>

          <p>
            {loading
              ? "Sedang memuat ringkasan kondisi wilayah..."
              : statsData
              ? `Sebesar ${formatPct(
                  statsData.sawitPct
                )} dari total wilayah analisis teridentifikasi sebagai area sawit.`
              : "Ringkasan statistik belum dapat ditampilkan karena data gagal dimuat."}
          </p>
        </div>

        <button
          type="button"
          className="overview-detail-button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("navigate-page", {
                detail: "spatial",
              })
            )
          }
        >
          Lihat Analisis
          <ArrowRight size={15} />
        </button>
      </section>

    </div>
  );
}
