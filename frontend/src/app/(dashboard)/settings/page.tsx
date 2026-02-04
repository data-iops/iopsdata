import { LLMSettings } from "@/components/settings/LLMSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Account & workspace</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, configure LLM providers, and customize how iOpsData runs.
        </p>
      </section>

      <div className="space-y-8">
        <ProfileSettings />
        <LLMSettings />
        <PreferencesSettings />
      </div>
    </div>
  );
}
