import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Use ScrollArea if available, or just div

// Define Project interface locally or import if shared. 
// Since it's specific to the tracker page structure, I'll accept 'any' or define a compatible subset.
interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    branch: "ADC" | "QGDC" | "QMB";
    [key: string]: any;
}

interface ProjectListSidebarProps {
    projects: Project[]; // All projects for count
    filteredProjects: Project[];
    selectedProjectId: string | null;
    onSelect: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    branchFilter: string;
    setBranchFilter: (val: string) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    isLoading: boolean;
}

const branchColors: Record<string, string> = {
    ADC: "bg-[#006D5B] text-white",
    QGDC: "bg-[#000000] text-white",
    QMB: "bg-[#DC2626] text-white",
};

const ProjectListSidebar = ({
    projects,
    filteredProjects,
    selectedProjectId,
    onSelect,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    sortBy,
    setSortBy,
    isLoading
}: ProjectListSidebarProps) => {
    return (
        <div className="relative flex flex-col h-full bg-card">
            {/* Search and Filters - Fixed Header */}
            <div className="sticky top-0 z-10 bg-card px-4 py-4 space-y-3 border-b shrink-0">
                <div className="w-full space-y-3">
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

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date-newest">Date (Newest First)</SelectItem>
                            <SelectItem value="date-oldest">Date (Oldest First)</SelectItem>
                            <SelectItem value="id-asc">Project ID (A-Z)</SelectItem>
                            <SelectItem value="id-desc">Project ID (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Results count */}
                    <div className="text-xs text-muted-foreground text-left">
                        {filteredProjects.length} of {projects.length} projects
                    </div>
                </div>
            </div>

            {/* Project List - Scrollable */}
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
                    <div className="space-y-2 w-full pb-4">
                        {filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => onSelect(project.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedProjectId === project.id
                                    ? 'bg-[#FF5722]/10 border-[#FF5722]'
                                    : 'bg-card hover:bg-muted border-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="font-semibold text-sm truncate">{project.project_id}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${branchColors[project.branch] || 'bg-gray-500 text-white'}`}>
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
        </div>
    );
};

export default ProjectListSidebar;
