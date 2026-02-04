"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyboardShortcutHint } from "@/components/feedback/KeyboardShortcutHint";

export function PreferencesSettings() {
  const [theme, setTheme] = useState("system");
  const [autoExecute, setAutoExecute] = useState("enabled");
  const [rowLimit, setRowLimit] = useState(250);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-1">
        <CardTitle>Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalize how queries run and how the dashboard appears.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Auto-execute queries</label>
            <Select value={autoExecute} onValueChange={setAutoExecute}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default row limit</label>
            <Input
              type="number"
              min={10}
              value={rowLimit}
              onChange={(event) => setRowLimit(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <p className="text-sm font-medium">Keyboard shortcuts</p>
          <div className="mt-3 space-y-2">
            <KeyboardShortcutHint
              keys={["⌘", "Ctrl", "K"]}
              description="Open global search"
            />
            <KeyboardShortcutHint
              keys={["⌘", "Ctrl", "Enter"]}
              description="Run selected query"
            />
            <KeyboardShortcutHint
              keys={["⌘", "Ctrl", "/"]}
              description="Toggle SQL editor hints"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
