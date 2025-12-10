import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LogOut, Edit, Trash2, MapPin, Loader2, Eye, Search, Image as ImageIcon, Menu, X, LayoutGrid, LayoutList, RefreshCw, UserCog, Shield, Flag, CheckCircle } from 'lucide-react';
import EditProjectModal from '@/components/EditProjectModal';
import ViewProjectsModal from '@/components/ViewProjectsModal';
import ManageUserCredentials from '@/components/ManageUserCredentials';
import MapLockSettings from '@/components/MapLockSettings';
import ThemeToggle from '@/components/ThemeToggle';
import ImageViewerModal from '@/components/ImageViewerModal';
import ReportList from '@/components/ReportList';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Project {
  id: string;
  project_id: string;
  description: string;
  status: string;
  project_date: string;
  engineer_name: string;
  user_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_social: string | null;
  branch: "ADC" | "QGDC" | "QMB";
  latitude: number;
  longitude: number;
  image_url: string | null;
  additional_details: string | null;
  created_at: string;
  contract_cost: number | null;
  region: string | null;
  province: string | null;
}

const branchColors = {
  ADC: "bg-[#006D5B] hover:bg-[#005548]",    // Teal Green
  QGDC: "bg-[#000000] hover:bg-[#1a1a1a]",   // Black
  QMB: "bg-[#DC2626] hover:bg-[#B91C1C]",    // Bright Red
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'reports'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserCredentialsModal, setShowUserCredentialsModal] = useState(false);
  const [showMapLockModal, setShowMapLockModal] = useState(false);
  const [pendingReportCount, setPendingReportCount] = useState(0);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReportCount = async () => {
    try {
      const { count, error } = await supabase
        .from('project_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      setPendingReportCount(count || 0);
    } catch (error) {
      console.error('Error loading pending report count:', error);
    }
  };

  useEffect(() => {
    loadProjects();
    loadPendingReportCount();

    // Set up real-time subscription for project changes
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          console.log('Event type:', payload.eventType);
          console.log('Payload data:', payload.new || payload.old);

          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as Project;
            setProjects((current) => {
              // Check if project already exists to avoid duplicates
              if (current.some(p => p.id === newProject.id)) {
                return current;
              }
              return [newProject, ...current];
            });
            toast({
              title: "🆕 New Project Added",
              description: `Project ${newProject.project_id} has been added`,
              duration: 2000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project;
            console.log('Updating project in state:', updatedProject);
            setProjects((current) => {
              const updated = current.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
              );
              console.log('Updated projects list:', updated);
              return updated;
            });
            toast({
              title: "✅ Project Updated",
              description: `Project ${updatedProject.project_id} has been updated`,
              duration: 2000,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setProjects((current) => current.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Set up real-time subscription for report changes
    const reportsChannel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_reports'
        },
        () => {
          // Reload pending report count when any report changes
          loadPendingReportCount();
        }
      )
      .subscribe();

    console.log('Real-time subscription initialized');

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  };

  const handleImageClick = (urls: string[], index: number) => {
    setImageUrls(urls);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete);

      if (error) throw error;

      toast({
        title: "✅ Success",
        description: "Project deleted successfully",
      });

      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reload the entire page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b-4 border-[#FF5722] sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              <button
                className="lg:hidden p-1.5 hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <img
                src="/qmaz-logo-new.png"
                alt="QMAZ Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Welcome, {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
              <div className="sm:hidden min-w-0 flex-1">
                <h1 className="text-sm font-bold text-foreground truncate">Admin</h1>
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
                aria-label="Refresh dashboard"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowViewModal(true)}
                className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8"
              >
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">View & Search Projects</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserCredentialsModal(true)}
                className="hidden lg:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8"
              >
                <UserCog className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>User Credentials</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMapLockModal(true)}
                className="hidden lg:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Map Access</span>
              </Button>
              <Link to="/admin/implementation-tracker">
                <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Implementation</span>
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline sm:ml-2">View Map</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="h-7 w-7 sm:w-auto sm:h-8 p-0 sm:px-3 flex-shrink-0"
                aria-label="Sign Out"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline sm:ml-2">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 bg-card rounded-lg border border-border/50">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Welcome, {user?.user_metadata?.full_name || user?.email}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowViewModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Search className="w-4 h-4" />
                  View & Search Projects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUserCredentialsModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <UserCog className="w-4 h-4" />
                  Manage User Credentials
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowMapLockModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Map Access Settings
                </Button>
                <Link to="/" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MapPin className="w-4 h-4" />
                    View Map
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Project Management</CardTitle>
                <CardDescription className="text-sm">
                  View, edit, and manage all submitted projects
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <LayoutList className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
                <Button
                  variant={viewMode === 'reports' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('reports')}
                  className="gap-2 relative"
                >
                  <Flag className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                  {pendingReportCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingReportCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : viewMode === 'reports' ? (
              <ReportList />
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No projects found</p>
              </div>
            ) : viewMode === 'cards' ? (
              /* Card View for Mobile */
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                              {project.project_id}
                              <Badge className={`${branchColors[project.branch]} text-white text-xs`}>
                                {project.branch}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {format(new Date(project.project_date), 'MMM dd, yyyy')}
                            </CardDescription>
                          </div>
                          {project.image_url && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              {project.image_url.split(',').filter(Boolean).length}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Badge
                            variant={project.status === 'completed' ? 'default' : 'secondary'}
                            className="mb-2"
                          >
                            {project.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">Engineer:</span>
                            <span>{project.engineer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">User:</span>
                            <span>{project.user_name}</span>
                          </div>
                          {project.contact_phone && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">Phone:</span>
                              <span>{project.contact_phone}</span>
                            </div>
                          )}
                          {project.contact_email && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">Email:</span>
                              <span className="truncate">{project.contact_email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">Location:</span>
                            <span className="text-xs">{project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}</span>
                          </div>
                          {(project.region || project.province) && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">Area:</span>
                              <span className="text-xs">{[project.province, project.region].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                          {project.contract_cost && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">Cost:</span>
                              <span className="text-xs font-semibold text-orange-600">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.contract_cost)}
                              </span>
                            </div>
                          )}
                        </div>

                        {project.additional_details && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Additional Details:</p>
                            <p className="text-xs line-clamp-3">{project.additional_details}</p>
                          </div>
                        )}

                        {project.image_url && (
                          <div className="pt-2 border-t">
                            <div className="flex gap-2 overflow-x-auto">
                              {project.image_url.split(',').filter(Boolean).slice(0, 3).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Project ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => handleImageClick(project.image_url?.split(',').filter(Boolean) || [], idx)}
                                />
                              ))}
                              {project.image_url.split(',').filter(Boolean).length > 3 && (
                                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs font-medium cursor-pointer"
                                  onClick={() => handleImageClick(project.image_url?.split(',').filter(Boolean) || [], 3)}>
                                  +{project.image_url.split(',').filter(Boolean).length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(project)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(project.id)}
                            className="flex-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              /* Table View */
              <ScrollArea className="h-[600px] w-full rounded-md border">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="w-[50px]">
                          <ImageIcon className="w-4 h-4 mx-auto" />
                        </TableHead>
                        <TableHead>Project ID</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Region/Province</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Engineer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <>
                          <TableRow
                            key={project.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                          >
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {expandedRow === project.id ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4 opacity-50" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              {project.image_url ? (
                                <Badge variant="secondary" className="text-xs">
                                  {project.image_url.split(',').filter(Boolean).length}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{project.project_id}</TableCell>
                            <TableCell>
                              <Badge className={`${branchColors[project.branch]} text-white`}>
                                {project.branch}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  project.status === 'active' ? 'border-green-500 text-green-700' :
                                    project.status === 'implemented' ? 'border-blue-500 text-blue-700' :
                                      'border-orange-500 text-orange-700'
                                }
                              >
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {project.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{project.province || '-'}</span>
                                <span className="text-[10px] text-muted-foreground">{project.region || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {project.contract_cost ? (
                                <span className="font-medium text-orange-600">
                                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.contract_cost)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>{project.engineer_name}</TableCell>
                            <TableCell>{format(new Date(project.project_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(project)}
                                  className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(project.id)}
                                  className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-9 sm:w-9"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRow === project.id && (
                            <TableRow key={`${project.id}-details`}>
                              <TableCell colSpan={9} className="bg-muted/30">
                                <div className="p-2 sm:p-4 space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Project ID</p>
                                      <p className="text-sm font-semibold">{project.project_id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Branch</p>
                                      <Badge className={`${branchColors[project.branch]} text-white mt-1`}>
                                        {project.branch}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Status</p>
                                      <Badge
                                        variant="outline"
                                        className={`mt-1 ${project.status === 'active' ? 'border-green-500 text-green-700' :
                                          project.status === 'implemented' ? 'border-blue-500 text-blue-700' :
                                            'border-orange-500 text-orange-700'
                                          }`}
                                      >
                                        {project.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Project Engineer</p>
                                      <p className="text-sm">{project.engineer_name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Time Keeper/Checker</p>
                                      <p className="text-sm">{project.user_name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Project Date</p>
                                      <p className="text-sm">{format(new Date(project.project_date), 'PPP')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Location</p>
                                      <p className="text-xs font-mono">
                                        {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                                      </p>
                                    </div>
                                    {project.contact_phone && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                                        <p className="text-sm">{project.contact_phone}</p>
                                      </div>
                                    )}
                                    {project.contact_email && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{project.contact_email}</p>
                                      </div>
                                    )}
                                    {project.contact_social && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Social Media</p>
                                        <p className="text-sm">{project.contact_social}</p>
                                      </div>
                                    )}
                                    <div className="col-span-2 md:col-span-3">
                                      <p className="text-xs font-medium text-muted-foreground">Description</p>
                                      <p className="text-sm mt-1">{project.description}</p>
                                    </div>
                                    {project.additional_details && (
                                      <div className="col-span-2 md:col-span-3">
                                        <p className="text-xs font-medium text-muted-foreground">Additional Details</p>
                                        <p className="text-sm mt-1">{project.additional_details}</p>
                                      </div>
                                    )}
                                    {project.image_url && (() => {
                                      const projectImageUrls = project.image_url.split(',').filter(Boolean).map(url => url.trim());
                                      return projectImageUrls.length > 0 && (
                                        <div className="col-span-2 md:col-span-3">
                                          <p className="text-xs font-medium text-muted-foreground mb-2">
                                            Project Images ({projectImageUrls.length})
                                          </p>
                                          <div className={`grid gap-2 ${projectImageUrls.length === 1 ? 'grid-cols-1 max-w-md' :
                                            projectImageUrls.length === 2 ? 'grid-cols-2' :
                                              'grid-cols-2 md:grid-cols-3'
                                            }`}>
                                            {projectImageUrls.map((url, index) => (
                                              <div
                                                key={index}
                                                className="relative group cursor-pointer"
                                                onClick={() => handleImageClick(projectImageUrls, index)}
                                              >
                                                <img
                                                  src={url}
                                                  alt={`Project ${index + 1}`}
                                                  className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                                                />
                                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                                  {index + 1}/{projectImageUrls.length}
                                                </div>
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                  <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                                    Click to enlarge
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    <div className="col-span-2 md:col-span-3">
                                      <p className="text-xs text-muted-foreground">
                                        Submitted: {format(new Date(project.created_at), 'PPP \'at\' p')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      <EditProjectModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        project={selectedProject}
        onSuccess={() => {
          // Manually reload projects to ensure UI updates
          // (workaround until real-time is fully configured)
          console.log('Edit success - reloading projects to update UI');
          loadProjects();
        }}
      />

      {/* View & Search Projects Modal */}
      <ViewProjectsModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        projects={projects}
        onRefresh={loadProjects}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={imageUrls}
        initialIndex={selectedImageIndex}
      />

      {/* Manage User Credentials Modal */}
      <ManageUserCredentials
        open={showUserCredentialsModal}
        onOpenChange={setShowUserCredentialsModal}
      />

      {/* Map Lock Settings Modal */}
      <MapLockSettings
        open={showMapLockModal}
        onOpenChange={setShowMapLockModal}
      />
    </div >
  );
};

export default Dashboard;

