"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  adminDeletePlatformSetting,
  adminListPlatformSettings,
  adminUpdatePlatformSetting,
} from "@/app/actions/control-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Setting = Awaited<ReturnType<typeof adminListPlatformSettings>> extends Array<infer T>
  ? T
  : never;

type SettingsTableProps = {
  initialSettings: Setting[];
};

export function SettingsTable({ initialSettings }: SettingsTableProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [query, setQuery] = useState("");
  const [isRefreshing, startRefreshTransition] = useTransition();

  const filteredSettings = useMemo(() => {
    if (!query.trim()) {
      return settings;
    }
    const q = query.trim().toLowerCase();
    return settings.filter((setting) => {
      const description = setting.description ?? "";
      const serialized = stringifySettingValue(setting.value);
      return (
        setting.key.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        serialized.toLowerCase().includes(q)
      );
    });
  }, [settings, query]);

  const refresh = useCallback(
    (opts?: { showToast?: boolean }) => {
      startRefreshTransition(async () => {
        try {
          const next = await adminListPlatformSettings();
          setSettings(next);
          if (opts?.showToast) {
            toast.success("Settings updated.");
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to refresh settings.";
          toast.error(message);
        }
      });
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <Label htmlFor="settings-query">Search</Label>
          <Input
            id="settings-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by key, description, or value…"
            autoComplete="off"
            disabled={isRefreshing}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuery("");
            refresh({ showToast: true });
          }}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No settings found. Adjust your filters or create a new setting above.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettings.map((setting) => (
                <SettingRow key={setting.id} setting={setting} refresh={refresh} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function stringifySettingValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function prettifyValue(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function SettingRow({
  setting,
  refresh,
}: {
  setting: Setting;
  refresh: (opts?: { showToast?: boolean }) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = useCallback(() => {
    startDeleteTransition(async () => {
      try {
        await adminDeletePlatformSetting(setting.id);
        toast.success("Setting deleted.");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete setting.";
        toast.error(message);
      }
    });
  }, [setting.id, refresh]);

  return (
    <TableRow>
      <TableCell className="max-w-[220px] font-medium">
        <div className="flex items-center gap-2">
          {setting.key}
          <Badge variant="outline" className="text-xs font-normal uppercase tracking-wide">
            {Array.isArray(setting.value) ? "Array" : typeof setting.value}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="max-w-[240px]">
        {setting.description ? (
          <span className="line-clamp-2 text-sm text-foreground">{setting.description}</span>
        ) : (
          <span className="text-xs text-muted-foreground">No description</span>
        )}
      </TableCell>
      <TableCell className="max-w-[320px] text-xs text-muted-foreground">
        <pre className="max-h-24 overflow-auto rounded-md bg-muted/50 px-2 py-1 font-mono text-xs">
          {stringifySettingValue(setting.value)}
        </pre>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(setting.updatedAt ?? setting.createdAt), {
          addSuffix: true,
        })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </DialogTrigger>
            <EditSettingDialog
              setting={setting}
              onSaved={() => {
                setEditOpen(false);
                refresh();
              }}
            />
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete setting?</AlertDialogTitle>
                <AlertDialogDescription>
                  Removing this setting cannot be undone. Any feature relying on this key will fall
                  back to its defaults.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting…" : "Delete setting"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EditSettingDialog({ setting, onSaved }: { setting: Setting; onSaved: () => void }) {
  const [keyValue, setKeyValue] = useState(setting.key);
  const [description, setDescription] = useState(setting.description ?? "");
  const [rawValue, setRawValue] = useState(() => prettifyValue(setting.value));
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      let value: unknown = rawValue;
      try {
        value = JSON.parse(rawValue);
      } catch {
        // keep string form
      }

      startTransition(async () => {
        try {
          await adminUpdatePlatformSetting({
            id: setting.id,
            key: keyValue.trim() || setting.key,
            description: description.trim() || null,
            value,
          });
          toast.success("Setting updated.");
          onSaved();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update setting.";
          toast.error(message);
        }
      });
    },
    [rawValue, keyValue, description, setting.id, setting.key, onSaved]
  );

  return (
    <DialogContent className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit setting</DialogTitle>
        <DialogDescription>
          Update the key, description, or JSON value. Values are validated before saving.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`setting-key-${setting.id}`}>Key</Label>
          <Input
            id={`setting-key-${setting.id}`}
            value={keyValue}
            onChange={(event) => setKeyValue(event.target.value)}
            spellCheck={false}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`setting-description-${setting.id}`}>Description</Label>
          <Input
            id={`setting-description-${setting.id}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`setting-value-${setting.id}`}>JSON value</Label>
          <Textarea
            id={`setting-value-${setting.id}`}
            value={rawValue}
            onChange={(event) => setRawValue(event.target.value)}
            rows={8}
            spellCheck={false}
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
