import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    project_date: string;
    branch: string;
    region: string;
    province: string;
    category_type?: string;
}

interface ProjectSidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onProjectSelect: (project: Project) => void;
    onViewDetails?: (project: Project) => void;
    className?: string;
}

const branchColors = {
    ADC: "bg-[#006D5B]",    // Teal Green
    QGDC: "bg-[#000000]",   // Black
    QMB: "bg-[#DC2626]",    // Bright Red
};

const statusColors = {
    not_started: "bg-slate-500",
    ongoing: "bg-blue-500",
    completed: "bg-green-500",
    terminated: "bg-red-500",
    active: "bg-green-500",
    inactive: "bg-slate-400",
};

const ITEMS_PER_PAGE = 7;

const ProjectSidebar = ({ projects, selectedProjectId, onProjectSelect, onViewDetails, className }: ProjectSidebarProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to first page when projects change
    useEffect(() => {
        setCurrentPage(1);
    }, [projects]);

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, projects.length);
    const currentProjects = projects.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if near start
            if (currentPage <= 3) {
                start = 2;
                end = 4;
            }

            // Adjust if near end
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className={cn("flex flex-col h-full bg-card", className)}>
            {/* Header */}
            <div className="sticky top-0 bg-[#FF5722] text-white p-4 flex items-center justify-between z-10 shadow-md">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Projects</h2>
                </div>
            </div>

            {/* Project List */}
            <style>
                {`
                    .sidebar-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: #FF5722 #e5e7eb;
                        overflow-y: scroll !important;
                    }
                    .sidebar-scrollbar::-webkit-scrollbar {
                        width: 14px;
                    }
                    .sidebar-scrollbar::-webkit-scrollbar-track {
                        background: #e5e7eb;
                    }
                    .sidebar-scrollbar::-webkit-scrollbar-thumb {
                        background: #FF5722;
                        border-radius: 10px;
                        border: 3px solid #e5e7eb;
                    }
                    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #E64A19;
                    }
                    .sidebar-scrollbar::-webkit-scrollbar-button {
                        display: block;
                        height: 12px;
                        width: 12px;
                        background-color: #e5e7eb;
                        background-repeat: no-repeat;
                        background-position: center;
                    }
                    /* Up Arrow */
                    .sidebar-scrollbar::-webkit-scrollbar-button:vertical:decrement {
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23FF5722' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m18 15-6-6-6 6'/%3E%3C/svg%3E");
                    }
                    /* Down Arrow */
                    .sidebar-scrollbar::-webkit-scrollbar-button:vertical:increment {
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23FF5722' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    }
                `}
            </style>
            <div className="sidebar-scrollbar h-[400px]" style={{ overflowY: 'scroll' }}>
                <div className="divide-y divide-border/50">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No contracts found matching your filters.</p>
                        </div>
                    ) : (
                        currentProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => onProjectSelect(project)}
                                className={cn(
                                    "p-4 cursor-pointer transition-all hover:bg-accent/50 group relative",
                                    selectedProjectId === project.id ? "bg-orange-50 border-l-4 border-l-[#FF5722]" : "border-l-4 border-l-transparent hover:border-l-orange-200"
                                )}
                            >
                                {/* Top Row: ID and Status */}
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="font-bold text-xs text-foreground/80">
                                        {project.project_id}
                                    </span>
                                    <Badge
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 h-5 text-white border-0 rounded-full",
                                            statusColors[project.status as keyof typeof statusColors] || "bg-gray-500"
                                        )}
                                    >
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {/* Middle: Title */}
                                <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-[#FF5722] transition-colors">
                                    {project.description}
                                </h3>

                                {/* Bottom: Location and Branch */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate max-w-[180px]">{project.province || project.region}</span>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[9px] px-1.5 py-0 h-auto font-medium border-0 text-white",
                                            branchColors[project.branch as keyof typeof branchColors]
                                        )}
                                    >
                                        {project.branch}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination Footer */}
            {projects.length > 0 && (
                <div className="p-4 border-t border-border/50 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                    <div className="text-muted-foreground font-semibold">
                        Showing {startIndex + 1} to {endIndex} of {projects.length} Projects
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                                ) : (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "ghost"}
                                        size="sm"
                                        className={cn(
                                            "h-8 w-8 p-0 font-medium",
                                            currentPage === page
                                                ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => handlePageChange(page as number)}
                                    >
                                        {page}
                                    </Button>
                                )
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSidebar;
