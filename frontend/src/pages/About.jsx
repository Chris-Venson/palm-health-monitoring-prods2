
import {
  Leaf,
  Target,
  LayoutDashboard,
  Map,
  FileText,
  Satellite,
  Database,
  Info,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Menyajikan ringkasan informasi dan statistik kesehatan sawit di Kabupaten Rokan Hulu.",
  },
  {
    icon: Map,
    title: "Analisis Spasial",
    description:
      "Menampilkan informasi geografis dan persebaran area perkebunan sawit melalui peta interaktif.",
  },
  {
    icon: FileText,
    title: "Laporan",
    description:
      "Menyajikan rekapitulasi dan ringkasan hasil analisis berdasarkan wilayah kecamatan.",
  },
];

export default function About() {
  return (
    <div className="page about-page">

      {/* Pengenalan aplikasi */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-eyebrow">
            <Leaf size={16} />
            PALM HEALTH MONITORING
          </div>

          <h2>
            Pemantauan Kesehatan
            <br />
            Perkebunan Kelapa Sawit
          </h2>

          <p>
            Palm Health Monitoring merupakan aplikasi berbasis
            geospasial yang dikembangkan untuk membantu pemantauan
            kondisi perkebunan kelapa sawit di Kabupaten Rokan Hulu
            melalui pemanfaatan data penginderaan jauh dan analisis
            spasial.
          </p>
        </div>
      </section>

      {/* Tujuan aplikasi */}
      <section className="about-section">
        <div className="about-section-heading">
          <Target size={20} />
          <h2>Tujuan Pengembangan</h2>
        </div>

        <p>
          Aplikasi ini bertujuan menyediakan informasi spasial
          mengenai kondisi perkebunan kelapa sawit sehingga
          pengguna dapat memahami persebaran area perkebunan,
          memantau kondisi kesehatannya, serta mengidentifikasi
          wilayah yang memerlukan perhatian lebih lanjut.
        </p>
      </section>

      {/* Fitur aplikasi */}
      <section className="about-section">
        <h2>Fitur Utama Aplikasi</h2>

        <div className="about-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="about-feature-card" key={feature.title}>
                <div className="about-feature-icon">
                  <Icon size={22} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Data dan metode */}
      <section className="about-section">
        <h2>Data dan Teknologi</h2>

        <div className="about-tech-grid">
          <article className="about-tech-card">
            <Satellite size={23} />
            <h3>Google Earth Engine</h3>
            <p>
              Platform komputasi geospasial untuk mengakses
              dan mengolah data penginderaan jauh.
            </p>
          </article>

          <article className="about-tech-card">
            <Database size={23} />
            <h3>Data Spasial</h3>
            <p>
              Menggunakan data citra satelit dan data
              klasifikasi perkebunan sawit yang tersedia
              dalam sistem.
            </p>
          </article>
        </div>
      </section>

      {/* Informasi tambahan */}
      <section className="about-info">
        <Info size={20} />
        <div>
          <h3>Informasi Aplikasi</h3>
          <p>
            Wilayah kajian: Kabupaten Rokan Hulu, Provinsi Riau.
          </p>
          <p>
            Nama aplikasi: Palm Health Monitoring.
          </p>
        </div>
      </section>
    </div>
  );
}
