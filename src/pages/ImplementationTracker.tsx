import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Menu, Navigation, WifiOff } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProjectListSidebar from "@/components/ProjectListSidebar";
import { useNavigate } from "react-router-dom";
import ImplementationMap from "@/components/ImplementationMap";
import MarkImplementedPanel from "@/components/MarkImplementedPanel";
import ProjectOptionsDialog from "@/components/ProjectOptionsDialog";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";
import { useMapboxToken } from "@/hooks/useMapboxToken";
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
import { getResolvedVerificationAssets, joinStoredUrls } from "@/utils/projectMedia";
import { distanceBetweenMeters, hasValidCoordinates, normalizeRouteFeature } from "@/utils/mapData";

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
    verification_source?: "implementation" | "project" | "none";
    has_verification?: boolean;
}

interface NavigationSummary {
    distanceMeters: number | null;
    durationSeconds: number | null;
    nextInstruction: string | null;
}

const ImplementationTracker = () => {
    const ARRIVAL_THRESHOLD_METERS = 35;
    const ROUTE_REFRESH_DISTANCE_METERS = 25;
    const ROUTE_REFRESH_INTERVAL_MS = 15000;
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [branchFilter, setBranchFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-newest");
    const [isLoading, setIsLoading] = useState(true);
    const { token: mapboxToken } = useMapboxToken();

    const [showOptions, setShowOptions] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showImplementation, setShowImplementation] = useState(false);
    const [showVpnWarning, setShowVpnWarning] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [routeData, setRouteData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [distanceToProject, setDistanceToProject] = useState<number | null>(null);
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
    const [navigationSummary, setNavigationSummary] = useState<NavigationSummary | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const lastRouteOriginRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const lastRouteFetchAtRef = useRef<number>(0);
    const routeFetchInFlightRef = useRef(false);
    const offlineNoticeShownRef = useRef(false);

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
                const mergedStatus = impl?.status || p.status;
                const verification = getResolvedVerificationAssets({
                    status: mergedStatus,
                    image_url: p.image_url,
                    document_urls: p.document_urls,
                    verification_images: impl?.verification_images,
                    verification_documents: impl?.verification_documents,
                });

                return {
                    ...p,
                    status: mergedStatus,
                    completion_date: impl?.completion_date,
                    timekeeper_name: impl?.timekeeper_name,
                    implementation_notes: impl?.implementation_notes,
                    verification_images: joinStoredUrls(verification.images) ?? undefined,
                    verification_documents: joinStoredUrls(verification.documents) ?? undefined,
                    verification_source: verification.source,
                    has_verification: verification.images.length > 0 || verification.documents.length > 0,
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
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'project_implementations' },
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

    const stopNavigation = useCallback((options?: { clearRoute?: boolean; showToast?: boolean }) => {
        const clearRoute = options?.clearRoute ?? true;

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        routeFetchInFlightRef.current = false;
        lastRouteOriginRef.current = null;
        lastRouteFetchAtRef.current = 0;
        offlineNoticeShownRef.current = false;

        setIsNavigating(false);
        setIsCalculatingRoute(false);
        setDistanceToProject(null);
        setLocationAccuracy(null);
        setNavigationSummary(null);

        if (clearRoute) {
            setRouteData(null);
        }

        if (options?.showToast) {
            toast({
                title: "Navigation stopped",
                description: "Live GPS tracking has been stopped for this project.",
            });
        }
    }, [toast]);

    const fetchRouteForPosition = useCallback(
        async (
            currentLocation: { latitude: number; longitude: number },
            options?: { announce?: boolean },
        ) => {
            if (!selectedProject || !hasValidCoordinates(selectedProject) || !mapboxToken) {
                return;
            }

            if (!navigator.onLine) {
                if (!offlineNoticeShownRef.current) {
                    toast({
                        variant: "destructive",
                        title: "Internet required",
                        description: "Turn on your internet connection so the route can update while you move.",
                    });
                    offlineNoticeShownRef.current = true;
                }
                return;
            }

            offlineNoticeShownRef.current = false;

            if (routeFetchInFlightRef.current) {
                return;
            }

            routeFetchInFlightRef.current = true;
            setIsCalculatingRoute(true);

            try {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.longitude},${currentLocation.latitude};${selectedProject.longitude},${selectedProject.latitude}?alternatives=false&geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`
                );

                if (!response.ok) {
                    throw new Error(`Route request failed with status ${response.status}.`);
                }

                const data = await response.json();
                const routeRecord = data.routes?.[0];
                const routeGeometry = routeRecord?.geometry;
                const routeFeature = normalizeRouteFeature(routeGeometry);

                if (!routeFeature) {
                    throw new Error("Route geometry is invalid.");
                }

                setRouteData(routeFeature);
                setNavigationSummary({
                    distanceMeters:
                        typeof routeRecord?.distance === "number" ? routeRecord.distance : null,
                    durationSeconds:
                        typeof routeRecord?.duration === "number" ? routeRecord.duration : null,
                    nextInstruction:
                        routeRecord?.legs?.[0]?.steps?.[0]?.maneuver?.instruction ?? null,
                });
                lastRouteOriginRef.current = currentLocation;
                lastRouteFetchAtRef.current = Date.now();

                if (options?.announce) {
                    toast({
                        title: "Navigation started",
                        description: `Live route guidance to ${selectedProject.project_id} is now active.`,
                    });
                }
            } catch (error) {
                console.error("Error fetching route:", error);
                if (options?.announce) {
                    toast({
                        variant: "destructive",
                        title: "Could not calculate route",
                        description: "Check your internet connection and try again.",
                    });
                }
            } finally {
                routeFetchInFlightRef.current = false;
                setIsCalculatingRoute(false);
            }
        },
        [mapboxToken, selectedProject, toast],
    );

    const handleProjectSelect = (projectId: string) => {
        if (watchIdRef.current !== null) {
            stopNavigation();
        }
        setSelectedProjectId(projectId);
        setRouteData(null);
        setShowOptions(true);
    };

    const handleNavigate = () => {
        if (!selectedProject) return;
        if (!hasValidCoordinates(selectedProject)) {
            toast({
                variant: "destructive",
                title: "Invalid project location",
                description: "This project does not have valid coordinates for navigation.",
            });
            return;
        }
        setShowVpnWarning(true);
    };

    const startNavigation = () => {
        setShowVpnWarning(false);
        if (!selectedProject || !hasValidCoordinates(selectedProject)) return;
        if (!mapboxToken) {
            toast({ variant: "destructive", title: "Error", description: "Mapbox token not found" });
            return;
        }

        if (!navigator.onLine) {
            toast({
                variant: "destructive",
                title: "Internet required",
                description: "Turn on your internet connection before starting live navigation.",
            });
            return;
        }

        if ("geolocation" in navigator) {
            stopNavigation();
            setIsNavigating(true);

            // 1. Initial Route Fetch
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { latitude, longitude };
                setUserLocation(currentLocation);
                setLocationAccuracy(
                    typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
                );
                setDistanceToProject(distanceBetweenMeters(currentLocation, selectedProject));
                await fetchRouteForPosition(currentLocation, { announce: true });
            }, (error) => {
                console.error("Geolocation error:", error);
                stopNavigation();
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
                    const currentLocation = { latitude, longitude };
                    const remainingDistance = distanceBetweenMeters(currentLocation, selectedProject);

                    setUserLocation(currentLocation);
                    setLocationAccuracy(
                        typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
                    );
                    setDistanceToProject(remainingDistance);

                    if (remainingDistance <= ARRIVAL_THRESHOLD_METERS) {
                        stopNavigation();
                        toast({
                            title: "Destination reached",
                            description: `You are now within ${Math.round(remainingDistance)} meters of ${selectedProject.project_id}.`,
                        });
                        return;
                    }

                    const movedEnough =
                        !lastRouteOriginRef.current ||
                        distanceBetweenMeters(currentLocation, lastRouteOriginRef.current) >= ROUTE_REFRESH_DISTANCE_METERS;
                    const routeIsStale = Date.now() - lastRouteFetchAtRef.current >= ROUTE_REFRESH_INTERVAL_MS;

                    if (movedEnough || routeIsStale || !lastRouteFetchAtRef.current) {
                        void fetchRouteForPosition(currentLocation);
                    }
                },
                (error) => {
                    console.error("Watch Position Error:", error);
                    // Don't show modal repeatedly for watch errors, just toast
                    if (error.code === 1) { // Permission Denied
                        toast({ variant: "destructive", title: "Location Access Denied", description: "Please enable location services." });
                        stopNavigation();
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            );

        } else {
            stopNavigation();
            toast({ variant: "destructive", title: "Error", description: "Geolocation not supported." });
        }
    };

    useEffect(() => {
        if (!isNavigating) {
            return;
        }

        const handleOffline = () => {
            offlineNoticeShownRef.current = true;
            toast({
                variant: "destructive",
                title: "Internet disconnected",
                description: "Live route updates are paused until your internet connection returns.",
            });
        };

        const handleOnline = () => {
            offlineNoticeShownRef.current = false;

            if (userLocation) {
                void fetchRouteForPosition(userLocation);
            }

            toast({
                title: "Internet restored",
                description: "Live route guidance is updating again.",
            });
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [fetchRouteForPosition, isNavigating, toast, userLocation]);


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

    const formattedRouteDistance =
        navigationSummary?.distanceMeters !== null && navigationSummary?.distanceMeters !== undefined
            ? navigationSummary.distanceMeters >= 1000
                ? `${(navigationSummary.distanceMeters / 1000).toFixed(1)} km`
                : `${Math.max(1, Math.round(navigationSummary.distanceMeters))} m`
            : "--";

    const formattedEta =
        navigationSummary?.durationSeconds !== null && navigationSummary?.durationSeconds !== undefined
            ? navigationSummary.durationSeconds >= 3600
                ? `${Math.floor(navigationSummary.durationSeconds / 3600)}h ${Math.round((navigationSummary.durationSeconds % 3600) / 60)}m`
                : `${Math.max(1, Math.round(navigationSummary.durationSeconds / 60))} min`
            : "--";

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

                    {selectedProject && isNavigating && (
                        <div className="absolute top-3 left-3 right-3 md:left-auto md:w-[340px] z-20 rounded-xl border bg-card/95 backdrop-blur shadow-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Navigation className="h-4 w-4 text-[#FF5722]" />
                                        <span className="truncate">Navigating to {selectedProject.project_id}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Route updates automatically while your GPS and internet stay on.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => stopNavigation({ showToast: true })}
                                >
                                    Stop
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted/60 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remaining</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {distanceToProject !== null ? `${Math.max(1, Math.round(distanceToProject))} m` : "--"}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted/60 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">GPS Accuracy</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {locationAccuracy !== null ? `±${Math.round(locationAccuracy)} m` : "--"}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted/60 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Route Distance</p>
                                    <p className="text-lg font-bold text-foreground">{formattedRouteDistance}</p>
                                </div>
                                <div className="rounded-lg bg-muted/60 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">ETA</p>
                                    <p className="text-lg font-bold text-foreground">{formattedEta}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-background/80 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next Guide</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {navigationSummary?.nextInstruction ?? "Follow the highlighted route to the project location."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {isCalculatingRoute ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF5722]" />
                                        Updating route guidance...
                                    </>
                                ) : navigator.onLine ? (
                                    "Live tracking is active."
                                ) : (
                                    <>
                                        <WifiOff className="h-3.5 w-3.5 text-destructive" />
                                        Waiting for internet to refresh the route.
                                    </>
                                )}
                            </div>
                        </div>
                    )}
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
