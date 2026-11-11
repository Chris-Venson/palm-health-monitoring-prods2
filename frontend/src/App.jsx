
import MapView from "./components/MapView";
import "./App.css";

function App() {

    return (

        <div className="dashboard">

            <aside className="sidebar">

                <h2>🌴 Palm Health</h2>
                <p>Monitoring System</p>

                <nav>
                    <div className="active">⌂ Beranda</div>
                    <div>▦ Analisis Spasial</div>
                    <div>▤ Laporan</div>
                    <div>ⓘ Tentang Aplikasi</div>
                </nav>

                <div className="sidebar-footer">
                    Palm Health Monitoring
                    <br />
                    Rokan Hulu, Riau
                </div>

            </aside>


            <main className="main-content">

                <header className="topbar">
                    <span>✥ Kabupaten Rokan Hulu</span>
                    <span>Agustus 2024 – September 2025</span>
                </header>


                <section className="page-heading">

                    <h1>Beranda</h1>

                    <p>
                        Monitoring kondisi perkebunan kelapa sawit
                    </p>

                </section>


                <section className="stats">

                    <div className="stat-card">
                        <span>🌴</span>
                        <div>
                            <small>Area Analisis</small>
                            <h2>Rambah Hilir</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span>🛰️</span>
                        <div>
                            <small>Sumber Data</small>
                            <h2>Sentinel-2</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span>📅</span>
                        <div>
                            <small>Periode Analisis</small>
                            <h2>2024–2025</h2>
                        </div>
                    </div>

                </section>


                <section className="map-section">

                    <div className="map-header">
                        <h3>Peta Analisis Spasial</h3>
                        <span>Rambah Hilir, Rokan Hulu</span>
                    </div>

                    <div className="map-container">
                        <MapView />
                    </div>

                </section>

            </main>

        </div>

    );
}

export default App;
