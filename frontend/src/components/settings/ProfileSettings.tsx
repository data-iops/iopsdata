"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProfileSettings() {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-1">
        <CardTitle>Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          Keep your account details and security preferences up to date.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Display name
            </label>
            <Input id="display-name" placeholder="Alex Morgan" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email (read-only)
            </label>
            <Input id="email" value="alex@iopsdata.ai" readOnly />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">Change password</Button>
          <Button variant="outline" className="border-red-500/40 text-red-500 hover:bg-red-500/10">
            Delete account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
