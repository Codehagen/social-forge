"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { sendEmail, canSendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/welcome-email";

/**
 * Send welcome email to a user
 *
 * @param userId - The user ID to send the welcome email to
 * @returns Success status
 */
export async function sendWelcomeEmail(userId: string) {
  try {
    // Check if email is configured
    if (!canSendEmail()) {
      console.warn("Email not configured. Skipping welcome email.");
      return { success: false, error: "Email not configured" };
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user || !user.email) {
      throw new Error("User not found or has no email");
    }

    // Send the welcome email
    const result = await sendEmail({
      to: user.email,
      subject: "Welcome to Social Forge! 🎉",
      react: WelcomeEmail(),
    });

    if (result.success) {
      console.log(`Welcome email sent to ${user.email} (ID: ${result.messageId})`);
    }

    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email with authentication check
 *
 * Sends welcome email to the currently authenticated user.
 *
 * @returns Success status
 */
export async function sendWelcomeEmailToCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    return await sendWelcomeEmail(session.user.id);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test email sending with different scenarios
 *
 * Only works in development mode for testing.
 *
 * @param scenario - Test scenario (delivered/bounced/complained)
 * @returns Success status
 */
export async function sendTestEmail(
  scenario: "delivered" | "bounced" | "complained" = "delivered"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Only allow in development mode
    if (process.env.EMAIL_MODE !== "development") {
      throw new Error("Test emails only available in development mode");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user || !user.email) {
      throw new Error("User not found");
    }

    const result = await sendEmail({
      to: user.email,
      subject: `Test Email - ${scenario} scenario`,
      react: WelcomeEmail(),
      testScenario: scenario,
    });

    return result;
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
