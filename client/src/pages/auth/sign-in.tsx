import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, ArrowLeft } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendSignInLink, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Welcome!',
        description: 'You have been signed in successfully.',
      });
      setLocation('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await sendSignInLink(email);
      setEmailSent(true);
      toast({
        title: 'Sign-in link sent!',
        description: 'Check your email for the sign-in link.',
      });
    } catch (error: any) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send sign-in link. Please try Google sign-in instead.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Check your email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-600 mb-4">
                  We've sent a sign-in link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in your email to sign in. The link will expire in 1 hour.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-change-email"
                >
                  Use different email
                </Button>
                
                <Button
                  onClick={() => setLocation('/')}
                  variant="ghost"
                  className="w-full"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Choose your preferred sign-in method
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign-in (Primary) */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full"
              size="lg"
              data-testid="button-google-signin"
            >
              {isGoogleLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="text-xs text-center text-gray-500">
              <p>Current domain: <code className="text-xs bg-gray-100 px-1 rounded">{window.location.origin}</code></p>
              <p className="mt-1">If authentication fails, add this domain to Firebase Console → Authentication → Settings → Authorized domains</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Email Sign-in (Alternative) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                variant="outline"
                className="w-full"
                data-testid="button-send-link"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Sign-in Link
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}