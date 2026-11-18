export default function SimplePage({ title, description }) {
  return (
    <section className="panel placeholder-page">
      <div className="placeholder-mark">PH</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span>Halaman ini disiapkan untuk pengembangan berikutnya.</span>
    </section>
  );
}
