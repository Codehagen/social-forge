/**
 * Email Configuration
 *
 * Handles email environment configuration and development mode overrides.
 *
 * EMAIL_MODE Options:
 * - development: Redirects emails to Resend test addresses for safe testing
 * - production: Sends emails to actual user email addresses
 *
 * Production Deployment:
 * Set EMAIL_MODE=production in your production environment variables,
 * or omit the variable entirely (defaults to production).
 */

export const emailConfig = {
  // Email service configuration
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.RESEND_FROM_EMAIL || "notifications@socialforge.tech",
  fromName: "Social Forge",

  // Environment mode
  mode: (process.env.EMAIL_MODE || "production") as "development" | "production",

  // Test email addresses for development
  testEmails: {
    delivered: "delivered@resend.dev",
    bounced: "bounced@resend.dev",
    complained: "complained@resend.dev",
  },
} as const;

/**
 * Get email address for sending
 *
 * In development mode, redirects to Resend test addresses.
 * In production mode, uses actual user email.
 *
 * @param userEmail - The actual user's email address
 * @param testScenario - Test scenario to simulate (delivered/bounced/complained)
 * @returns Email address to send to
 */
export function getEmailRecipient(
  userEmail: string,
  testScenario: "delivered" | "bounced" | "complained" = "delivered"
): string {
  if (emailConfig.mode === "development") {
    // In development, use test emails with user identifier as label
    const testEmail = emailConfig.testEmails[testScenario];
    const [local, domain] = testEmail.split("@");
    const userIdentifier = userEmail.split("@")[0].replace(/[^a-z0-9]/gi, "");
    return `${local}+${userIdentifier}@${domain}`;
  }

  return userEmail;
}

/**
 * Check if email configuration is valid
 *
 * @returns true if email can be sent
 */
export function isEmailConfigured(): boolean {
  return !!emailConfig.resendApiKey && !!emailConfig.fromEmail;
}

/**
 * Get sender information
 *
 * @returns Formatted sender object
 */
export function getEmailSender() {
  return {
    email: emailConfig.fromEmail,
    name: emailConfig.fromName,
  };
}
