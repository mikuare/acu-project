import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PhilippinesMapMapbox from "@/components/PhilippinesMapMapbox";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";
import ProjectSidebar from "@/components/ProjectSidebar";
import DashboardStats from "@/components/DashboardStats";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import ProjectMapOverlay from "@/components/ProjectMapOverlay";
import ProjectTable from "@/components/ProjectTable";
import { CountUp } from "@/components/ui/CountUp";
import ChatBot from "@/components/ChatBot";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, User, LogOut, UserCheck, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCredentials } from "@/contexts/UserCredentialsContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import ThemeToggle from "@/components/ThemeToggle";
import UserLoginModal from "@/components/UserLoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { user } = useAuth();
  const { isUserAuthenticated, username, logout } = useUserCredentials();
  const { isMapLocked } = useAppSettings();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [currentStatus, setCurrentStatus] = useState<string>('all');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    region: 'all',
    province: 'all',
    year: 'all',
    status: 'all'
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    setDeferredPrompt(null);
  };

  const hasMapAccess = user || !isMapLocked || isUserAuthenticated;

  const availableYears = useMemo(() => {
    const years = projects
      .map(p => {
        if (p.project_date) {
          const date = new Date(p.project_date);
          return date.getFullYear();
        }
        if (p.created_at) {
          const date = new Date(p.created_at);
          return date.getFullYear();
        }
        return null;
      })
      .filter((year): year is number => year !== null);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error fetching projects",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          fetchProjects();
          toast({
            title: "Project Updated",
            description: "The project list has been updated.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let result = [...projects];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.project_id?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.province?.toLowerCase().includes(searchLower) ||
        p.region?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category_type === filters.category);
    }

    if (filters.region && filters.region !== 'all') {
      result = result.filter(p => p.region === filters.region);
    }

    if (filters.province && filters.province !== 'all') {
      result = result.filter(p => p.province === filters.province);
    }

    if (filters.year && filters.year !== 'all') {
      const targetYear = parseInt(filters.year);
      result = result.filter(p => {
        if (p.project_date) {
          const year = new Date(p.project_date).getFullYear();
          return year === targetYear;
        }
        if (p.created_at) {
          const year = new Date(p.created_at).getFullYear();
          return year === targetYear;
        }
        return false;
      });
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }

    if (currentStatus && currentStatus !== 'all') {
      result = result.filter(p => p.status === currentStatus);
    }

    setFilteredProjects(result);
  }, [projects, filters, currentStatus]);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProjectId(projectId);
        setShowProjectDetails(true);
      }
    }
  }, [searchParams, projects]);

  const handleProjectSelect = (project: any) => {
    setSelectedProjectId(project.id);
    setShowProjectDetails(false);
  };

  const handleViewFullDetails = (project: any) => {
    setSelectedProjectId(project.id);
    setShowProjectDetails(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">


      <header className="bg-card/80 backdrop-blur-sm border-b-4 border-[#FF5722] sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/qmaz-logo-new.png"
                alt="QMAZ Logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  QMAZ HOLDINGS INC. PROJECTS MAP
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Track and Manage Project System Implementation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="hover:bg-accent"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              <ThemeToggle />

              {isUserAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">{username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>User Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                !user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserLogin(true)}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                )
              )}

              {deferredPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstallClick}
                  className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  title="Install App"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Install</span>
                </Button>
              )}

              {user ? (
                <Link to="/admin/dashboard">
                  <Button className="gap-2 bg-[#FF5722] hover:bg-[#F4511E]">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/admin/signin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          </div >
        </div >
      </header >

      <main className="container mx-auto p-4">
        {!hasMapAccess ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Map Access Restricted</AlertTitle>
                  <AlertDescription className="mt-2 space-y-4">
                    <p>The map view is currently locked. Please login to access the project map.</p>

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
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <DashboardStats
              projects={filteredProjects}
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
            />

            <SearchFilters
              onFilterChange={handleFilterChange}
              availableYears={availableYears}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              currentStatus={currentStatus}
            />

            {viewMode === 'map' ? (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#FF5722] text-white font-bold text-sm px-4 py-2 rounded-full shadow-md">
                  <img src="/folder-icon.png" alt="Folder" className="w-4 h-4 invert" />
                  <CountUp end={filteredProjects.length} suffix={filteredProjects.length === 1 ? ' Project Found' : ' Projects Found'} />
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full lg:w-80 h-[580px] border-r border-border/50 flex flex-col">
                    <ProjectSidebar
                      projects={filteredProjects}
                      selectedProjectId={selectedProjectId}
                      onProjectSelect={handleProjectSelect}
                      onViewDetails={handleViewFullDetails}
                    />
                  </div>

                  <div className="flex-1 h-[580px] overflow-hidden flex relative">
                    <PhilippinesMapMapbox
                      projects={filteredProjects}
                      onProjectUpdate={fetchProjects}
                      selectedProjectId={selectedProjectId}
                      onProjectSelect={handleProjectSelect}
                    />

                    {selectedProject && (
                      <ProjectMapOverlay
                        project={selectedProject}
                        onViewFullDetails={() => handleViewFullDetails(selectedProject)}
                        onClose={() => setSelectedProjectId(null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <ProjectTable
                projects={filteredProjects}
                onProjectClick={handleViewFullDetails}
              />
            )
            }
          </div>
        )}
      </main>

      {
        showProjectDetails && selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            open={showProjectDetails}
            onOpenChange={setShowProjectDetails}
          />
        )
      }

      <UserLoginModal open={showUserLogin} onOpenChange={setShowUserLogin} />
      <ChatBot projects={filteredProjects} />
    </div >
  );
};

export default Index;
