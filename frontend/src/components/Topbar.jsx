import { MapPin, CalendarDays, Circle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="location-select">
        <MapPin size={15} />
        <strong>Kabupaten Rokan Hulu</strong>
      </div>

      <div className="topbar-right">
        <span>
          <CalendarDays size={13} />
          Ags 2024 – Sep 2025
        </span>
        <Circle
          size={9}
          className="status-dot"
          fill="currentColor"
        />
      </div>
    </header>
  );
}
