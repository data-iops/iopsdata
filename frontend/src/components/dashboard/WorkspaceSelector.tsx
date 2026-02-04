"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const workspaces = [
  { id: "core", name: "Core Ops" },
  { id: "analytics", name: "Analytics Lab" },
  { id: "infra", name: "Infra Ops" },
];

export function WorkspaceSelector() {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="text-left">
            <span className="block text-xs text-muted-foreground">Active workspace</span>
            <span className="block text-sm font-medium text-foreground">
              {activeWorkspace.name}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace)}
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-accent">
          <Plus className="h-4 w-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
