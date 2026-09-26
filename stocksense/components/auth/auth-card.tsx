export function AuthPanel() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden overflow-hidden lg:flex lg:w-[55%] lg:flex-col"
      style={{
        background: "linear-gradient(145deg, #0a2535 0%, #0d3347 50%, #0e3d55 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "60%",
          height: "50%",
          background: "radial-gradient(ellipse, rgba(26,95,122,0.35) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="absolute -right-2 -top-2 z-0 opacity-[0.18]">
        <DotGrid cols={7} rows={7} size={16} gap={26} />
      </div>
      <div className="absolute -bottom-2 -left-2 z-0 opacity-[0.10]">
        <DotGrid cols={6} rows={6} size={13} gap={22} />
      </div>

      <div className="relative z-10 px-14 pt-16">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4fa8c5]">
          Inventory Platform
        </p>
        <h2 className="text-[28px] font-bold leading-snug tracking-tight text-white">
          Inventory Management
        </h2>
        <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-white/50">
          Join our platform to streamline your inventory processes, reduce
          costs, and enhance productivity.
        </p>
      </div>

      <div className="absolute bottom-0 left-[5%] right-[5%] z-10 flex items-end justify-center pb-0">
        <div
          className="absolute bottom-[-14px] left-[6%] right-[6%] h-24 rounded-t-2xl opacity-20"
          style={{ background: "rgba(255,255,255,0.06)", transform: "rotate(-4deg) scale(0.97)" }}
        />
        <div
          className="absolute bottom-[-7px] left-[3%] right-[3%] h-24 rounded-t-2xl opacity-30"
          style={{ background: "rgba(255,255,255,0.09)", transform: "rotate(-2deg) scale(0.985)" }}
        />

        <div
          className="animate-float-slow relative z-20 w-full overflow-hidden rounded-t-[22px] bg-white shadow-[0_-8px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]"
          style={{ minHeight: "340px" }}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5 shrink-0">
                <div className="absolute inset-0 rounded-[4px] bg-[#0d3347]" />
                <div className="absolute inset-[2px] rounded-[2px] bg-[#1a5f7a]" />
                <div className="absolute inset-[4px] rounded-[1px] bg-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-[#0d3347]">
                StockSense
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>

          <div className="flex" style={{ minHeight: "300px" }}>
            <div className="flex w-[88px] shrink-0 flex-col gap-1 border-r border-zinc-100 bg-[#f8fafc] p-3">
              <div className="flex items-center gap-1.5 rounded-md bg-[#0d3347] px-2 py-1.5">
                <div className="h-2 w-2 rounded-sm bg-white/70" />
                <div className="h-1.5 flex-1 rounded-full bg-white/60" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-md px-2 py-1.5">
                  <div className="h-2 w-2 rounded-sm bg-zinc-200" />
                  <div
                    className="h-1.5 rounded-full bg-zinc-200"
                    style={{ width: `${[65, 80, 55, 70][i - 1]}%` }}
                  />
                </div>
              ))}
              <div className="my-1 h-px bg-zinc-100" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-md px-2 py-1.5">
                  <div className="h-2 w-2 rounded-sm bg-zinc-200" />
                  <div className="h-1.5 w-8 rounded-full bg-zinc-200" />
                </div>
              ))}
            </div>

            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-[#0d3347]/20" />
                <div className="h-6 w-16 rounded-md bg-[#0d3347]/10" />
              </div>

              <div className="mb-4 grid grid-cols-4 gap-2">
                {[
                  { label: "Products", value: "1,248", color: "#0d3347", pct: 70 },
                  { label: "Low Stock", value: "24", color: "#d97706", pct: 30 },
                  { label: "Receipts", value: "16", color: "#0891b2", pct: 55 },
                  { label: "Deliveries", value: "8", color: "#7c3aed", pct: 40 },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-zinc-100 bg-white p-2.5 shadow-sm">
                    <p className="mb-1 text-[7px] font-medium uppercase tracking-wide text-zinc-400">
                      {kpi.label}
                    </p>
                    <p className="text-[13px] font-bold leading-none" style={{ color: kpi.color }}>
                      {kpi.value}
                    </p>
                    <div className="mt-2 h-1 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${kpi.pct}%`, background: kpi.color, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
                    Stock Overview
                  </p>
                  <div className="h-1.5 w-8 rounded-full bg-zinc-200" />
                </div>
                {[
                  { w: 72, badge: "#0d3347" },
                  { w: 55, badge: "#d97706" },
                  { w: 83, badge: "#0891b2" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border-b border-zinc-50 px-3 py-2 last:border-0"
                  >
                    <div className="h-4 w-4 shrink-0 rounded-md bg-zinc-100" />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="h-1.5 rounded-full bg-zinc-200" style={{ width: `${row.w}%` }} />
                      <div className="h-1 w-1/2 rounded-full bg-zinc-100" />
                    </div>
                    <div
                      className="h-1.5 w-6 rounded-full"
                      style={{ background: row.badge, opacity: 0.7 }}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
                    Analytics
                  </p>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-6 rounded-full bg-[#0d3347]/30" />
                    <div className="h-1.5 w-6 rounded-full bg-zinc-200" />
                  </div>
                </div>
                <svg
                  viewBox="0 0 240 56"
                  className="w-full"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d3347" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0d3347" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,48 C25,44 45,36 70,30 C95,24 110,14 135,18 C160,22 175,8 200,12 C215,14 228,18 240,14 L240,56 L0,56 Z"
                    fill="url(#areaFill)"
                  />
                  <path
                    d="M0,48 C25,44 45,36 70,30 C95,24 110,14 135,18 C160,22 175,8 200,12 C215,14 228,18 240,14"
                    fill="none"
                    stroke="#0d3347"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0,52 C25,50 45,46 70,44 C95,42 110,36 135,38 C160,40 175,32 200,34 C215,35 228,36 240,34"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="3 2"
                  />
                  <circle cx="200" cy="12" r="2.5" fill="#0d3347" />
                  <circle cx="200" cy="12" r="5" fill="#0d3347" fillOpacity="0.15" />
                </svg>
                <div className="mt-1.5 flex justify-between px-0.5">
                  {["MON", "TUE", "WED", "THU", "FRI"].map((d) => (
                    <span key={d} className="text-[7px] text-zinc-300">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DotGridProps {
  cols: number;
  rows: number;
  size: number;
  gap: number;
}

function DotGrid({ cols, rows, size, gap }: DotGridProps) {
  const w = cols * gap;
  const h = rows * gap;
  const offset = (gap - size) / 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * gap + offset}
            y={row * gap + offset}
            width={size}
            height={size}
            rx={3}
            fill="white"
          />
        )),
      )}
    </svg>
  );
}
