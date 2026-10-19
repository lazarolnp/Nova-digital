export function XpChart({ data }: { data: { day: string; xp: number }[] }) {
  const w = 640;
  const h = 200;
  const pad = { l: 34, r: 10, t: 12, b: 26 };
  const max = Math.max(20, ...data.map((d) => d.xp));
  const step = (w - pad.l - pad.r) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max);
  const pts = data.map((d, i) => [pad.l + i * step, y(d.xp)] as const);
  const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad.b} L${pad.l},${h - pad.b} Z`;
  const ticks = [0, Math.round(max / 2), max];
  const total = data.reduce((s, d) => s + d.xp, 0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" role="img" aria-label={`XP ganho nos últimos ${data.length} dias: ${total} no total`}>
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid-line" x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
          <text className="axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      <path className="area" d={area} />
      <path className="line" d={line} />
      {data.map((d, i) =>
        i % 2 === 0 || i === data.length - 1 ? (
          <text key={d.day} className="axis" x={pad.l + i * step} y={h - 6} textAnchor="middle">
            {d.day.slice(8, 10)}/{d.day.slice(5, 7)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
