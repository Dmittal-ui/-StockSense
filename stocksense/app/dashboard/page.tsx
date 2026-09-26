"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  getMockSession,
  clearMockSession,
  subscribeToMockSession,
  type MockSession,
} from "@/lib/mock-auth";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  TruckIcon,
  ClipboardList,
  LogOut,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

function LogoMark() {
  return (
    <div className="relative h-7 w-7 shrink-0">
      <div className="absolute inset-0 rounded-[6px] bg-[#0d3347]" />
      <div className="absolute inset-[3px] rounded-[4px] bg-[#1a5f7a]" />
      <div className="absolute inset-[6px] rounded-[2px] bg-white" />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  accent: string;
}

function KpiCard({ label, value, change, positive, icon: Icon, accent }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}15` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="text-[26px] font-bold leading-none tracking-tight text-[#0d1b2a]">
          {value}
        </p>
        <p
          className={[
            "mt-1.5 flex items-center gap-1 text-[12px] font-medium",
            positive ? "text-emerald-600" : "text-red-500",
          ].join(" ")}
        >
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {change}
        </p>
      </div>
    </div>
  );
}

const MOCK_STOCK = [
  { name: "Wireless Keyboard", sku: "WK-2041", qty: 142, status: "In Stock", statusColor: "#059669" },
  { name: "USB-C Hub 7-Port", sku: "UC-0892", qty: 18, status: "Low Stock", statusColor: "#d97706" },
  { name: "Monitor Stand Arm", sku: "MS-3310", qty: 0, status: "Out of Stock", statusColor: "#ef4444" },
  { name: "Mechanical Mouse", sku: "MM-1174", qty: 67, status: "In Stock", statusColor: "#059669" },
  { name: "HDMI 2.1 Cable 2m", sku: "HD-5521", qty: 5, status: "Low Stock", statusColor: "#d97706" },
];

export default function DashboardPage() {
  const router = useRouter();

  const session: MockSession | null = useSyncExternalStore(
    subscribeToMockSession,
    getMockSession,
    () => null,
  );

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  function handleLogout() {
    clearMockSession();
    router.push("/login");
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0d3347]" aria-label="Checking session…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh bg-[#f8fafc]">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-5">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-tight text-[#0d3347]">
            StockSense
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Sidebar navigation">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Package, label: "Products", active: false },
            { icon: AlertTriangle, label: "Low Stock", active: false },
            { icon: TruckIcon, label: "Deliveries", active: false },
            { icon: ClipboardList, label: "Receipts", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              type="button"
              className={[
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[#0d3347] text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-zinc-100 p-3">
          <div className="mb-2 rounded-lg bg-zinc-50 px-3 py-2.5">
            <p className="truncate text-[12px] font-semibold text-zinc-700">
              {session.name}
            </p>
            <p className="truncate text-[11px] text-zinc-400">{session.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-auto">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-[#0d1b2a]">
              Dashboard
            </h1>
            <p className="text-[13px] text-zinc-400">
              Welcome back, {session.name.split(" ")[0]} 👋
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:hidden"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </header>

        <div className="flex flex-col gap-8 p-8">
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key metrics</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Total Products" value="1,248" change="+12.5% this month" positive icon={Package} accent="#0d3347" />
              <KpiCard label="Low Stock Items" value="24" change="−3 since last week" positive={false} icon={AlertTriangle} accent="#d97706" />
              <KpiCard label="Pending Receipts" value="16" change="+4 new today" positive icon={ClipboardList} accent="#0891b2" />
              <KpiCard label="Pending Deliveries" value="8" change="2 dispatched today" positive icon={TruckIcon} accent="#7c3aed" />
            </div>
          </section>

          <section aria-labelledby="stock-heading" className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 id="stock-heading" className="text-[15px] font-semibold text-[#0d1b2a]">
                Stock Overview
              </h2>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[12px] font-medium text-zinc-500">
                {MOCK_STOCK.length} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-50">
                    <th className="px-6 py-3 text-left font-semibold text-zinc-400">Product</th>
                    <th className="px-6 py-3 text-left font-semibold text-zinc-400">SKU</th>
                    <th className="px-6 py-3 text-right font-semibold text-zinc-400">Qty</th>
                    <th className="px-6 py-3 text-right font-semibold text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STOCK.map((item) => (
                    <tr
                      key={item.sku}
                      className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/60"
                    >
                      <td className="px-6 py-3.5 font-medium text-zinc-800">{item.name}</td>
                      <td className="px-6 py-3.5 font-mono text-zinc-400">{item.sku}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-zinc-700">
                        {item.qty}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            color: item.statusColor,
                            background: `${item.statusColor}15`,
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            aria-labelledby="chart-heading"
            className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
          >
            <h2 id="chart-heading" className="mb-4 text-[15px] font-semibold text-[#0d1b2a]">
              Inventory Activity
            </h2>
            <svg
              viewBox="0 0 600 140"
              className="w-full"
              aria-label="Inventory activity line chart"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d3347" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0d3347" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,110 C50,105 90,90 150,75 C210,60 260,40 320,50 C380,60 420,25 480,30 C520,33 560,40 600,32 L600,140 L0,140 Z"
                fill="url(#dash-area)"
              />
              <path
                d="M0,110 C50,105 90,90 150,75 C210,60 260,40 320,50 C380,60 420,25 480,30 C520,33 560,40 600,32"
                fill="none"
                stroke="#0d3347"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                [0, 110], [150, 75], [320, 50], [480, 30], [600, 32],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#0d3347" />
              ))}
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => (
                <text
                  key={m}
                  x={i * 120}
                  y={135}
                  className="fill-zinc-400 text-[10px]"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {m}
                </text>
              ))}
            </svg>
          </section>
        </div>
      </main>
    </div>
  );
}
