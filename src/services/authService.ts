import { supabase } from "@/integrations/supabase/client";

export const AuthService = {
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async signInWithOtp(email: string) {
    return await supabase.auth.signInWithOtp({ email });
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};
