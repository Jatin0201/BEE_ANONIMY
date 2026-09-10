import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  plugins: [emailOTPClient()],
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
