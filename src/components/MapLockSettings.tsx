import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Map as MapIcon, Lock, LockOpen, Shield, Loader2, CircleCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLockSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MapLockSettings = ({ open, onOpenChange }: MapLockSettingsProps) => {
  const { isMapLocked, setMapLock, mapboxToken, updateMapboxToken, isLoading } = useAppSettings();
  const [saving, setSaving] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [localLockState, setLocalLockState] = useState(isMapLocked);
  const [localToken, setLocalToken] = useState('');

  useEffect(() => {
    if (open) {
      setLocalToken(mapboxToken || '');
    }
  }, [mapboxToken, open]);

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
          title: checked ? "🔒 Map Locked" : "🔓 Map Unlocked",
          description: checked
            ? "Access now requires user credentials."
            : "Map is now publicly accessible.",
          duration: 3000,
        });
      } else {
        setLocalLockState(!checked);
        toast({
          title: "❌ Error",
          description: "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling map lock:', error);
      setLocalLockState(!checked);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToken = async () => {
    if (!localToken.trim()) {
      toast({
        title: "⚠️ Invallid Token",
        description: "Token cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSavingToken(true);
    try {
      const success = await updateMapboxToken(localToken.trim());
      if (success) {
        toast({
          title: "✅ Token Updated",
          description: "Mapbox configuration saved successfully",
        });
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to save token",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingToken(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0 border bg-background shadow-lg sm:rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2">
          <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" />
            Map Settings
          </DialogTitle>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <Tabs defaultValue="access" className="w-full">
            <div className="px-6 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="access" className="p-0 m-0 focus-visible:ring-0">
              <div className="flex flex-col">
                <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300",
                    localLockState
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  )}>
                    {localLockState ? (
                      <Lock className="w-10 h-10" />
                    ) : (
                      <LockOpen className="w-10 h-10" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {localLockState ? "Private Access Only" : "Public Access Enabled"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                      {localLockState
                        ? "Only users with valid credentials can view the project map."
                        : "Anyone with the link can view the project map without logging in."
                      }
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4 w-full">
                    <span className="text-xl font-bold text-foreground">OFF</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={localLockState}
                      onClick={() => handleToggle(!localLockState)}
                      disabled={saving}
                      className={cn(
                        "relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                        localLockState ? "bg-[#00C853]" : "bg-input"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none block h-8 w-8 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                          localLockState ? "translate-x-10" : "translate-x-0.5"
                        )}
                      />
                    </button>
                    <span className="text-xl font-bold text-foreground">ON</span>
                  </div>
                </div>

                <div className="bg-muted/30 border-t p-6 space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {localLockState ? "Requirements" : "Current Status"}
                    </h4>
                    {localLockState ? (
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm">
                          <CircleCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Users will be prompted to login</span>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <CircleCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Requires active User Credentials</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm">
                          <CircleCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">No login required for map view</span>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <CircleCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Easy sharing via URL</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="p-0 m-0 focus-visible:ring-0">
              <div className="flex flex-col p-6 space-y-6">

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Mapbox Configuration</h3>
                      <p className="text-sm text-muted-foreground">Manage map provider settings</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="token" className="text-sm font-medium">Mapbox Access Token</Label>
                      <Input
                        id="token"
                        value={localToken}
                        onChange={(e) => setLocalToken(e.target.value)}
                        placeholder="pk.eyJ1..."
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground pt-1">
                        Need a token? <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Get it from Mapbox</a>
                      </p>
                    </div>

                    <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                      <strong>Note:</strong> Used for map rendering and navigation. If your free tier is reached, update this token to restore map functionality.
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSaveToken}
                    disabled={savingToken}
                    className="w-full gap-2"
                  >
                    {savingToken ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Update Token
                      </>
                    )}
                  </Button>
                </div>

              </div>
            </TabsContent>
          </Tabs>
        )}

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default MapLockSettings;
