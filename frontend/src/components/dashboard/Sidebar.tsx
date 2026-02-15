"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, Database, FileText, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/app/providers";
import { WorkspaceSelector } from "@/components/dashboard/WorkspaceSelector";

const navigation = [
  {
    name: "Workspace",
    href: "/",
    icon: Workflow,
  },
  {
    name: "Connections",
    href: "/connections",
    icon: Database,
  },
  {
    name: "Files",
    href: "/files",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { supabase, session } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/80 backdrop-blur transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <Image
            src="/brand/iopsdata-logo.svg"
            alt="iOpsData"
            width={40}
            height={40}
          />
          <div>
            <p className="text-sm font-semibold">iOpsData</p>
            <p className="text-xs text-muted-foreground">Workspace Console</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          <WorkspaceSelector />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate text-left">
                  {session?.user?.email ?? "Signed in"}
                </span>
                <span className="text-xs text-muted-foreground">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
