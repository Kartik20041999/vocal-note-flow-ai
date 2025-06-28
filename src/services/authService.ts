// services/authService.ts
import { supabase } from '@/integrations/supabase/client';

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
}
