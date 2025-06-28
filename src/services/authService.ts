// services/authService.ts
import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async signInWithEmail(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  }

  static async signOut() {
    return await supabase.auth.signOut();
  }

  static async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  static async handleLoginCallback() {
    // This ensures Supabase processes the token from the email link
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
    }

    return data.session;
  }
}
