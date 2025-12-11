import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProjectListSidebar from "@/components/ProjectListSidebar";
import { useNavigate } from "react-router-dom";
import ImplementationMap from "@/components/ImplementationMap";
import MarkImplementedPanel from "@/components/MarkImplementedPanel";
import ProjectOptionsDialog from "@/components/ProjectOptionsDialog";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRef } from "react";

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    branch: "ADC" | "QGDC" | "QMB";
    latitude: number;
    longitude: number;
    image_url: string | null;
    document_urls: string | null;
    engineer_name: string;
    user_name: string;
    category_type: string | null;
    region: string | null;
    province: string | null;
    created_at: string;
    additional_details: string | null;
    // Implementation details
    completion_date?: string;
    timekeeper_name?: string;
    implementation_notes?: string;
    verification_images?: string;
    verification_documents?: string;
}

const ImplementationTracker = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [branchFilter, setBranchFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-newest");
    const [isLoading, setIsLoading] = useState(true);

    const [showOptions, setShowOptions] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showImplementation, setShowImplementation] = useState(false);
    const [showVpnWarning, setShowVpnWarning] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [routeData, setRouteData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const watchIdRef = useRef<number | null>(null);

    // Cleanup watch on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const fetchProjects = async () => {
        try {
            // 1. Fetch original projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;

            // 2. Fetch implementation records with details
            const { data: implData, error: implError } = await (supabase as any)
                .from('project_implementations')
                .select('*'); // Fetch all columns

            // If table doesn't exist yet, ignore error
            if (implError && implError.code !== '42P01') {
                console.error('Error fetching implementations:', implError);
            }

            // 3. Create map of implementations
            const implMap = new Map();
            (implData as any[])?.forEach(i => {
                implMap.set(i.project_id, i);
            });

            // 4. Merge data
            const mergedProjects = (projectsData || []).map(p => {
                const impl = implMap.get(p.id);
                return {
                    ...p,
                    status: impl ? impl.status : p.status,
                    completion_date: impl?.completion_date,
                    timekeeper_name: impl?.timekeeper_name,
                    implementation_notes: impl?.implementation_notes,
                    verification_images: impl?.verification_images,
                    verification_documents: impl?.verification_documents
                };
            });

            setProjects(mergedProjects);
            setFilteredProjects(mergedProjects);
        } catch (error: any) {
            console.error('Error fetching projects:', error);
            toast({
                variant: "destructive",
                title: "Error fetching projects",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchProjects();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('implementation-tracker-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                () => {
                    fetchProjects();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...projects];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.project_id?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.branch?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }

        // Branch filter
        if (branchFilter !== 'all') {
            result = result.filter(p => p.branch === branchFilter);
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'date-oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'id-asc':
                    return (a.project_id || '').localeCompare(b.project_id || '');
                case 'id-desc':
                    return (b.project_id || '').localeCompare(a.project_id || '');
                default:
                    return 0;
            }
        });

        setFilteredProjects(result);
    }, [searchQuery, statusFilter, branchFilter, projects, sortBy]);

    const selectedProject = selectedProjectId
        ? projects.find(p => p.id === selectedProjectId) || null
        : null;

    const handleProjectSelect = (projectId: string) => {
        setSelectedProjectId(projectId);
        setRouteData(null);
        setShowOptions(true);
    };

    const handleNavigate = () => {
        if (!selectedProject) return;
        setShowVpnWarning(true);
    };

    const startNavigation = () => {
        setShowVpnWarning(false);
        if (!selectedProject) return;
        if (!MAPBOX_TOKEN) {
            toast({ variant: "destructive", title: "Error", description: "Mapbox token not found" });
            return;
        }

        if ("geolocation" in navigator) {
            // 1. Initial Route Fetch
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });

                try {
                    const response = await fetch(
                        `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${selectedProject.longitude},${selectedProject.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
                    );
                    const data = await response.json();
                    if (data.routes && data.routes[0]) {
                        setRouteData(data.routes[0].geometry);
                        toast({ title: "Route calculated", description: "Showing route to project." });
                    }
                } catch (error) {
                    console.error("Error fetching route:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not calculate route." });
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                setShowLocationError(true);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });

            // 2. Start Watching Position
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                },
                (error) => {
                    console.error("Watch Position Error:", error);
                    // Don't show modal repeatedly for watch errors, just toast
                    if (error.code === 1) { // Permission Denied
                        toast({ variant: "destructive", title: "Location Access Denied", description: "Please enable location services." });
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );

            toast({ title: "Live Tracking Started", description: "Your location will update as you move." });

        } else {
            toast({ variant: "destructive", title: "Error", description: "Geolocation not supported." });
        }
    };


    const handleSuccess = () => {
        setShowImplementation(false);
        setSelectedProjectId(null);
        fetchProjects();
        toast({
            title: "✅ Success!",
            description: "Project marked as implemented successfully.",
        });
    };

    const branchColors = {
        ADC: "bg-[#006D5B] text-white",
        QGDC: "bg-[#000000] text-white",
        QMB: "bg-[#DC2626] text-white",
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="bg-card border-b-4 border-[#FF5722] py-2 sm:py-3 px-3 sm:px-4 flex items-center gap-2 sm:gap-4 shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/dashboard')}
                        className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>

                    {/* Mobile Sidebar Trigger (Moved to Header) */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden shrink-0 h-8 w-8"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 h-full w-full max-w-full sm:w-80 pt-safe-top z-[100]">
                            <ProjectListSidebar
                                projects={projects}
                                filteredProjects={filteredProjects}
                                selectedProjectId={selectedProjectId}
                                onSelect={(id) => {
                                    handleProjectSelect(id);
                                }}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                branchFilter={branchFilter}
                                setBranchFilter={setBranchFilter}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                isLoading={isLoading}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-xl font-bold truncate">Project Implementation</h1>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Mark projects as implemented with verification</p>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-80 bg-card border-r flex-col overflow-hidden z-10">
                    <ProjectListSidebar
                        projects={projects}
                        filteredProjects={filteredProjects}
                        selectedProjectId={selectedProjectId}
                        onSelect={handleProjectSelect}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        branchFilter={branchFilter}
                        setBranchFilter={setBranchFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        isLoading={isLoading}
                    />
                </aside>

                {/* Map */}
                <main className="flex-1 relative">
                    <ImplementationMap
                        projects={filteredProjects}
                        selectedProjectId={selectedProjectId}
                        onProjectSelect={handleProjectSelect}
                        route={routeData}
                        userLocation={userLocation}
                    />
                </main>

                {/* Mark Implemented Panel */}
                {selectedProject && showImplementation && (
                    <MarkImplementedPanel
                        project={selectedProject}
                        onSuccess={handleSuccess}
                        onCancel={() => setShowImplementation(false)}
                    />
                )}

                <ProjectOptionsDialog
                    open={showOptions}
                    onClose={() => setShowOptions(false)}
                    project={selectedProject}
                    onNavigate={handleNavigate}
                    onViewDetails={() => setShowDetails(true)}
                    onMarkImplemented={() => setShowImplementation(true)}
                />

                <ProjectDetailsModal
                    open={showDetails}
                    onOpenChange={setShowDetails}
                    project={selectedProject as any}
                />

                <AlertDialog open={showVpnWarning} onOpenChange={setShowVpnWarning}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>⚠️ Check Your Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                                To ensure accurate GPS tracking, please turn off any VPN services before proceeding.
                                VPNs can cause incorrect location readings.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={startNavigation} className="bg-[#FF5722] hover:bg-[#E64A19]">
                                Continue & Start Tracking
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showLocationError} onOpenChange={setShowLocationError}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>📍 Location Services Required</AlertDialogTitle>
                            <AlertDialogDescription>
                                We cannot detect your location. Please turn on <b>Location Services (GPS)</b> on your device to use navigation.
                                <br /><br />
                                Check your browser permissions or device settings.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setShowLocationError(false)} className="bg-[#FF5722]">
                                OK, I'll turn it on
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default ImplementationTracker;
