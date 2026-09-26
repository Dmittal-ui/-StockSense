"use client";

import {
  Bell,
  Search,
  Sparkles,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AiChatSheet } from "@/components/ai/ai-chat-sheet";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export function Topbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, operations..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border rounded bg-muted">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* AI Button */}
          <AiChatSheet />

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDark ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="w-px h-8 bg-border mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                    IM
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">
                    Inventory Manager
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-none mt-1">
                    Admin
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">Inventory Manager</p>
                <p className="text-xs text-muted-foreground">
                  admin@stocksense.com
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
