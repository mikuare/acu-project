import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUserCredentials } from '@/contexts/UserCredentialsContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, UserCheck } from 'lucide-react';

interface UserLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserLoginModal = ({ open, onOpenChange }: UserLoginModalProps) => {
  const { login } = useUserCredentials();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "❌ Error",
        description: "Please enter both username and password",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "✅ Success",
          description: "You are now authenticated!",
          duration: 2000,
        });
        onOpenChange(false);
        setUsername('');
        setPassword('');
      } else {
        toast({
          title: "❌ Error",
          description: "Invalid username or password",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "❌ Error",
        description: "An error occurred during login",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setUsername('');
      setPassword('');
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserCheck className="w-5 h-5 text-primary" />
            User Authentication
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter your credentials to add projects and pin locations on the map.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              className="text-sm"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="text-sm pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Contact your administrator if you don't have credentials
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserLoginModal;

