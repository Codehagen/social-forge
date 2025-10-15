export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'SRV';

export interface DnsRecord {
  type: DnsRecordType;
  name: string;
  value: string;
  priority?: number;
  ttl?: number;
  status?: 'pending' | 'verified' | 'failed';
}

export interface VercelVerificationChallenge {
  type: string;
  domain: string;
  value: string;
  reason?: string;
}

export interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: VercelVerificationChallenge[];
}

export interface VercelDomainConfigResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: VercelVerificationChallenge[];
  configuredBy?: 'CNAME' | 'A' | 'http';
  nameservers?: string[];
  serviceType?: string;
  cnames?: string[];
  aValues?: string[];
  conflicts?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  acceptedChallenges?: string[];
  misconfigured: boolean;
}

export interface AddDomainRequest {
  name: string;
  gitBranch?: string;
  redirect?: string;
  redirectStatusCode?: 301 | 302 | 307 | 308;
}

export interface VercelApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface DomainVerificationResult {
  verified: boolean;
  dnsRecords: DnsRecord[];
  verificationRecords: DnsRecord[];
  error?: string;
}
