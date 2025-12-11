import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    branch: "ADC" | "QGDC" | "QMB";
    latitude: number;
    longitude: number;
}

interface ProjectClusterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: Project[];
    onProjectSelect: (project: Project) => void;
}

const branchColors = {
    ADC: "bg-[#006D5B] text-white",
    QGDC: "bg-[#000000] text-white",
    QMB: "bg-[#DC2626] text-white",
};

const statusColors = {
    ongoing: "bg-orange-500 text-white",
    implemented: "bg-green-500 text-white",
};

const ProjectClusterModal = ({
    open,
    onOpenChange,
    projects,
    onProjectSelect,
}: ProjectClusterModalProps) => {
    if (projects.length === 0) return null;

    const location = projects[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#FF5722]" />
                        Multiple Projects at This Location
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        <strong>Location:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {projects.length} project{projects.length > 1 ? 's' : ''} found at this location. Select one to view details:
                    </p>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="border rounded-lg p-3 hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className={branchColors[project.branch]}>
                                                {project.branch}
                                            </Badge>
                                            <Badge
                                                className={
                                                    project.status === 'implemented'
                                                        ? statusColors.implemented
                                                        : statusColors.ongoing
                                                }
                                            >
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold text-sm">
                                            {project.project_id}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {project.description}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            onProjectSelect(project);
                                            onOpenChange(false);
                                        }}
                                        className="shrink-0"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectClusterModal;
