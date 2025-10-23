import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserCog, Eye, EyeOff, Edit, Plus, Loader2, Check, X } from 'lucide-react';

interface UserCredential {
  id: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface ManageUserCredentialsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageUserCredentials = ({ open, onOpenChange }: ManageUserCredentialsProps) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<UserCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setCredentials(data);
      if (data) {
        setFormData({
          username: data.username,
          password: data.password,
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load user credentials",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCredentials();
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: "❌ Error",
        description: "Username and password are required",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (formData.password.length < 4) {
      toast({
        title: "❌ Error",
        description: "Password must be at least 4 characters",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setSaving(true);
    try {
      if (credentials) {
        // Update existing credentials
        const { error } = await supabase
          .from('user_credentials')
          .update({
            username: formData.username,
            password: formData.password,
            updated_by: user?.id,
          })
          .eq('id', credentials.id);

        if (error) throw error;

        toast({
          title: "✅ Success",
          description: "User credentials updated successfully",
          duration: 2000,
        });
      } else {
        // Create new credentials
        const { error } = await supabase
          .from('user_credentials')
          .insert({
            username: formData.username,
            password: formData.password,
            created_by: user?.id,
            updated_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: "✅ Success",
          description: "User credentials created successfully",
          duration: 2000,
        });
      }

      setIsEditing(false);
      loadCredentials();
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save user credentials",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (credentials) {
      setFormData({
        username: credentials.username,
        password: credentials.password,
      });
    } else {
      setFormData({
        username: '',
        password: '',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserCog className="w-5 h-5 text-primary" />
            Manage User Credentials
          </DialogTitle>
          <DialogDescription className="text-sm">
            Create or edit the shared credentials for regular users to authenticate.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {credentials && !isEditing ? (
              /* Display Mode */
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Current Credentials
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These credentials are active and can be used by regular users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Username</Label>
                    <p className="text-sm font-medium mt-1">{credentials.username}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium font-mono">
                        {showPassword ? credentials.password : '••••••••'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-6 w-6 p-0"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Credentials
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Edit/Create Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    disabled={saving}
                    className="text-sm"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password (min. 4 characters)"
                      disabled={saving}
                      className="text-sm pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={saving}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Choose a password that's easy to share but secure enough
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {credentials ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Update
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!credentials && !isEditing && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <UserCog className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No user credentials have been set up yet
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create User Credentials
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageUserCredentials;

