import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type DnsRecord = {
  type: string;
  name: string;
  value: string;
  ttl?: number | null;
};

type DomainVerificationInstructionsEmailProps = {
  domain: string;
  projectName: string;
  verificationRecords: DnsRecord[];
  routingRecords?: DnsRecord[];
  docsUrl?: string | null;
  verifyUrl?: string | null;
};

const DomainVerificationInstructionsEmail = ({
  domain,
  projectName,
  verificationRecords,
  routingRecords,
  docsUrl,
  verifyUrl,
}: DomainVerificationInstructionsEmailProps) => {
  return (
    <EmailLayout
      heading={`Verify ${domain}`}
      preheader={`Pop in a few DNS records to light up ${domain}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        We’re inches from the finish line! Drop these records into your DNS
        provider so <span className="font-semibold">{projectName}</span> can
        shine at <span className="font-semibold">{domain}</span>. Once they’re
        in, swing back and hit verify.
      </Text>

      <SectionHeading>Step 1 · Prove domain ownership</SectionHeading>
      <RecordTable records={verificationRecords} />

      {routingRecords && routingRecords.length > 0 ? (
        <>
          <SectionHeading>Step 2 · Point traffic to Social Forge</SectionHeading>
          <RecordTable records={routingRecords} />
        </>
      ) : null}

      <Text className="text-[15px] text-[#6B7280] leading-[22px]">
        DNS updates can take up to 24 hours—providers gonna provider. Keep the
        tab handy and we’ll ping you once the lights turn green.
      </Text>

      <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-center">
        {verifyUrl ? (
          <Button
            href={verifyUrl}
            className="bg-[#6366F1] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Verify DNS Records
          </Button>
        ) : null}
        {docsUrl ? (
          <Button
            href={docsUrl}
            className="bg-[#020304] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            View Setup Guide
          </Button>
        ) : null}
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Want a sanity check? Give us a shout once things are set and we’ll run a
        final pass.
      </Text>
    </EmailLayout>
  );
};

export default DomainVerificationInstructionsEmail;

type SectionHeadingProps = {
  children: React.ReactNode;
};

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Text className="text-[15px] font-semibold text-[#020304] leading-[22px]">
      {children}
    </Text>
  );
}

type RecordTableProps = {
  records?: DnsRecord[] | null;
};

function RecordTable({ records }: RecordTableProps) {
  if (!records || records.length === 0) {
    return (
      <Text className="text-[15px] text-[#6B7280] leading-[22px]">
        No additional records needed.
      </Text>
    );
  }

  return (
    <table
      role="presentation"
      className="w-full border border-[#E5E7EB] rounded-[8px] overflow-hidden text-left text-[14px] text-[#020304]"
    >
      <thead className="bg-[#F3F4F6]">
        <tr>
          <th className="px-[16px] py-[12px] font-semibold">Type</th>
          <th className="px-[16px] py-[12px] font-semibold">Name</th>
          <th className="px-[16px] py-[12px] font-semibold">Value</th>
          <th className="px-[16px] py-[12px] font-semibold">TTL</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr
            key={`${record.type}-${record.name}-${index}`}
            className={index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}
          >
            <Cell>{record.type}</Cell>
            <Cell>{record.name || "@"}</Cell>
            <Cell>
              <code className="bg-[#E5E7EB] px-[8px] py-[4px] rounded-[6px] inline-block break-all">
                {record.value}
              </code>
            </Cell>
            <Cell>{record.ttl ? `${record.ttl}s` : "Default"}</Cell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type CellProps = {
  children: React.ReactNode;
};

function Cell({ children }: CellProps) {
  return <td className="px-[16px] py-[12px] align-top">{children}</td>;
}
