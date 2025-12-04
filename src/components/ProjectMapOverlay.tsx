import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, MapPin, ArrowRight, Info, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { useState } from "react";

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

interface ProjectMapOverlayProps {
    project: Project | null;
    onClose: () => void;
    onViewFullDetails: () => void;
    className?: string;
}

const statusColors = {
    not_started: "bg-slate-500",
    ongoing: "bg-blue-500",
    implemented: "bg-[#4CAF50]",
    terminated: "bg-red-500",
    active: "bg-[#4CAF50]",
    inactive: "bg-slate-400",
};

const branchColors = {
    ADC: "bg-[#006D5B]",
    QGDC: "bg-[#000000]",
    QMB: "bg-[#DC2626]",
};

const ProjectMapOverlay = ({ project, onClose, onViewFullDetails, className }: ProjectMapOverlayProps) => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!project) return null;

    const CategoryIcon = getCategoryIcon(project.category_type || "");
    const headerColor = branchColors[project.branch as keyof typeof branchColors] || "bg-primary";

    return (
        <div
            className={cn(
                "hidden md:flex absolute right-4 top-4 z-[9999] w-full max-w-sm animate-in slide-in-from-right duration-500 flex-col transition-all",
                className
            )}
            style={{
                height: isMinimized ? 'auto' : '525px',
                maxHeight: isMinimized ? '80px' : 'calc(100vh - 250px)'
            }}
        >
            <Card className="shadow-2xl border-0 overflow-hidden rounded-lg flex flex-col h-full transition-all duration-300">
                {/* Header Section - Always Visible */}
                <div className={cn("p-4 text-white relative flex-shrink-0", headerColor)}>
                    {/* Close Button - Top Right */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0 z-10"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    {/* Clickable Header with Label and Dropdown Arrow */}
                    <div
                        className="flex items-center justify-between gap-2 cursor-pointer mb-3 pr-10"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <span className="font-bold tracking-wider text-sm uppercase opacity-90">
                            Project Details
                        </span>

                        {/* Dropdown Arrow Icon */}
                        <div className="text-white/80 transition-transform duration-200" style={{ transform: isMinimized ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>

                    {/* Category Type - Shows when expanded */}
                    {!isMinimized && (
                        <div className="flex items-center gap-2 mb-3 opacity-90 pb-2 border-b border-white/20">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <CategoryIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold tracking-wider text-xs uppercase">
                                {project.category_type || "PROJECT"}
                            </span>
                        </div>
                    )}

                    {!isMinimized && (
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold leading-tight line-clamp-3">
                                {project.project_id} – {project.description}
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-white/80 pt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{project.province || project.region}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Single Scrollable Area - includes all content and button */}
                {!isMinimized && (
                    <>
                        <style>
                            {`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 14px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #e5e7eb;
                                    border-radius: 7px;
                                    margin: 4px 0;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: #FF5722;
                                    border-radius: 7px;
                                    border: 3px solid #e5e7eb;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: #E64A19;
                                }
                                .custom-scrollbar::-webkit-scrollbar-button {
                                    display: none;
                                }
                            `}
                        </style>
                        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1" style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#FF5722 #e5e7eb'
                        }}>
                            <div className="p-5 space-y-5 bg-white">
                                {/* Project Status Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                                        <Info className="w-4 h-4" />
                                        <h3>Project Status</h3>
                                    </div>
                                    <Badge
                                        className={cn(
                                            "text-sm px-4 py-1.5 h-auto font-semibold border-0 rounded-full flex w-fit items-center gap-2",
                                            statusColors[project.status as keyof typeof statusColors] || "bg-gray-500"
                                        )}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wide">
                                        <FileText className="w-3.5 h-3.5" />
                                        <h3>Description</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                {/* Additional Details */}
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Project ID:</span>
                                            <span className="font-mono">{project.project_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Branch:</span>
                                            <span>{project.branch}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Date:</span>
                                            <span>{new Date(project.project_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with CTA - inside scrollable area */}
                                <div className="pt-3 pb-2">
                                    <Button
                                        className="w-full bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-6 text-base shadow-lg hover:shadow-xl transition-all"
                                        onClick={onViewFullDetails}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="bg-white/20 rounded-full p-0.5">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                            View Full Details
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div >
    );
};

export default ProjectMapOverlay;
