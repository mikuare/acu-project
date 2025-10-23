import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, User, Briefcase, Phone, Mail, MapPin, Clock, ExternalLink, Image as ImageIcon, Navigation } from "lucide-react";
import { useState } from "react";
import ImageViewerModal from "./ImageViewerModal";

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

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const branchColors = {
  ADC: "bg-[#006D5B] hover:bg-[#005548]",    // Teal Green
  QGDC: "bg-[#000000] hover:bg-[#1a1a1a]",   // Black
  QMB: "bg-[#DC2626] hover:bg-[#B91C1C]",    // Bright Red
};

const ProjectDetailsModal = ({ open, onOpenChange, project }: ProjectDetailsModalProps) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  if (!project) return null;

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${project.latitude},${project.longitude}`;
    window.open(url, '_blank');
  };

  const handleOpenWaze = () => {
    const url = `https://waze.com/ul?ll=${project.latitude},${project.longitude}&navigate=yes`;
    window.open(url, '_blank');
  };

  const handleImageClick = (urls: string[], index: number) => {
    setImageUrls(urls);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <DialogHeader className="pb-4 pr-8 sm:pr-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Project Details
                </DialogTitle>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {project.project_id}
                </p>
              </div>
            </div>
            <Badge className={`${branchColors[project.branch]} text-white px-3 py-1 text-xs sm:text-sm font-semibold self-start sm:self-auto`}>
              {project.branch}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Images */}
          {project.image_url && (() => {
            const projectImageUrls = project.image_url.split(',').filter(Boolean).map(url => url.trim());
            return projectImageUrls.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <ImageIcon className="w-4 h-4" />
                    Project Images ({projectImageUrls.length})
                  </div>
                  <div className={`grid gap-3 ${
                    projectImageUrls.length === 1 ? 'grid-cols-1' :
                    projectImageUrls.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {projectImageUrls.map((url, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer"
                        onClick={() => handleImageClick(projectImageUrls, index)}
                      >
                        <img
                          src={url}
                          alt={`Project Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                          {index + 1} of {projectImageUrls.length}
                        </div>
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <div className="bg-white/90 px-3 py-1 rounded text-xs font-medium">
                            Click to enlarge
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Project Information Table */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Project Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Project ID
                  </label>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    {project.project_id}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Status
                  </label>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize font-medium ${
                        project.status === 'active' ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20' :
                        project.status === 'completed' ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                        'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-900/20'
                      }`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {project.additional_details && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Additional Details
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {project.additional_details}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Timeline
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Project Date
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {format(new Date(project.project_date), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Submitted
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {format(new Date(project.created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Team & Contact
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Engineer
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {project.engineer_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Time Keeper/Checker
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {project.user_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {project.contact_phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {project.contact_phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.contact_email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {project.contact_email}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.contact_social && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                        <ExternalLink className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Social
                        </p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {project.contact_social}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Navigation */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location & Navigation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Coordinates
                  </p>
                  <p className="text-sm font-mono text-slate-800 dark:text-slate-100">
                    {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={handleOpenGoogleMaps}
                  className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
                >
                  <Navigation className="w-5 h-5" />
                  Open in Google Maps
                </Button>
                <Button 
                  onClick={handleOpenWaze}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
                >
                  <Navigation className="w-5 h-5" />
                  Open in Waze
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
      </Dialog>

      {/* Image Viewer Modal - Outside parent dialog */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={imageUrls}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default ProjectDetailsModal;
