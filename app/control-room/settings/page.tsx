import { Metadata } from "next";

import { adminListPlatformSettings } from "@/app/actions/control-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CreateSettingForm } from "./_components/create-setting-form";
import { SettingsTable } from "./_components/settings-table";

export const metadata: Metadata = {
  title: "Platform settings • Control room",
};

export default async function ControlRoomSettingsPage() {
  const settings = await adminListPlatformSettings();

  return (
    <div className="space-y-10">
      <section id="create-setting" className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage feature flags, operational toggles, and platform-wide configuration with full audit
            control.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Create setting</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateSettingForm />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="manage-settings" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">Existing settings</h2>
          <p className="text-sm text-muted-foreground">
            Every value is stored as JSON. Use this list to review and adjust configuration safely.
          </p>
        </div>
        <SettingsTable initialSettings={settings} />
      </section>
    </div>
  );
}
