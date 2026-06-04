import { Fragment, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Edit, Trash2, MapPin, Loader2, Eye, Search, Image as ImageIcon, FileText, Menu, X, LayoutGrid, LayoutList, RefreshCw, UserCog, Shield, Flag, CheckCircle } from 'lucide-react';
import EditProjectModal from '@/components/EditProjectModal';
import ViewProjectsModal from '@/components/ViewProjectsModal';
import ManageUserCredentials from '@/components/ManageUserCredentials';
import MapLockSettings from '@/components/MapLockSettings';
import ThemeToggle from '@/components/ThemeToggle';
import ReportList from '@/components/ReportList';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { splitStoredUrls } from '@/utils/projectMedia';

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
  document_urls: string | null;
  additional_details: string | null;
  created_at: string;
  updated_at: string | null;
  contract_cost: number | null;
  region: string | null;
  province: string | null;
  created_by: string | null;
  created_by_email: string | null;
  updated_by: string | null;
  updated_by_email: string | null;
  created_user_type: string | null;
  created_regular_username: string | null;
}

interface ProjectAuditLog {
  id: string;
  action: string;
  changed_by_email: string | null;
  changed_by_name: string | null;
  regular_username: string | null;
  changed_at: string;
  changes: Record<string, any> | null;
}

const branchColors = {
  ADC: "bg-[#006D5B] hover:bg-[#005548]",    // Teal Green
  QGDC: "bg-[#000000] hover:bg-[#1a1a1a]",   // Black
  QMB: "bg-[#DC2626] hover:bg-[#B91C1C]",    // Bright Red
};

const getImageUrls = (imageUrl: string | null) => splitStoredUrls(imageUrl);
const getDocumentUrls = (documentUrls: string | null) => splitStoredUrls(documentUrls);
const getAttachmentName = (url: string) => {
  const path = url.split('?')[0];
  const fileName = path.split('/').pop();
  return fileName ? decodeURIComponent(fileName) : 'Attachment';
};

interface PhotoInfoForm {
  componentId: string;
  purpose: string;
  dateCaptured: string;
  location: string;
}

const getPhotoFileName = (url: string) => getAttachmentName(url);

const getComponentIdFromPhotoName = (url: string) => {
  const fileName = getPhotoFileName(url);
  return fileName.replace(/\.[^/.]+$/, '').replace(/^\d+_/, '') || 'Project photo';
};

const getUploadedDateFromPhotoName = (url: string, fallbackDate: string) => {
  const fileName = getPhotoFileName(url);
  const timestamp = fileName.match(/^(\d{13})_/)?.[1];
  const parsedDate = timestamp ? new Date(Number(timestamp)) : new Date(fallbackDate);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10);
};

const getUserDisplayName = (user: any) =>
  user?.user_metadata?.full_name ||
  user?.user_metadata?.display_name ||
  user?.user_metadata?.name ||
  user?.email ||
  null;

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
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'reports'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserCredentialsModal, setShowUserCredentialsModal] = useState(false);
  const [showMapLockModal, setShowMapLockModal] = useState(false);
  const [pendingReportCount, setPendingReportCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [auditLogsByProject, setAuditLogsByProject] = useState<Record<string, ProjectAuditLog[]>>({});
  const [photoEditorProject, setPhotoEditorProject] = useState<Project | null>(null);
  const [photoEditorUrl, setPhotoEditorUrl] = useState<string | null>(null);
  const [photoInfoForm, setPhotoInfoForm] = useState<PhotoInfoForm>({
    componentId: "",
    purpose: "attachment",
    dateCaptured: "",
    location: "",
  });
  const [isSavingPhotoInfo, setIsSavingPhotoInfo] = useState(false);

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      project.project_id.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.user_name.toLowerCase().includes(searchLower) ||
      project.branch.toLowerCase().includes(searchLower) ||
      (project.province && project.province.toLowerCase().includes(searchLower)) ||
      (project.region && project.region.toLowerCase().includes(searchLower))
    );
  });

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

  const loadProjectAuditLogs = async (projectId: string) => {
    if (auditLogsByProject[projectId]) return;

    const { data, error } = await (supabase as any)
      .from('project_audit_logs')
      .select('id, action, changed_by_email, changed_by_name, regular_username, changed_at, changes')
      .eq('project_id', projectId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error loading project audit logs:', error);
      return;
    }

    setAuditLogsByProject((current) => ({
      ...current,
      [projectId]: data || [],
    }));
  };

  const handleExpandedRowClick = (projectId: string) => {
    const nextExpandedRow = expandedRow === projectId ? null : projectId;
    setExpandedRow(nextExpandedRow);

    if (nextExpandedRow) {
      void loadProjectAuditLogs(projectId);
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
            setProjects((current) => {
              return current.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
              );
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
      .subscribe();

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

    // Cleanup subscription on unmount
    return () => {
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

  const handlePhotoInfoClick = async (project: Project, url: string) => {
    const defaultForm = {
      componentId: getComponentIdFromPhotoName(url),
      purpose: "attachment",
      dateCaptured: getUploadedDateFromPhotoName(url, project.created_at),
      location: `${project.latitude.toFixed(7)}, ${project.longitude.toFixed(7)}`,
    };

    setPhotoEditorProject(project);
    setPhotoEditorUrl(url);
    setPhotoInfoForm(defaultForm);

    const { data, error } = await (supabase as any)
      .from('project_photo_metadata')
      .select('component_id, purpose, date_captured, location')
      .eq('project_id', project.id)
      .eq('photo_url', url)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading photo metadata:', error);
      toast({
        title: "Photo metadata unavailable",
        description: "Using default values until the metadata table is available.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setPhotoInfoForm({
        componentId: data.component_id || defaultForm.componentId,
        purpose: data.purpose || defaultForm.purpose,
        dateCaptured: data.date_captured || defaultForm.dateCaptured,
        location: data.location || defaultForm.location,
      });
    }
  };

  const handleSavePhotoInfo = async () => {
    if (!photoEditorProject || !photoEditorUrl) return;

    setIsSavingPhotoInfo(true);
    try {
      const { error } = await (supabase as any)
        .from('project_photo_metadata')
        .upsert(
          {
            project_id: photoEditorProject.id,
            photo_url: photoEditorUrl,
            component_id: photoInfoForm.componentId.trim() || null,
            purpose: photoInfoForm.purpose.trim() || 'attachment',
            date_captured: photoInfoForm.dateCaptured || null,
            location: photoInfoForm.location.trim() || null,
            updated_by: user?.id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id,photo_url' },
        );

      if (error) throw error;

      const { error: auditError } = await (supabase as any)
        .from('project_audit_logs')
        .insert({
          project_id: photoEditorProject.id,
          action: 'photo_metadata_updated',
          changed_by: user?.id ?? null,
          changed_by_email: user?.email ?? null,
          changed_by_name: getUserDisplayName(user),
          changes: {
            photo_url: photoEditorUrl,
            component_id: photoInfoForm.componentId.trim() || null,
            purpose: photoInfoForm.purpose.trim() || 'attachment',
            date_captured: photoInfoForm.dateCaptured || null,
            location: photoInfoForm.location.trim() || null,
          },
        });

      if (auditError) {
        console.error('Error saving photo metadata audit log:', auditError);
      }

      toast({
        title: "Photo information saved",
        description: "This photo metadata will now show in project details.",
      });
      setPhotoEditorProject(null);
      setPhotoEditorUrl(null);
    } catch (error: any) {
      console.error('Error saving photo metadata:', error);
      toast({
        title: "Could not save photo information",
        description: error.message || "Apply the photo metadata migration, then try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPhotoInfo(false);
    }
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
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Branding Section */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img
                  src="/qmaz-logo-new.png"
                  alt="QMAZ Logo"
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <h1 className="text-base sm:text-lg font-bold leading-none tracking-tight text-foreground truncate">
                    <span className="md:hidden">Admin</span>
                    <span className="hidden md:inline">Admin Dashboard</span>
                  </h1>
                  <span className="text-xs text-muted-foreground truncate hidden sm:inline-block">
                    Welcome, {user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.user_metadata?.name || user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-1 sm:gap-2">


              <div className="hidden md:flex items-center gap-2 mr-2 border-r pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewModal(true)}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Projects
                </Button>

                <Link to="/admin/implementation-tracker">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Tracker
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUserCredentialsModal(true)}
                    title="User Credentials"
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMapLockModal(true)}
                    title="Map Access"
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/">
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Map
                  </Button>
                </Link>
                {/* Mobile Refresh */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="md:hidden flex-shrink-0"
                  aria-label="Refresh dashboard"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg p-4 animate-in slide-in-from-top-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Signed in as</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setShowViewModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Search className="w-4 h-4" />
                    Search Projects
                  </Button>

                  <Link to="/admin/implementation-tracker" className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Implementation Tracker
                    </Button>
                  </Link>
                </div>

                <div className="pb-4 border-b">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 px-2">Settings</h4>
                  <div className="grid gap-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        setShowUserCredentialsModal(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <UserCog className="w-4 h-4" />
                      User Credentials
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        setShowMapLockModal(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Shield className="w-4 h-4" />
                      Map Access
                    </Button>
                  </div>
                </div>

                <Link to="/" className="block">
                  <Button variant="default" className="w-full gap-2">
                    <MapPin className="w-4 h-4" />
                    View Main Map
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
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-project-search"
                  name="admin-project-search"
                  type="search"
                  placeholder="Search by time keeper/checker, branch, project ID, location or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="pl-9"
                />
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
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No projects found</p>
              </div>
            ) : viewMode === 'cards' ? (
              /* Card View for Mobile */
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
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
                          <div className="ml-2 flex flex-col items-end gap-1">
                            {getImageUrls(project.image_url).length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <ImageIcon className="w-3 h-3 mr-1" />
                                {getImageUrls(project.image_url).length}
                              </Badge>
                            )}
                            {getDocumentUrls(project.document_urls).length > 0 && (
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                                <FileText className="w-3 h-3 mr-1" />
                                {getDocumentUrls(project.document_urls).length}
                              </Badge>
                            )}
                          </div>
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

                        {project.image_url && (() => {
                          const projectImageUrls = getImageUrls(project.image_url);

                          return projectImageUrls.length > 0 && (
                            <div className="pt-2 border-t">
                              <div
                                className="relative h-16 w-16 cursor-pointer overflow-hidden rounded"
                                onClick={() => handlePhotoInfoClick(project, projectImageUrls[0])}
                              >
                                <img
                                  src={projectImageUrls[0]}
                                  alt="Project preview"
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover transition-opacity hover:opacity-80"
                                />
                                {projectImageUrls.length > 1 && (
                                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                    +{projectImageUrls.length - 1}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

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
                        <TableHead className="w-[80px]">
                          <div className="flex items-center justify-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <FileText className="w-4 h-4" />
                          </div>
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
                      {filteredProjects.map((project) => (
                        <Fragment key={project.id}>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleExpandedRowClick(project.id)}
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
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                {getImageUrls(project.image_url).length > 0 && (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {getImageUrls(project.image_url).length}
                                  </Badge>
                                )}
                                {getDocumentUrls(project.document_urls).length > 0 && (
                                  <Badge variant="outline" className="text-xs gap-1 border-blue-500 text-blue-700">
                                    <FileText className="w-3 h-3" />
                                    {getDocumentUrls(project.document_urls).length}
                                  </Badge>
                                )}
                                {getImageUrls(project.image_url).length === 0 && getDocumentUrls(project.document_urls).length === 0 && (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </div>
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
                            <TableRow>
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
                                      <p className="text-xs font-medium text-muted-foreground">Created in System</p>
                                      <p className="text-sm">{format(new Date(project.created_at), 'PPP p')}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {project.created_user_type === 'regular'
                                          ? `By regular user ${project.created_regular_username || 'Unknown'}`
                                          : project.created_by_email
                                            ? `By admin ${project.created_by_email}`
                                            : 'Creator not recorded'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">Last Edited</p>
                                      <p className="text-sm">
                                        {project.updated_at ? format(new Date(project.updated_at), 'PPP p') : 'Not edited yet'}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {project.updated_by_email ? `By ${project.updated_by_email}` : 'Editor not recorded'}
                                      </p>
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
                                      const projectImageUrls = getImageUrls(project.image_url);
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
                                                onClick={() => handlePhotoInfoClick(project, url)}
                                              >
                                                <img
                                                  src={url}
                                                  alt={`Project ${index + 1}`}
                                                  loading={index === 0 ? "eager" : "lazy"}
                                                  decoding="async"
                                                  className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                                                />
                                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                                  {index + 1}/{projectImageUrls.length}
                                                </div>
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                  <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium">
                                                    Edit photo info
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    {project.document_urls && (() => {
                                      const projectDocumentUrls = getDocumentUrls(project.document_urls);
                                      return projectDocumentUrls.length > 0 && (
                                        <div className="col-span-2 md:col-span-3">
                                          <p className="text-xs font-medium text-muted-foreground mb-2">
                                            Project Files ({projectDocumentUrls.length})
                                          </p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {projectDocumentUrls.map((url, index) => (
                                              <a
                                                key={url}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border bg-background p-2 text-sm hover:bg-muted"
                                                onClick={(event) => event.stopPropagation()}
                                              >
                                                <FileText className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                                <span className="min-w-0 flex-1 truncate">
                                                  {getAttachmentName(url)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    <div className="col-span-2 md:col-span-3 rounded-lg border bg-background p-3">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">Audit Trail</p>
                                      {auditLogsByProject[project.id]?.length > 0 ? (
                                        <div className="space-y-2">
                                          {auditLogsByProject[project.id].map((log) => {
                                            const changedFields = log.changes ? Object.keys(log.changes) : [];
                                            return (
                                              <div key={log.id} className="rounded-md bg-muted/50 p-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                  <p className="text-sm font-medium capitalize">{log.action}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {format(new Date(log.changed_at), 'PPP p')}
                                                  </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  By {log.regular_username
                                                    ? `regular user ${log.regular_username}`
                                                    : log.changed_by_name || log.changed_by_email || 'Unknown admin'}
                                                </p>
                                                {changedFields.length > 0 && (
                                                  <p className="mt-1 text-xs">
                                                    Fields: {changedFields.join(', ')}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-muted-foreground">
                                          {auditLogsByProject[project.id]
                                            ? 'No audit records yet.'
                                            : 'Loading audit records...'}
                                        </p>
                                      )}
                                    </div>
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
                        </Fragment>
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

      <Dialog
        open={!!photoEditorProject && !!photoEditorUrl}
        onOpenChange={(open) => {
          if (!open) {
            setPhotoEditorProject(null);
            setPhotoEditorUrl(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Photo Information</DialogTitle>
            <DialogDescription>
              Configure the photo metadata shown to users in the project gallery.
            </DialogDescription>
          </DialogHeader>

          {photoEditorProject && photoEditorUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={photoEditorUrl}
                    alt={photoInfoForm.componentId || "Project photo"}
                    className="max-h-[60vh] w-full object-contain"
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">{getPhotoFileName(photoEditorUrl)}</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="admin-photo-component-id">Component ID</Label>
                  <Input
                    id="admin-photo-component-id"
                    value={photoInfoForm.componentId}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, componentId: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-photo-purpose">Purpose</Label>
                  <Input
                    id="admin-photo-purpose"
                    value={photoInfoForm.purpose}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, purpose: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-photo-date-captured">Date Captured</Label>
                  <Input
                    id="admin-photo-date-captured"
                    type="date"
                    value={photoInfoForm.dateCaptured}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, dateCaptured: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-photo-location">Location</Label>
                  <Input
                    id="admin-photo-location"
                    value={photoInfoForm.location}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, location: event.target.value }))}
                  />
                  <a
                    href={`https://www.google.com/maps?q=${photoEditorProject.latitude},${photoEditorProject.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#FF5722] hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    className="bg-[#FF5722] hover:bg-[#E64A19]"
                    onClick={handleSavePhotoInfo}
                    disabled={isSavingPhotoInfo}
                  >
                    {isSavingPhotoInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Photo Info
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPhotoEditorProject(null);
                      setPhotoEditorUrl(null);
                    }}
                    disabled={isSavingPhotoInfo}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
