import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_LANDING_HEADER_BUTTON, LandingHeaderButtonConfig, useAppSettings } from '@/contexts/AppSettingsContext';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, EyeOff, ExternalLink, KeyRound, Map as MapIcon, Lock, LockOpen, Shield, Loader2, CircleCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_PROJECT_CATEGORIES,
  DEFAULT_PROJECT_STATUSES,
  ProjectCategoryConfig,
  ProjectStatusConfig,
  normalizeProjectCategories,
  normalizeProjectStatuses,
  normalizeStatusValue,
} from '@/utils/categoryIcons';

interface MapLockSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIG_PASSWORD_HASH = '79f293d0e367534f7b4f9f1136d7b43f5125220eaec517443f043cdddc08d024';

const sha256Hex = async (value: string) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const maskToken = (token: string) => {
  const trimmed = token.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.length <= 16) {
    return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
  }

  return `${trimmed.slice(0, 11)}...${trimmed.slice(-4)}`;
};

const MapLockSettings = ({ open, onOpenChange }: MapLockSettingsProps) => {
  const {
    isMapLocked,
    setMapLock,
    mapboxToken,
    updateMapboxToken,
    projectCategories,
    projectStatuses,
    landingHeaderButtons,
    updateProjectCategories,
    updateProjectStatuses,
    updateLandingHeaderButtons,
    isLoading
  } = useAppSettings();
  const [saving, setSaving] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [savingLists, setSavingLists] = useState(false);
  const [savingHeaderButton, setSavingHeaderButton] = useState(false);
  const [localLockState, setLocalLockState] = useState(isMapLocked);
  const [localToken, setLocalToken] = useState('');
  const [localCategories, setLocalCategories] = useState<ProjectCategoryConfig[]>(DEFAULT_PROJECT_CATEGORIES);
  const [localStatuses, setLocalStatuses] = useState<ProjectStatusConfig[]>(DEFAULT_PROJECT_STATUSES);
  const [localHeaderButtons, setLocalHeaderButtons] = useState<LandingHeaderButtonConfig[]>([DEFAULT_LANDING_HEADER_BUTTON]);
  const [configPassword, setConfigPassword] = useState('');
  const [isConfigUnlocked, setIsConfigUnlocked] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalToken(mapboxToken || '');
      setLocalCategories(projectCategories);
      setLocalStatuses(projectStatuses);
      setLocalHeaderButtons(landingHeaderButtons);
      setConfigPassword('');
      setIsConfigUnlocked(false);
      setShowToken(false);
    }
  }, [landingHeaderButtons, mapboxToken, open, projectCategories, projectStatuses]);

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

  const handleUnlockConfig = async () => {
    setIsCheckingPassword(true);

    try {
      const passwordHash = await sha256Hex(configPassword);

      if (passwordHash !== CONFIG_PASSWORD_HASH) {
        toast({
          title: "🔒 Access Denied",
          description: "Incorrect configuration password",
          variant: "destructive",
        });
        return;
      }

      setIsConfigUnlocked(true);
      setConfigPassword('');
      toast({
        title: "✅ Configuration Unlocked",
        description: "You can now manage the Mapbox token.",
      });
    } catch (error) {
      console.error('Error checking configuration password:', error);
      toast({
        title: "❌ Error",
        description: "Unable to verify password in this browser",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleCopyToken = async () => {
    if (!localToken.trim()) {
      toast({
        title: "No token to copy",
        description: "Add a Mapbox token first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(localToken.trim());
      toast({
        title: "✅ Token Copied",
        description: "Mapbox token copied to clipboard.",
      });
    } catch (error) {
      console.error('Error copying token:', error);
      toast({
        title: "❌ Copy Failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
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

  const updateCategoryAt = (index: number, updates: Partial<ProjectCategoryConfig>) => {
    setLocalCategories((current) =>
      current.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, ...updates } : category
      )
    );
  };

  const updateStatusAt = (index: number, updates: Partial<ProjectStatusConfig>) => {
    setLocalStatuses((current) =>
      current.map((status, statusIndex) => {
        if (statusIndex !== index) return status;

        const next = { ...status, ...updates };
        if (updates.label && !updates.value) {
          next.value = normalizeStatusValue(updates.label);
        }
        return next;
      })
    );
  };

  const handleSaveLists = async () => {
    const categories = normalizeProjectCategories(localCategories);
    const statuses = normalizeProjectStatuses(localStatuses);

    setSavingLists(true);
    try {
      const [categoriesSaved, statusesSaved] = await Promise.all([
        updateProjectCategories(categories),
        updateProjectStatuses(statuses),
      ]);

      if (!categoriesSaved || !statusesSaved) {
        toast({
          title: "❌ Error",
          description: "Failed to save category or status configuration",
          variant: "destructive",
        });
        return;
      }

      setLocalCategories(categories);
      setLocalStatuses(statuses);
      toast({
        title: "✅ Configuration Saved",
        description: "Project categories and statuses were updated.",
      });
    } catch (error) {
      console.error('Error saving project lists:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingLists(false);
    }
  };

  const isValidWebsiteUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const updateHeaderButtonAt = (index: number, updates: Partial<LandingHeaderButtonConfig>) => {
    setLocalHeaderButtons((current) =>
      current.map((button, buttonIndex) =>
        buttonIndex === index ? { ...button, ...updates } : button
      )
    );
  };

  const addHeaderButton = () => {
    setLocalHeaderButtons((current) => [
      ...current,
      {
        id: `header-button-${Date.now()}`,
        enabled: true,
        label: '',
        url: '',
      },
    ]);
  };

  const removeHeaderButton = (index: number) => {
    setLocalHeaderButtons((current) => {
      const next = current.filter((_, buttonIndex) => buttonIndex !== index);
      return next.length > 0 ? next : [DEFAULT_LANDING_HEADER_BUTTON];
    });
  };

  const handleSaveHeaderButtons = async () => {
    const nextConfig = localHeaderButtons.map((button, index) => ({
      id: button.id || `header-button-${index + 1}`,
      enabled: button.enabled,
      label: button.label.trim(),
      url: button.url.trim(),
    }));

    const invalidButton = nextConfig.find(
      (button) => button.enabled && (!button.label || !isValidWebsiteUrl(button.url))
    );

    if (invalidButton) {
      toast({
        title: "⚠️ Complete Enabled Buttons",
        description: "Each enabled button needs a name and a full URL starting with http:// or https://.",
        variant: "destructive",
      });
      return;
    }

    setSavingHeaderButton(true);
    try {
      const success = await updateLandingHeaderButtons(nextConfig);

      if (!success) {
        toast({
          title: "❌ Error",
          description: "Failed to save header button configuration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Header Buttons Saved",
        description: "Landing header website buttons were updated.",
      });
    } catch (error) {
      console.error('Error saving header button configuration:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingHeaderButton(false);
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
          <DialogDescription className="sr-only">
            Configure public map access and manage the Mapbox token used for map rendering.
          </DialogDescription>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <Tabs defaultValue="access" className="w-full">
            <div className="px-6 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="config">Mapbox</TabsTrigger>
                <TabsTrigger value="lists">Lists</TabsTrigger>
                <TabsTrigger value="header">Header</TabsTrigger>
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
              {!isConfigUnlocked ? (
                <div className="flex flex-col p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">Configuration Locked</h3>
                        <p className="text-sm text-muted-foreground">Enter the configuration password to manage the Mapbox token.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="config-password" className="text-sm font-medium">Configuration Password</Label>
                      <Input
                        id="config-password"
                        name="mapbox-config-password"
                        type="password"
                        value={configPassword}
                        onChange={(e) => setConfigPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlockConfig()}
                        placeholder="Enter password"
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-1p-ignore="true"
                      />
                    </div>

                    <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground border">
                      The Mapbox public token is masked by default. Access to edit or copy it requires this extra password.
                    </div>
                  </div>

                  <Button
                    onClick={handleUnlockConfig}
                    disabled={isCheckingPassword || !configPassword}
                    className="w-full gap-2"
                  >
                    {isCheckingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Unlock Configuration
                      </>
                    )}
                  </Button>
                </div>
              ) : (
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
                      <div className="flex gap-2">
                        <Input
                          id="token"
                          value={showToken ? localToken : maskToken(localToken)}
                          onChange={(e) => setLocalToken(e.target.value)}
                          readOnly={!showToken}
                          placeholder="pk.eyJ1..."
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowToken((current) => !current)}
                          className="shrink-0 gap-1"
                          title={showToken ? "Hide token" : "Show token"}
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showToken ? "Hide" : "Show"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyToken}
                          className="shrink-0 gap-1"
                          title="Copy token"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Need a token? <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Get it from Mapbox</a>
                      </p>
                    </div>

                    <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                      <strong>Note:</strong> Mapbox public tokens can still be exposed by browsers and mobile apps. Restrict this token in your Mapbox dashboard by allowed domain/app and scopes.
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
              )}
            </TabsContent>

            <TabsContent value="lists" className="p-0 m-0 focus-visible:ring-0">
              {!isConfigUnlocked ? (
                <div className="flex flex-col p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Configuration Locked</h3>
                      <p className="text-sm text-muted-foreground">Unlock the configuration tab first to manage categories and statuses.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-base">Project Categories</h3>
                    <p className="text-sm text-muted-foreground">Edit category names and their icons.</p>
                  </div>

                  <div className="space-y-3">
                    {localCategories.map((category, index) => {
                      const Icon = CATEGORY_ICON_OPTIONS.find((option) => option.value === category.icon)?.icon || MapIcon;

                      return (
                        <div key={`${category.label}-${index}`} className="grid grid-cols-[1fr_150px_auto] gap-2 items-center">
                          <Input
                            value={category.label}
                            onChange={(e) => updateCategoryAt(index, { label: e.target.value })}
                            placeholder="Category name"
                          />
                          <select
                            value={category.icon}
                            onChange={(e) => updateCategoryAt(index, { icon: e.target.value })}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {CATEGORY_ICON_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setLocalCategories((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                            disabled={localCategories.length <= 1}
                            title="Delete category"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <div className="col-span-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon className="w-4 h-4" />
                            <span>Icon preview</span>
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocalCategories((current) => [...current, { label: "New Category", icon: "construction" }])}
                    >
                      Add Category
                    </Button>
                  </div>

                  <div className="border-t pt-5">
                    <h3 className="font-semibold text-base">Project Statuses</h3>
                    <p className="text-sm text-muted-foreground">Edit status labels and saved values.</p>
                  </div>

                  <div className="space-y-3">
                    {localStatuses.map((status, index) => (
                      <div key={`${status.value}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <Input
                          value={status.label}
                          onChange={(e) => updateStatusAt(index, { label: e.target.value })}
                          placeholder="Status label"
                        />
                        <Input
                          value={status.value}
                          onChange={(e) => updateStatusAt(index, { value: normalizeStatusValue(e.target.value) })}
                          placeholder="status_value"
                          className="font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setLocalStatuses((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          disabled={localStatuses.length <= 1}
                          title="Delete status"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocalStatuses((current) => [...current, { label: "New Status", value: "new_status" }])}
                    >
                      Add Status
                    </Button>
                  </div>

                  <Button
                    onClick={handleSaveLists}
                    disabled={savingLists}
                    className="w-full gap-2"
                  >
                    {savingLists ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CircleCheck className="w-4 h-4" />
                        Save Category and Status Lists
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="header" className="p-0 m-0 focus-visible:ring-0">
              <div className="flex max-h-[72vh] flex-col">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Landing Header Buttons</h3>
                      <p className="text-sm text-muted-foreground">
                        Add custom website buttons beside the QMAZ header logo/title.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                  {localHeaderButtons.map((button, index) => (
                    <div key={button.id || index} className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Label className="text-sm font-medium">Button {index + 1}</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Turn on to display this button in the landing page top pane header.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={button.enabled}
                            onClick={() => updateHeaderButtonAt(index, { enabled: !button.enabled })}
                            className={cn(
                              "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              button.enabled ? "bg-[#00C853]" : "bg-input"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none block h-6 w-6 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                                button.enabled ? "translate-x-6" : "translate-x-0.5"
                              )}
                            />
                          </button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeHeaderButton(index)}
                            disabled={localHeaderButtons.length <= 1}
                            title="Remove button"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`landing-header-button-label-${index}`}>Button Name</Label>
                        <Input
                          id={`landing-header-button-label-${index}`}
                          value={button.label}
                          onChange={(e) => updateHeaderButtonAt(index, { label: e.target.value })}
                          placeholder="Example: Company Website"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`landing-header-button-url-${index}`}>Website URL</Label>
                        <Input
                          id={`landing-header-button-url-${index}`}
                          type="url"
                          value={button.url}
                          onChange={(e) => updateHeaderButtonAt(index, { url: e.target.value })}
                          placeholder="https://example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          The button opens this URL in a new tab.
                        </p>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" className="w-full" onClick={addHeaderButton}>
                    Add Website Button
                  </Button>
                </div>

                <div className="border-t bg-background p-6 pt-4">
                  <Button
                    onClick={handleSaveHeaderButtons}
                    disabled={savingHeaderButton}
                    className="w-full gap-2"
                  >
                    {savingHeaderButton ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CircleCheck className="w-4 h-4" />
                        Save Header Buttons
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
