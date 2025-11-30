import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { resetPassword } = useAuth();

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#1a0500]"
      onMouseMove={handleMouseMove}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/50 via-[#1a0500] to-[#1a0500]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[100px]"></div>

        {/* Stars/Particles effect */}
        <div className="absolute inset-0 opacity-30 transition-opacity duration-300"
          style={{
            backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, black 100%)`
          }}>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/admin/signin" className="inline-flex items-center gap-2 text-white/80 mb-6 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <Card className="shadow-2xl border-0 bg-white/100 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-orange-50 rounded-full ring-1 ring-orange-100">
                <KeyRound className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-slate-900">Forgot Password</CardTitle>
            <CardDescription className="text-center text-slate-500">
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>

          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-orange-50/30 border-orange-100 focus:border-orange-500 focus:ring-orange-500/20 transition-all h-11"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    We'll send you a password reset link
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pb-8">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-sm text-center text-slate-500">
                  Remember your password?{' '}
                  <Link to="/admin/signin" className="text-orange-600 hover:text-orange-700 hover:underline font-semibold">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 pb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline" onClick={() => setEmailSent(false)} className="hover:bg-orange-50 hover:text-orange-600 border-slate-200">
                  Try Another Email
                </Button>
                <Link to="/admin/signin">
                  <Button variant="ghost" className="w-full hover:bg-orange-50 hover:text-orange-600">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

