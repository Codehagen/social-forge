import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    lastLoginMethodClient(),
    stripeClient({
      subscription: true,
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
