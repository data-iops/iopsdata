"use client";

import { Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const providerOptions = [
  { label: "OpenAI", value: "openai" },
  { label: "Anthropic", value: "anthropic" },
  { label: "Azure OpenAI", value: "azure" },
  { label: "Google", value: "google" },
];

type HeaderProps = {
  onOpenSidebar: () => void;
};

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [currentProvider, setCurrentProvider] = useState(providerOptions[0].value);
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const breadcrumbs = ["Dashboard", ...segments.map((segment) => segment.replace(/-/g, " "))];

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb}>
              <span className={index === breadcrumbs.length - 1 ? "text-foreground" : undefined}>
                {crumb.charAt(0).toUpperCase() + crumb.slice(1)}
              </span>
              {index < breadcrumbs.length - 1 ? <span className="mx-2 text-muted-foreground">/</span> : null}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground lg:flex">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search"
            className="h-7 border-none bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">LLM</span>
          <Select value={currentProvider} onValueChange={setCurrentProvider}>
            <SelectTrigger className="h-7 w-[160px] border-none bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              {providerOptions.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
