import { useState } from "react";
import { LayoutDashboard, Map, FileText, Info, Leaf } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
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

  return (
    <div className="app-shell">
      <Sidebar
        navigation={navigation}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <Topbar />
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "spatial" && <SpatialAnalysis />}
        {activePage === "reports" && <Reports />}
        {activePage === "about" && <About />}
      </main>
    </div>
  );
}
