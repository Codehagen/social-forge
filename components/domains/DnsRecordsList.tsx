"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { DnsRecord } from "@/lib/vercel/types";

interface DnsRecordsListProps {
  records: DnsRecord[];
  title?: string;
  description?: string;
}

export function DnsRecordsList({
  records,
  title = "DNS Records",
  description,
}: DnsRecordsListProps) {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {title && <h4 className="font-medium">{title}</h4>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="space-y-2">
        {records.map((record, index) => (
          <DnsRecordItem key={index} record={record} />
        ))}
      </div>
    </div>
  );
}

function DnsRecordItem({ record }: { record: DnsRecord }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono font-semibold text-primary">
            {record.type}
          </span>
          {record.status === "verified" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <IconCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <RecordField
          label="Name"
          value={record.name}
          onCopy={() => copyToClipboard(record.name, `name-${record.name}`)}
          copied={copied === `name-${record.name}`}
        />

        <RecordField
          label="Value"
          value={record.value}
          onCopy={() => copyToClipboard(record.value, `value-${record.value}`)}
          copied={copied === `value-${record.value}`}
          mono
        />

        {record.priority !== undefined && (
          <RecordField
            label="Priority"
            value={record.priority.toString()}
            onCopy={() =>
              copyToClipboard(
                record.priority!.toString(),
                `priority-${record.priority}`
              )
            }
            copied={copied === `priority-${record.priority}`}
          />
        )}

        {record.ttl && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>TTL: {record.ttl}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordField({
  label,
  value,
  onCopy,
  copied,
  mono = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={`mt-0.5 break-all text-sm ${mono ? "font-mono" : ""}`}
        >
          {value}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 shrink-0 px-2"
        onClick={onCopy}
      >
        {copied ? (
          <IconCheck className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <IconCopy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
