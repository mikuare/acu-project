import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserCog, Eye, EyeOff, Edit, Plus, Loader2, Check, X, Shield, Ban, RotateCcw } from 'lucide-react';

interface UserCredential {
  id: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
  can_search_map: boolean;
  can_pin_project: boolean;
  can_enter_project_by_location: boolean;
  can_input_project_details: boolean;
}

interface ManageUserCredentialsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AdminAuthUser {
  id: string;
  email: string | null;
  full_name: string | null;
  provider: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  is_anonymous: boolean | null;
}

const ManageUserCredentials = ({ open, onOpenChange }: ManageUserCredentialsProps) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<UserCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminAuthUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    can_search_map: true,
    can_pin_project: true,
    can_enter_project_by_location: true,
    can_input_project_details: true,
  });

  const accessOptions = [
    {
      key: 'can_search_map',
      label: 'Search on map',
      description: 'Allow searching places and moving the map to a selected location.',
    },
    {
      key: 'can_pin_project',
      label: 'Pin project manually',
      description: 'Allow clicking the map to place a project pin.',
    },
    {
      key: 'can_enter_project_by_location',
      label: 'Enter by current location',
      description: 'Allow using device GPS/current location to start a project.',
    },
    {
      key: 'can_input_project_details',
      label: 'Input project details',
      description: 'Allow opening and submitting the project details form.',
    },
  ] as const;

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
          can_search_map: data.can_search_map ?? true,
          can_pin_project: data.can_pin_project ?? true,
          can_enter_project_by_location: data.can_enter_project_by_location ?? true,
          can_input_project_details: data.can_input_project_details ?? true,
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

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('list_admin_auth_users');

      if (error) throw error;

      setAdminUsers(data || []);
    } catch (error: any) {
      console.error('Error loading admin users:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to load admin users. Apply the admin user management migration.",
        variant: "destructive",
        duration: 2500,
      });
    } finally {
      setAdminUsersLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCredentials();
      loadAdminUsers();
    }
  }, [open]);

  const formatDateTime = (value: string | null) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
  };

  const isBanned = (adminUser: AdminAuthUser) => {
    if (!adminUser.banned_until) return false;
    return new Date(adminUser.banned_until).getTime() > Date.now();
  };

  const handleToggleAdminBan = async (adminUser: AdminAuthUser) => {
    const shouldBan = !isBanned(adminUser);
    setUpdatingAdminId(adminUser.id);

    try {
      const { error } = await (supabase as any).rpc('set_admin_auth_user_ban', {
        target_user_id: adminUser.id,
        should_ban: shouldBan,
      });

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: shouldBan
          ? "Admin user has been banned/deactivated"
          : "Admin user has been reactivated",
        duration: 2000,
      });
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error updating admin user status:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update admin user status",
        variant: "destructive",
        duration: 2500,
      });
    } finally {
      setUpdatingAdminId(null);
    }
  };

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
            can_search_map: formData.can_search_map,
            can_pin_project: formData.can_pin_project,
            can_enter_project_by_location: formData.can_enter_project_by_location,
            can_input_project_details: formData.can_input_project_details,
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
            can_search_map: formData.can_search_map,
            can_pin_project: formData.can_pin_project,
            can_enter_project_by_location: formData.can_enter_project_by_location,
            can_input_project_details: formData.can_input_project_details,
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
        can_search_map: credentials.can_search_map ?? true,
        can_pin_project: credentials.can_pin_project ?? true,
        can_enter_project_by_location: credentials.can_enter_project_by_location ?? true,
        can_input_project_details: credentials.can_input_project_details ?? true,
      });
    } else {
      setFormData({
        username: '',
        password: '',
        can_search_map: true,
        can_pin_project: true,
        can_enter_project_by_location: true,
        can_input_project_details: true,
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserCog className="w-5 h-5 text-primary" />
            Manage User Credentials
          </DialogTitle>
          <DialogDescription className="text-sm">
            Manage regular-user map credentials and admin users in this system.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="regular" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regular">Regular User Access</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>

          <TabsContent value="regular" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {credentials && !isEditing ? (
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
                            {showPassword ? credentials.password : '********'}
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
                      <div>
                        <Label className="text-xs text-muted-foreground">Access Configuration</Label>
                        <div className="mt-2 grid gap-2 rounded-lg border p-3">
                          {accessOptions.map((option) => (
                            <div key={option.key} className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium">{option.label}</p>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                              </div>
                              <span className={`text-xs font-medium ${credentials[option.key] ? 'text-green-600' : 'text-destructive'}`}>
                                {credentials[option.key] ? 'Allowed' : 'Blocked'}
                              </span>
                            </div>
                          ))}
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
                        Choose a password that's easy to share but secure enough
                      </p>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                      <div>
                        <Label className="text-sm font-medium">Access Configuration</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose which map actions this regular user can perform.
                        </p>
                      </div>
                      {accessOptions.map((option) => (
                        <div key={option.key} className="flex items-start gap-3">
                          <Checkbox
                            id={option.key}
                            checked={formData[option.key]}
                            disabled={saving}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, [option.key]: checked === true })
                            }
                          />
                          <div className="space-y-1 leading-none">
                            <Label htmlFor={option.key} className="text-sm font-medium">
                              {option.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      ))}
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
                        ) : credentials ? (
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
          </TabsContent>

          <TabsContent value="admins" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Users in This System
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Review admin Auth users and ban/deactivate suspicious or anonymous accounts.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAdminUsers} disabled={adminUsersLoading}>
                    <RotateCcw className={`w-4 h-4 mr-2 ${adminUsersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {adminUsersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : adminUsers.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No admin users found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((adminUser) => {
                      const banned = isBanned(adminUser);
                      const isCurrentUser = adminUser.id === user?.id;
                      return (
                        <div key={adminUser.id} className="rounded-lg border p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold break-all">
                                  {adminUser.email || 'No email / anonymous user'}
                                </p>
                                {isCurrentUser && <Badge variant="secondary">You</Badge>}
                                {adminUser.is_anonymous && <Badge variant="destructive">Anonymous</Badge>}
                                <Badge variant={banned ? 'destructive' : 'default'}>
                                  {banned ? 'Banned' : 'Active'}
                                </Badge>
                                {!adminUser.email_confirmed_at && <Badge variant="outline">Unconfirmed</Badge>}
                              </div>
                              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                <p>Name: {adminUser.full_name || 'Not set'}</p>
                                <p>Provider: {adminUser.provider || 'email'}</p>
                                <p>Created: {formatDateTime(adminUser.created_at)}</p>
                                <p>Last sign in: {formatDateTime(adminUser.last_sign_in_at)}</p>
                              </div>
                            </div>
                            <Button
                              variant={banned ? 'outline' : 'destructive'}
                              size="sm"
                              onClick={() => handleToggleAdminBan(adminUser)}
                              disabled={updatingAdminId === adminUser.id || isCurrentUser}
                              title={isCurrentUser ? 'You cannot ban your own signed-in admin account' : undefined}
                            >
                              {updatingAdminId === adminUser.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : banned ? (
                                <RotateCcw className="w-4 h-4 mr-2" />
                              ) : (
                                <Ban className="w-4 h-4 mr-2" />
                              )}
                              {banned ? 'Reactivate' : 'Ban / Deactivate'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ManageUserCredentials;
