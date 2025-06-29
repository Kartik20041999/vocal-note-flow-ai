
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter your email address.', 
        variant: 'destructive' 
      });
      return;
    }

    const { error } = await AuthService.signInWithOtp(email);
    if (error) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: 'Check your email', 
        description: 'Login link sent to your inbox.' 
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vocal Notes</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={handleLogin} 
              className="bg-blue-600 text-white hover:bg-blue-700 w-full"
            >
              Send Login Link
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We'll send you a secure login link via email
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
