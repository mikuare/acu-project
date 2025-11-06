import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { toast } from '@/hooks/use-toast';
import { Lock, LockOpen, Shield, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MapLockSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MapLockSettings = ({ open, onOpenChange }: MapLockSettingsProps) => {
  const { isMapLocked, setMapLock, isLoading } = useAppSettings();
  const [saving, setSaving] = useState(false);
  const [localLockState, setLocalLockState] = useState(isMapLocked);

  // Sync local state with context when dialog opens or isMapLocked changes
  useEffect(() => {
    setLocalLockState(isMapLocked);
  }, [isMapLocked, open]);

  const handleToggle = async (checked: boolean) => {
    setLocalLockState(checked);
    setSaving(true);

    try {
      const success = await setMapLock(checked);

      if (success) {
        toast({
          title: "✅ Success",
          description: checked 
            ? "Map is now locked. Users must login to view it."
            : "Map is now public. Anyone can view without login.",
          duration: 3000,
        });
      } else {
        // Revert on failure
        setLocalLockState(!checked);
        toast({
          title: "❌ Error",
          description: "Failed to update map lock setting",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error toggling map lock:', error);
      setLocalLockState(!checked);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="w-5 h-5 text-primary" />
            Map Access Settings
          </DialogTitle>
          <DialogDescription className="text-sm">
            Control whether the map requires user authentication to view
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <Card className={localLockState ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {localLockState ? (
                      <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <LockOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                    <CardTitle className="text-base">
                      {localLockState ? 'Map is Locked' : 'Map is Public'}
                    </CardTitle>
                  </div>
                  <Switch
                    checked={localLockState}
                    onCheckedChange={handleToggle}
                    disabled={saving}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>
                <CardDescription className="text-xs">
                  {localLockState 
                    ? 'Users must login with credentials to view the map'
                    : 'Anyone can view the map without authentication'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Label htmlFor="map-lock" className="text-sm font-medium cursor-pointer">
                    {localLockState ? 'Require Login to View Map' : 'Allow Public Access'}
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-xs sm:text-sm">
                {localLockState ? (
                  <>
                    <strong>Locked Mode:</strong> When the map is locked, regular users will be prompted to 
                    login with the user credentials you've set up. Make sure you've created user credentials 
                    in the "User Credentials" section before locking the map.
                  </>
                ) : (
                  <>
                    <strong>Public Mode:</strong> When the map is public, anyone can view it without logging in. 
                    Users can still optionally login if they choose to. This is the default mode.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {localLockState && (
              <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Important: User Credentials Required
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        To allow users to access the locked map, you must:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                        <li>Create user credentials in the "User Credentials" section</li>
                        <li>Share those credentials with your users</li>
                        <li>Users will use these credentials to login and view the map</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MapLockSettings;

