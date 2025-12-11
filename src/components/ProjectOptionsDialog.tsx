
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Navigation, FileText, CheckCircle, MapPin } from "lucide-react";

interface ProjectOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    project: any; // Using any for flexibility, similar to other components
    onNavigate: () => void;
    onViewDetails: () => void;
    onMarkImplemented: () => void;
}

const ProjectOptionsDialog = ({
    open,
    onClose,
    project,
    onNavigate,
    onViewDetails,
    onMarkImplemented
}: ProjectOptionsDialogProps) => {
    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#FF5722]" />
                        {project.project_id}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className="justify-start gap-4 h-16 text-lg hover:border-[#FF5722] hover:text-[#FF5722] hover:bg-[#FF5722]/5"
                        onClick={() => {
                            onNavigate();
                            onClose();
                        }}
                    >
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <Navigation className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold">Navigate to Project</span>
                            <span className="text-xs text-muted-foreground font-normal">Show route from your location</span>
                        </div>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="justify-start gap-4 h-16 text-lg hover:border-[#FF5722] hover:text-[#FF5722] hover:bg-[#FF5722]/5"
                        onClick={() => {
                            onViewDetails();
                            onClose();
                        }}
                    >
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold">View Details</span>
                            <span className="text-xs text-muted-foreground font-normal">See full project information</span>
                        </div>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="justify-start gap-4 h-16 text-lg hover:border-[#FF5722] hover:text-[#FF5722] hover:bg-[#FF5722]/5"
                        onClick={() => {
                            onMarkImplemented();
                            onClose();
                        }}
                    >
                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold">{project.status === 'implemented' ? 'Update Status' : 'Mark Implemented'}</span>
                            <span className="text-xs text-muted-foreground font-normal">Manage implementation status</span>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectOptionsDialog;
