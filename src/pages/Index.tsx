import PhilippinesMap from "@/components/PhilippinesMapMapbox";
import { Navigation, Globe, Shield, LayoutDashboard, Menu, X, RefreshCw, User, UserCheck, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCredentials } from "@/contexts/UserCredentialsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import ThemeToggle from "@/components/ThemeToggle";
import UserLoginModal from "@/components/UserLoginModal";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const { isUserAuthenticated, username, logout } = useUserCredentials();
  const { isMapLocked, isLoading: isSettingsLoading } = useAppSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);

  // Check if user has access to the map
  // Admin users (user) always have access
  // Regular users need to be authenticated if map is locked
  const hasMapAccess = user || !isMapLocked || isUserAuthenticated;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reload the entire page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* PWA Install Prompt - Shows for web/PWA users only */}
      <PWAInstallPrompt />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              <button 
                className="lg:hidden p-1.5 hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div className="bg-primary/10 p-1.5 rounded-lg flex-shrink-0">
                <img src="/globe-icon.svg" alt="Globe" className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">QMAZ HOLDINGS INC. PROJECT MAP</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden md:block truncate">Track and Manage Projects in Map</p>
              </div>
              <div className="sm:hidden min-w-0 flex-1">
                <h1 className="text-sm font-bold text-foreground truncate">QMAZ Project Map</h1>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-2">
              {/* Refresh Button - Mobile Only */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="md:hidden h-7 w-7 p-0 flex-shrink-0"
                aria-label="Refresh application"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <ThemeToggle />
              
              {/* User Authentication Button - Icon Only on Mobile */}
              {isUserAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0">
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="hidden sm:inline sm:ml-2">User</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">
                      Logged in as <span className="font-bold">{username}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-sm cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowUserLogin(true)}
                  className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0"
                  aria-label="User Login"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline sm:ml-2">User Login</span>
                </Button>
              )}
              
              {/* Admin/Dashboard Button - Icon Only on Mobile */}
              {user ? (
                <Link to="/admin/dashboard">
                  <Button variant="default" size="sm" className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0">
                    <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline sm:ml-2">Back to Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/admin/signin">
                  <Button variant="outline" size="sm" className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline sm:ml-2">Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6">
          {/* Sidebar - Mobile Drawer & Desktop Sidebar */}
          <aside className={`
            space-y-4 
            fixed lg:static 
            top-[57px] sm:top-[69px] 
            left-0 
            h-[calc(100vh-57px)] sm:h-auto 
            w-[280px] lg:w-auto 
            bg-background lg:bg-transparent 
            z-[1001] lg:z-auto
            transition-transform duration-300 
            overflow-y-auto
            border-r lg:border-r-0 border-border
            shadow-2xl lg:shadow-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:translate-x-0
          `}>
            <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg border border-border/50 m-2 lg:m-0">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                Quick Start
              </h2>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <p>Use pinch-to-zoom or zoom buttons to zoom in/out</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <p>Touch and drag to pan around the map</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <p>Tap markers to view location details</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg border border-border/50 m-2 lg:m-0">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                About
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>Use the control panel on the map to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enter projects at your location</li>
                  <li>Pin projects anywhere on the map</li>
                  <li>Search for specific places</li>
                </ul>
                <p className="pt-2">Tap any project marker to view details.</p>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-[1000] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Map Container */}
          <div className="bg-card rounded-lg p-2 sm:p-4 shadow-xl border border-border/50">
            <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] min-h-[400px] sm:min-h-[500px]">
              {isSettingsLoading ? (
                /* Loading state */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              ) : !hasMapAccess ? (
                /* Map is locked and user is not authenticated */
                <div className="h-full flex items-center justify-center p-4">
                  <Card className="max-w-md w-full border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-500/20 p-3 rounded-full">
                          <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Map Access Restricted</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Authentication Required
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert className="border-amber-500/50">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <AlertTitle className="text-sm font-medium">Login Required</AlertTitle>
                        <AlertDescription className="text-xs">
                          The map is currently restricted. Please login with your user credentials to view the map and its projects.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={() => setShowUserLogin(true)}
                          className="w-full"
                          size="lg"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Login to View Map
                        </Button>
                        
                        {!user && (
                          <p className="text-xs text-center text-muted-foreground">
                            Admin? <Link to="/admin/signin" className="text-primary hover:underline">Sign in here</Link>
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          💡 <strong>Don't have credentials?</strong> Contact your administrator to get access.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* User has access - show the map */
                <PhilippinesMap />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* User Login Modal */}
      <UserLoginModal open={showUserLogin} onOpenChange={setShowUserLogin} />
    </div>
  );
};

export default Index;
