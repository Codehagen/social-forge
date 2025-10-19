"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { adminCreatePlatformSetting } from "@/app/actions/control-room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateSettingForm() {
  const [keyValue, setKeyValue] = useState("");
  const [description, setDescription] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!keyValue.trim()) {
        toast.error("Setting key is required.");
        return;
      }
      if (!rawValue.trim()) {
        toast.error("Provide a JSON value for the setting.");
        return;
      }

      let parsedValue: unknown = rawValue.trim();
      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        // Keep raw string; the server will accept non-JSON values as literals.
      }

      startTransition(async () => {
        try {
          await adminCreatePlatformSetting({
            key: keyValue.trim(),
            value: parsedValue,
            description: description.trim() || null,
          });
          toast.success("Setting created.");
          setKeyValue("");
          setDescription("");
          setRawValue("");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create setting.";
          toast.error(message);
        }
      });
    },
    [keyValue, rawValue, description]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="setting-key">Key</Label>
          <Input
            id="setting-key"
            value={keyValue}
            onChange={(event) => setKeyValue(event.target.value)}
            placeholder="feature.flags.alpha"
            autoComplete="off"
            spellCheck={false}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setting-description">Description (optional)</Label>
          <Input
            id="setting-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the flag’s intent"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="setting-value">JSON value</Label>
        <Textarea
          id="setting-value"
          value={rawValue}
          onChange={(event) => setRawValue(event.target.value)}
          placeholder='e.g., {"enabled": true, "rollout": 0.5}'
          disabled={isPending}
          spellCheck={false}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Values are stored as JSON. Provide valid JSON for objects, arrays, or primitives.
        </p>
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Creating…" : "Create setting"}
      </Button>
    </form>
  );
}
