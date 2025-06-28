// pages/Login.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleLogin = async () => {
    const { error } = await AuthService.signInWithEmail(email);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'Login link sent to your inbox.' });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Login with Email</h1>
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleLogin} className="bg-blue-600 text-white hover:bg-blue-700 w-64">
          Send Login Link
        </Button>
      </div>
    </div>
  );
};

export default Login;
