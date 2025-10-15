import type {
  AddDomainRequest,
  DnsRecord,
  DomainVerificationResult,
  VercelApiError,
  VercelDomainConfigResponse,
  VercelDomainResponse,
} from './types';

const VERCEL_API_BASE = 'https://api.vercel.com';

interface VercelRequestOptions {
  token: string;
  teamId?: string;
}

async function vercelRequest<T>(
  endpoint: string,
  options: VercelRequestOptions & {
    method?: string;
    body?: unknown;
  }
): Promise<T> {
  const { token, teamId, method = 'GET', body } = options;

  const url = new URL(`${VERCEL_API_BASE}${endpoint}`);
  if (teamId) {
    url.searchParams.set('teamId', teamId);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as
      | VercelApiError
      | Record<string, unknown>;
    const errorMessage =
      'error' in errorData && typeof errorData.error === 'object' && errorData.error && 'message' in errorData.error
        ? String(errorData.error.message)
        : `Vercel API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * Add a custom domain to a Vercel project
 */
export async function addDomainToProject(
  projectIdOrName: string,
  domainRequest: AddDomainRequest,
  options: VercelRequestOptions
): Promise<VercelDomainResponse> {
  return vercelRequest<VercelDomainResponse>(
    `/v10/projects/${projectIdOrName}/domains`,
    {
      ...options,
      method: 'POST',
      body: domainRequest,
    }
  );
}

/**
 * Get domain configuration and verification status
 */
export async function getDomainConfig(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<VercelDomainConfigResponse> {
  return vercelRequest<VercelDomainConfigResponse>(
    `/v9/projects/${projectIdOrName}/domains/${domain}/config`,
    options
  );
}

/**
 * Get basic domain information
 */
export async function getDomain(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<VercelDomainResponse> {
  return vercelRequest<VercelDomainResponse>(
    `/v9/projects/${projectIdOrName}/domains/${domain}`,
    options
  );
}

/**
 * Trigger domain verification
 */
export async function verifyDomain(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<VercelDomainResponse> {
  return vercelRequest<VercelDomainResponse>(
    `/v9/projects/${projectIdOrName}/domains/${domain}/verify`,
    {
      ...options,
      method: 'POST',
    }
  );
}

/**
 * Remove a domain from a project
 */
export async function removeDomain(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<void> {
  await vercelRequest<void>(
    `/v9/projects/${projectIdOrName}/domains/${domain}`,
    {
      ...options,
      method: 'DELETE',
    }
  );
}

/**
 * Parse DNS records from Vercel domain config
 */
function parseDnsRecords(config: VercelDomainConfigResponse): DnsRecord[] {
  const records: DnsRecord[] = [];

  // Add A records
  if (config.aValues && config.aValues.length > 0) {
    config.aValues.forEach((value) => {
      records.push({
        type: 'A',
        name: '@',
        value,
        status: 'pending',
      });
    });
  }

  // Add CNAME records
  if (config.cnames && config.cnames.length > 0) {
    config.cnames.forEach((value) => {
      records.push({
        type: 'CNAME',
        name: config.name.replace(`.${config.apexName}`, ''),
        value,
        status: 'pending',
      });
    });
  }

  return records;
}

/**
 * Parse verification records (TXT records for domain ownership)
 */
function parseVerificationRecords(
  domain: VercelDomainResponse
): DnsRecord[] {
  if (!domain.verification || domain.verification.length === 0) {
    return [];
  }

  return domain.verification.map((challenge) => ({
    type: challenge.type.toUpperCase() as DnsRecord['type'],
    name: challenge.domain,
    value: challenge.value,
    status: 'pending' as const,
  }));
}

/**
 * Get all DNS records needed for domain setup
 */
export async function getDomainVerificationRecords(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<DomainVerificationResult> {
  try {
    // Get both domain info and config
    const [domainInfo, domainConfig] = await Promise.all([
      getDomain(projectIdOrName, domain, options),
      getDomainConfig(projectIdOrName, domain, options),
    ]);

    const dnsRecords = parseDnsRecords(domainConfig);
    const verificationRecords = parseVerificationRecords(domainInfo);

    return {
      verified: domainInfo.verified,
      dnsRecords,
      verificationRecords,
      error: domainConfig.misconfigured
        ? 'Domain is misconfigured. Please check DNS records.'
        : undefined,
    };
  } catch (error) {
    return {
      verified: false,
      dnsRecords: [],
      verificationRecords: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch domain records',
    };
  }
}

/**
 * Check if domain is verified and update status
 */
export async function checkDomainVerification(
  projectIdOrName: string,
  domain: string,
  options: VercelRequestOptions
): Promise<{
  verified: boolean;
  misconfigured: boolean;
  error?: string;
}> {
  try {
    const [domainInfo, domainConfig] = await Promise.all([
      getDomain(projectIdOrName, domain, options),
      getDomainConfig(projectIdOrName, domain, options),
    ]);

    return {
      verified: domainInfo.verified && !domainConfig.misconfigured,
      misconfigured: domainConfig.misconfigured,
      error: domainConfig.misconfigured
        ? 'Domain is misconfigured'
        : undefined,
    };
  } catch (error) {
    return {
      verified: false,
      misconfigured: false,
      error:
        error instanceof Error ? error.message : 'Verification check failed',
    };
  }
}

/**
 * Helper to determine if domain is apex or subdomain
 */
export function isApexDomain(domain: string): boolean {
  const parts = domain.split('.');
  return parts.length === 2;
}

/**
 * Get expected DNS record type for domain
 */
export function getExpectedRecordType(domain: string): 'A' | 'CNAME' {
  return isApexDomain(domain) ? 'A' : 'CNAME';
}
