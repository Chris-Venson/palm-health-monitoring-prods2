import { Sprout } from "lucide-react";

export default function Sidebar({ navigation, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sprout size={30} strokeWidth={1.8} /></div>
        <div>
          <strong>Palm Health<br />Monitoring</strong>
          <small>KABUPATEN ROKAN HULU</small>
        </div>
      </div>

      <nav className="side-nav">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <strong>Monitoring kesehatan sawit</strong>
        <span>untuk pertanian berkelanjutan<br />di Rokan Hulu</span>
      </div>
    </aside>
  );
}
