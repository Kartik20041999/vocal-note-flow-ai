import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/authService";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getUser().then((u) => setUser(u));
    setLoading(false);

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, sess) => {
      setUser(sess?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <Route path="*" element={<Login />} />
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
