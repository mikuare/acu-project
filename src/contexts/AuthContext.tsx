import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "✅ Registration Successful!",
          description: "Please check your email to confirm your account before signing in.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
        duration: 2000,
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "✅ Welcome Back!",
          description: "Successfully signed in",
          duration: 2000,
        });
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "❌ Sign In Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
        duration: 2000,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "👋 Signed Out",
        description: "You have been successfully signed out",
        duration: 2000,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "❌ Sign Out Failed",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      console.log('🔐 Password reset attempt:', {
        email,
        redirectUrl,
        origin: window.location.origin
      });

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      console.log('🔐 Reset password response:', { data, error });

      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent successfully');
      toast({
        title: "✅ Password Reset Email Sent",
        description: "Check your email (including spam folder) for the reset link",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ Password reset caught error:', error);
      toast({
        title: "❌ Password Reset Failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "✅ Password Updated Successfully",
        description: "You can now sign in with your new password",
        duration: 2000,
      });

      // Navigate to sign in page
      navigate('/admin/signin');
    } catch (error: any) {
      toast({
        title: "❌ Password Update Failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
        duration: 2000,
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

