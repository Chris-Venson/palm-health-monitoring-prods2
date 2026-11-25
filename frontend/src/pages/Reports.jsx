
import { useState } from "react";
import {
  TreePalm,
  Check,
  AlertCircle,
  Crosshair,
  Download,
} from "lucide-react";

// DAFTAR LENGKAP 16 KECAMATAN
const districts = [
  "Bangun Purba",
  "Bonai Darussalam",
  "Kabun",
  "Kepenuhan",
  "Kepenuhan Hulu",
  "Kunto Darussalam",
  "Pagaran Tapah Darussalam",
  "Pendalian IV Koto",
  "Rambah",
  "Rambah Hilir",
  "Rambah Samo",
  "Rokan IV Koto",
  "Tambusai",
  "Tambusai Utara",
  "Tandun",
  "Ujung Batu",
];

// DATA STATISTIK SEMENTARA
const reportData = [
  {
    name: "Rambah Hilir",
    total: "33.770",
    healthy: "24.780",
    sick: "8.612",
    unknown: "378",
    percentage: "74,21%",
  },
  {
    name: "Tambusai",
    total: "21.340",
    healthy: "16.820",
    sick: "4.520",
    unknown: "210",
    percentage: "78,82%",
  },
  {
    name: "Tambusai Utara",
    total: "18.450",
    healthy: "13.890",
    sick: "4.560",
    unknown: "180",
    percentage: "75,29%",
  },
  {
    name: "Rambah",
    total: "15.230",
    healthy: "11.240",
    sick: "3.990",
    unknown: "160",
    percentage: "73,76%",
  },
  {
    name: "Bangun Purba",
    total: "12.670",
    healthy: "9.340",
    sick: "3.330",
    unknown: "140",
    percentage: "73,84%",
  },
];

const trendHealthy = [78, 83, 85, 90, 93, 95, 94, 89, 80, 76, 81, 85];
const trendSick = [20, 24, 25, 21, 17, 13, 15, 18, 25, 28, 27, 29];

const months = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function Stat({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="report-stat">
      <div className={`report-stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="report-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function TrendChart() {
  const getPoints = (values) =>
    values
      .map((value, index) => {
        const x = 40 + index * 26;
        const y = 145 - (value / 100) * 120;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <section className="report-card trend-card">
      <div className="report-card-heading">
        <h3>Grafik Kesehatan Sawit</h3>
        <div className="chart-legend">
          <span><i className="healthy-dot" /> Sehat</span>
          <span><i className="sick-dot" /> Sakit</span>
        </div>
      </div>

      <div className="trend-chart">
        <div className="chart-y-labels">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="trend-plot">
          <svg viewBox="0 0 340 160" preserveAspectRatio="none">
            {[25, 55, 85, 115, 145].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="340"
                y2={y}
                className="chart-grid-line"
              />
            ))}

            <polyline
              points={getPoints(trendHealthy)}
              className="healthy-line"
            />
            <polyline
              points={getPoints(trendSick)}
              className="sick-line"
            />
          </svg>

          <div className="chart-months">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DistrictChart() {
  return (
    <section className="report-card district-chart-card">
      <div className="report-card-heading">
        <h3>Perbandingan Antar Kecamatan</h3>
        <div className="chart-legend">
          <span><i className="healthy-square" /> Sehat</span>
          <span><i className="sick-square" /> Sakit</span>
        </div>
      </div>

      <div className="district-chart">
        {reportData.map((item) => {
          const healthy = Number(
            item.percentage.replace("%", "").replace(",", ".")
          );
          const sick = 100 - healthy;

          return (
            <div className="district-bar-group" key={item.name}>
              <div className="district-bars">
                <div
                  className="district-bar healthy-bar"
                  style={{ height: `${healthy}%` }}
                  title={`Sehat ${item.percentage}`}
                />
                <div
                  className="district-bar sick-bar"
                  style={{ height: `${sick}%` }}
                  title={`Sakit ${sick.toFixed(2)}%`}
                />
              </div>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HealthDonut() {
  return (
    <section className="report-card donut-card">
      <h3>Proporsi Kesehatan Sawit</h3>

      <div className="report-donut-content">
        <div className="report-donut">
          <div className="report-donut-center">
            <strong>74,96%</strong>
            <span>Sehat</span>
          </div>
        </div>

        <div className="report-donut-legend">
          <div>
            <span><i className="healthy-dot" /> Sawit Sehat</span>
            <small>112.436 Ha</small>
          </div>
          <div>
            <span><i className="sick-dot" /> Sawit Sakit</span>
            <small>37.384 Ha</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function DistrictTable({ data }) {
  return (
    <section className="report-card table-card">
      <h3>Rekapitulasi per Kecamatan</h3>

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kecamatan</th>
              <th>Total (Ha)</th>
              <th>Sehat (Ha)</th>
              <th>Sakit (Ha)</th>
              <th>Tidak terdeteksi</th>
              <th>% Sehat</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.name}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.total}</td>
                <td>{item.healthy}</td>
                <td>{item.sick}</td>
                <td>{item.unknown}</td>
                <td className="percentage-cell">{item.percentage}</td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Data kecamatan belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Reports() {
  const [district, setDistrict] = useState("Semua Kecamatan");
  const [period, setPeriod] = useState("Ags 2024 – Sep 2025");

  const filteredData =
    district === "Semua Kecamatan"
      ? reportData
      : reportData.filter((item) => item.name === district);

  const generateReport = () => {
    window.print();
  };

  return (
    <div className="page report-page">

      <div className="report-filter-row">
        <label className="report-filter">
          <span>PILIH KECAMATAN</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="Semua Kecamatan">Semua Kecamatan</option>

            {districts.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="report-filter">
          <span>PERIODE ANALISIS</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>Ags 2024 – Sep 2025</option>
            <option>Jan 2025 – Jun 2025</option>
          </select>
        </label>

        <button
          className="generate-report-button"
          onClick={generateReport}
        >
          <Download size={15} />
          Generate Laporan
        </button>
      </div>

      <div className="report-stats-grid">
        <Stat
          icon={TreePalm}
          label="Total Sawit"
          value="149.820 Ha"
          note="Kabupaten Rokan Hulu"
          tone="green"
        />
        <Stat
          icon={Check}
          label="Sawit Sehat"
          value="112.436 Ha"
          note="74,96% dari total"
          tone="green"
        />
        <Stat
          icon={AlertCircle}
          label="Sawit Sakit"
          value="37.384 Ha"
          note="25,04% dari total"
          tone="red"
        />
        <Stat
          icon={Crosshair}
          label="Area Analisis"
          value="16 Kecamatan"
          note="Kabupaten Rokan Hulu"
          tone="green"
        />
      </div>

      <div className="report-chart-grid">
        <TrendChart />
        <DistrictChart />
      </div>

      <div className="report-bottom-grid">
        <HealthDonut />
        <DistrictTable data={filteredData} />
      </div>

      <div className="report-footnote">
        Periode: {period} · Wilayah: {district}
      </div>
    </div>
  );
}
