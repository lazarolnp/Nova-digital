export function Progress({ value, small, label }: { value: number; small?: boolean; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`progress${small ? " progress-sm" : ""}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progresso"}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
