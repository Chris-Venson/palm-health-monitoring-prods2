
import { useState, useEffect } from "react";
import { LayoutDashboard, Map, FileText, Info, Leaf } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SpatialAnalysis from "./pages/SpatialAnalysis";
import Reports from "./pages/Reports";
import About from "./pages/About";

const navigation = [
  { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { id: "spatial", label: "Analisis Spasial", icon: Map },
  { id: "reports", label: "Laporan", icon: FileText },
  { id: "about", label: "Tentang Aplikasi", icon: Info },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const handleNavigate = (event) => {
      setActivePage(event.detail);
    };

    window.addEventListener("navigate-page", handleNavigate);

    return () => {
      window.removeEventListener("navigate-page", handleNavigate);
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        navigation={navigation}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        {activePage === "dashboard" && <Dashboard />}

        {activePage === "spatial" && <SpatialAnalysis />}

        {activePage === "reports" && <Reports />}
        
        {activePage === "about" && <About />}
      </main>
    </div>
  );
}
