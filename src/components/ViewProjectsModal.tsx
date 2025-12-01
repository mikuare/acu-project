import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, MapPin, ExternalLink, LayoutGrid, LayoutList, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
}

interface ViewProjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onRefresh?: () => void;
}

const branchColors = {
  ADC: "bg-[#006D5B] hover:bg-[#005548]",    // Teal Green
  QGDC: "bg-[#000000] hover:bg-[#1a1a1a]",   // Black
  QMB: "bg-[#DC2626] hover:bg-[#B91C1C]",    // Bright Red
};

const ViewProjectsModal = ({ open, onOpenChange, projects, onRefresh }: ViewProjectsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.project_id.toLowerCase().includes(query) ||
      project.branch.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query) ||
      project.engineer_name.toLowerCase().includes(query) ||
      project.user_name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  const handleNavigateToMap = (project: Project) => {
    // Navigate to map with project location
    navigate(`/?lat=${project.latitude}&lng=${project.longitude}&project=${project.id}`);
    onOpenChange(false);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pr-8 sm:pr-10">
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 pr-2">
              <DialogTitle className="text-base sm:text-lg lg:text-xl leading-tight">
                View & Search Projects
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1 leading-relaxed">
                {isMobile ? 'Tap any card to navigate to the map' : (viewMode === 'table' ? 'Click any row' : 'Tap any card')} to navigate.
              </DialogDescription>
            </div>
            {/* Hide toggle buttons on mobile, show only on tablet and desktop */}
            {!isMobile && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 flex-shrink-0"
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-2">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 flex-shrink-0"
                >
                  <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-2">Table</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-3">
          {/* Search Bar with Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 pr-3 text-sm h-9 sm:h-10"
              />
            </div>
            {/* Refresh Button - visible on mobile */}
            {isMobile && onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 flex-shrink-0"
                aria-label="Refresh projects"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs text-muted-foreground px-0.5">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>

          {/* Projects Display */}
          {/* Force cards view on mobile, allow toggle on desktop */}
          {(isMobile || viewMode === 'cards') ? (
            /* Card View for Mobile */
            <ScrollArea className="h-[calc(95vh-240px)] sm:h-[calc(90vh-260px)] max-h-[500px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pr-3">
                {filteredProjects.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                    No projects found
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.98]"
                      onClick={() => handleNavigateToMap(project)}
                    >
                      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm sm:text-base leading-tight truncate">
                              {project.project_id}
                            </CardTitle>
                            <CardDescription className="text-[11px] sm:text-xs mt-1">
                              {format(new Date(project.project_date), 'MMM dd, yyyy')}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <Badge className={`${branchColors[project.branch]} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                              {project.branch}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${project.status === 'active' ? 'border-green-500 text-green-700' :
                                  project.status === 'implemented' ? 'border-blue-500 text-blue-700' :
                                    'border-orange-500 text-orange-700'
                                }`}
                            >
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0 space-y-1.5 sm:space-y-2">
                        <div className="space-y-1 text-[11px] sm:text-xs">
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <span className="font-medium text-muted-foreground min-w-[55px] sm:min-w-[60px] flex-shrink-0">Engineer:</span>
                            <span className="line-clamp-1 break-all">{project.engineer_name}</span>
                          </div>
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <span className="font-medium text-muted-foreground min-w-[55px] sm:min-w-[60px] flex-shrink-0">Checker:</span>
                            <span className="line-clamp-1 break-all">{project.user_name}</span>
                          </div>
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <span className="font-medium text-muted-foreground min-w-[55px] sm:min-w-[60px] flex-shrink-0">Location:</span>
                            <span className="font-mono text-[10px] sm:text-[11px] break-all">
                              {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs text-primary pt-1.5 sm:pt-2 border-t">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Tap to view on map</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            /* Table View */
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-[calc(95vh-240px)] sm:h-[calc(90vh-260px)] max-h-[500px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap">ID</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap">Branch</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap">Engineer</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap hidden sm:table-cell">Checker</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-[10px] sm:text-sm px-2 sm:px-4 whitespace-nowrap hidden lg:table-cell">Location</TableHead>
                        <TableHead className="w-[50px] sm:w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                            No projects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjects.map((project) => (
                          <TableRow
                            key={project.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted"
                            onClick={() => handleNavigateToMap(project)}
                          >
                            <TableCell className="font-medium text-[11px] sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                              {project.project_id}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <Badge className={`${branchColors[project.branch]} text-white text-[9px] sm:text-xs px-1 sm:px-2 py-0.5`}>
                                {project.branch}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <Badge
                                variant="outline"
                                className={`text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 ${project.status === 'active' ? 'border-green-500 text-green-700' :
                                    project.status === 'completed' ? 'border-blue-500 text-blue-700' :
                                      'border-orange-500 text-orange-700'
                                  }`}
                              >
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-[150px] truncate">
                              {project.engineer_name}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-[150px] truncate hidden sm:table-cell">
                              {project.user_name}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-sm px-2 sm:px-4 whitespace-nowrap hidden md:table-cell">
                              {format(new Date(project.project_date), 'MMM dd, yy')}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs font-mono px-2 sm:px-4 whitespace-nowrap hidden lg:table-cell">
                              {project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}
                            </TableCell>
                            <TableCell className="px-1 sm:px-2">
                              <div className="flex items-center justify-center">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/30 p-2 rounded-md leading-relaxed">
            💡 <strong>Tip:</strong> {isMobile ? 'Tap any card' : (viewMode === 'table' ? 'Click any row' : 'Tap any card')} to navigate to the map.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProjectsModal;

