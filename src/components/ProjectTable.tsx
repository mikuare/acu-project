import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Flag } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import ReportProjectModal from "./ReportProjectModal";

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    category_type?: string;
    region?: string;
    province?: string;
    branch: string;
    project_date: string;
    latitude: number;
    longitude: number;
    contract_cost?: number | null;
}

interface ProjectTableProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'implemented': return 'bg-emerald-500 hover:bg-emerald-600';
        case 'ongoing':
        case 'active': return 'bg-amber-500 hover:bg-amber-600';
        case 'not_started': return 'bg-slate-500 hover:bg-slate-600';
        case 'terminated':
        case 'cancelled': return 'bg-red-500 hover:bg-red-600';
        default: return 'bg-blue-500 hover:bg-blue-600';
    }
};

const ProjectTable = ({ projects, onProjectClick }: ProjectTableProps) => {
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [projectToReport, setProjectToReport] = useState<Project | null>(null);

    const handleReportClick = (project: Project) => {
        setProjectToReport(project);
        setReportModalOpen(true);
    };

    if (projects.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project ID</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Project Cost</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            <TableHead className="text-center">Report</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{project.project_id}</TableCell>
                                <TableCell className="max-w-[300px] truncate" title={project.description}>
                                    {project.description}
                                </TableCell>
                                <TableCell>{project.category_type || 'N/A'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs">
                                        <span>{project.province || 'Unknown Province'}</span>
                                        <span className="text-muted-foreground">{project.region || 'Unknown Region'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{project.branch}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${getStatusColor(project.status)} text-white border-0`}>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-orange-600">
                                        {project.contract_cost
                                            ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.contract_cost)
                                            : 'N/A'
                                        }
                                    </span>
                                </TableCell>
                                <TableCell>{format(new Date(project.project_date), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onProjectClick(project)}
                                    >
                                        <MapPin className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="bg-[#FF5722] hover:bg-[#E64A19]"
                                        onClick={() => handleReportClick(project)}
                                    >
                                        <Flag className="w-3 h-3 mr-1" />
                                        REPORT
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground text-center">
                Showing {projects.length} projects
            </div>

            {projectToReport && (
                <ReportProjectModal
                    open={reportModalOpen}
                    onOpenChange={setReportModalOpen}
                    project={projectToReport}
                />
            )}
        </div>
    );
};

export default ProjectTable;
