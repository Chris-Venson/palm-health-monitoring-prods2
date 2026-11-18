export default function StatCard({ icon: Icon, label, value, note, tone = "green" }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} strokeWidth={2.4} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={tone === "red" ? "text-red" : ""}>{note}</small>
      </div>
    </article>
  );
}
