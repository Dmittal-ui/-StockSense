"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delay={0}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        {/* Main content area - offset by sidebar width */}
        <div className="pl-[260px] transition-all duration-300">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
