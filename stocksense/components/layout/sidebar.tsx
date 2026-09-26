"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ClipboardList,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  BookOpen,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", href: "/products", icon: Package },
      { label: "Warehouses", href: "/warehouses", icon: Warehouse },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "All Operations", href: "/operations", icon: ClipboardList },
      { label: "Receipts", href: "/operations/receipts", icon: ArrowDownToLine },
      { label: "Deliveries", href: "/operations/deliveries", icon: ArrowUpFromLine },
      { label: "Transfers", href: "/operations/transfers", icon: ArrowLeftRight },
      { label: "Adjustments", href: "/operations/adjustments", icon: ClipboardCheck },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "Stock Ledger", href: "/ledger", icon: BookOpen },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Assistant", href: "/ai", icon: Sparkles },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              StockSense
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-[18px] h-[18px] shrink-0",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-muted-foreground"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger className="w-full">{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return <li key={item.href}>{linkContent}</li>;
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle & Settings */}
      <div className="shrink-0 border-t border-border p-3 space-y-1">
        {!collapsed && (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
