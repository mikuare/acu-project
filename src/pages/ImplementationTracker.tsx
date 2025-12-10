import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImplementationMap from "@/components/ImplementationMap";
import MarkImplementedPanel from "@/components/MarkImplementedPanel";

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
    // Implementation details
    completion_date?: string;
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
    const [isLoading, setIsLoading] = useState(true);
    // ... (state)

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

        setFilteredProjects(result);
    }, [searchQuery, statusFilter, branchFilter, projects]);

    const selectedProject = selectedProjectId
        ? projects.find(p => p.id === selectedProjectId) || null
        : null;

    const handleProjectSelect = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleSuccess = () => {
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
            <header className="bg-card border-b-4 border-[#FF5722] py-3 px-4 flex items-center gap-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/admin/dashboard')}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">Project Inventory Implementation - Mobile App UI</h1>
                    <p className="text-xs text-muted-foreground">Mark projects as implemented with verification</p>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 bg-card border-r flex flex-col overflow-hidden">
                    {/* Search and Filters */}
                    <div className="p-4 space-y-3 border-b">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by ID, description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="implemented">Implemented</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={branchFilter} onValueChange={setBranchFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    <SelectItem value="ADC">ADC</SelectItem>
                                    <SelectItem value="QGDC">QGDC</SelectItem>
                                    <SelectItem value="QMB">QMB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results count */}
                        <div className="text-xs text-muted-foreground">
                            {filteredProjects.length} of {projects.length} projects
                        </div>
                    </div>

                    {/* Project List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Loading projects...
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No projects found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredProjects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleProjectSelect(project.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedProjectId === project.id
                                            ? 'bg-[#FF5722]/10 border-[#FF5722]'
                                            : 'bg-card hover:bg-muted border-border'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className="font-semibold text-sm truncate">{project.project_id}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${branchColors[project.branch]}`}>
                                                {project.branch}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                            {project.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded ${project.status === 'implemented'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Map */}
                <main className="flex-1 relative">
                    <ImplementationMap
                        projects={filteredProjects}
                        selectedProjectId={selectedProjectId}
                        onProjectSelect={handleProjectSelect}
                    />
                </main>
            </div>

            {/* Mark Implemented Panel */}
            {selectedProject && (
                <MarkImplementedPanel
                    project={selectedProject}
                    onSuccess={handleSuccess}
                    onCancel={() => setSelectedProjectId(null)}
                />
            )}
        </div>
    );
};

export default ImplementationTracker;
