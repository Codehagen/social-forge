/**
 * Resend Client
 *
 * Singleton instance of the Resend email client.
 */

import { Resend } from "resend";
import { emailConfig } from "./email-config";

if (!emailConfig.resendApiKey) {
  console.warn(
    "RESEND_API_KEY is not set. Email functionality will not work."
  );
}

export const resend = new Resend(emailConfig.resendApiKey);
