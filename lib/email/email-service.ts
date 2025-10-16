/**
 * Email Service
 *
 * Centralized email sending functionality with development mode support.
 */

import { resend } from "./resend";
import { getEmailRecipient, getEmailSender, emailConfig } from "./email-config";
import type { ReactElement } from "react";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  testScenario?: "delivered" | "bounced" | "complained";
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 *
 * Automatically handles development mode email address override.
 *
 * @param options - Email sending options
 * @returns Result object with success status
 */
export async function sendEmail({
  to,
  subject,
  react,
  testScenario = "delivered",
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    // Get the appropriate recipient (test address in dev, real address in prod)
    const recipient = getEmailRecipient(to, testScenario);
    const sender = getEmailSender();

    // Log in development mode
    if (emailConfig.mode === "development") {
      console.log(
        `📧 [DEV MODE] Sending email to test address: ${recipient} (original: ${to})`
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: recipient,
      subject,
      react,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate email configuration before sending
 *
 * @returns true if email can be sent
 */
export function canSendEmail(): boolean {
  return !!emailConfig.resendApiKey && !!emailConfig.fromEmail;
}
