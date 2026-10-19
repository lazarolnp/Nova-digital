export default function Loading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Carregando">
      <div className="card" style={{ height: 80, opacity: 0.5 }} />
      <div className="grid grid-3">
        <div className="card" style={{ height: 160, opacity: 0.4 }} />
        <div className="card" style={{ height: 160, opacity: 0.4 }} />
        <div className="card" style={{ height: 160, opacity: 0.4 }} />
      </div>
    </div>
  );
}
