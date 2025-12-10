import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Calendar, User, Briefcase, Phone, Mail, MapPin,
  Image as ImageIcon, FileText, Download, Share2, Flag, X
} from "lucide-react";
import { useState } from "react";
import ImageViewerModal from "./ImageViewerModal";
import ReportProjectModal from "./ReportProjectModal";
import ShareProjectModal from "./ShareProjectModal";

interface Project {
  id: string;
  project_id: string;
  description: string;
  status: string;
  project_date: string;
  effectivity_date: string | null;
  actual_start_date: string | null;
  expiry_date: string | null;
  engineer_name: string;
  user_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_social: string | null;
  branch: "ADC" | "QGDC" | "QMB";
  latitude: number;
  longitude: number;
  image_url: string | null;
  document_urls: string | null;
  additional_details: string | null;
  created_at: string;
  contract_cost: number | null;
  region: string | null;
  province: string | null;
  category_type: string | null;
}

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const branchColors = {
  ADC: "bg-[#006D5B]",    // Teal Green
  QGDC: "bg-[#000000]",   // Black
  QMB: "bg-[#DC2626]",    // Bright Red
};

const ProjectDetailsModal = ({ open, onOpenChange, project }: ProjectDetailsModalProps) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "₱0.00";
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900 [&>button]:hidden">
          {/* Header */}
          <div className="bg-[#FF5722] px-6 py-4 flex items-center justify-between shrink-0">
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
              Project Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Top Section: Title, Cost, Actions */}
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {project.project_id} - {project.description}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${branchColors[project.branch]} text-white border-0`}>
                      {project.branch}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
                      {project.status}
                    </Badge>
                    {project.category_type && (
                      <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                        {project.category_type}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Project Cost</p>
                    <p className="text-3xl font-bold text-[#FF5722]">
                      {formatCurrency(project.contract_cost)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2"
                      onClick={() => setShareModalOpen(true)}
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#FF5722] border-[#FF5722] hover:bg-[#FF5722]/10 gap-2"
                      onClick={() => setReportModalOpen(true)}
                    >
                      <Flag className="w-4 h-4" /> Report
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="location" className="w-full">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none flex-wrap">
                  <TabsTrigger
                    value="contract"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:text-[#FF5722] data-[state=active]:bg-transparent px-6 py-3 font-semibold uppercase text-xs sm:text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Project Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:text-[#FF5722] data-[state=active]:bg-transparent px-6 py-3 font-semibold uppercase text-xs sm:text-sm flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Location Data
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:text-[#FF5722] data-[state=active]:bg-transparent px-6 py-3 font-semibold uppercase text-xs sm:text-sm flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:text-[#FF5722] data-[state=active]:bg-transparent px-6 py-3 font-semibold uppercase text-xs sm:text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Documents
                  </TabsTrigger>
                </TabsList>

                {/* Project Information Tab */}
                <TabsContent value="contract" className="pt-6 space-y-6">
                  {/* Project Information Table */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#FF5722]" />
                        Project Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {/* Timeline Section */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 uppercase text-xs">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#FF5722]" />
                                  Project Timeline
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 w-1/3">Effectivity Date</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {project.effectivity_date ? format(new Date(project.effectivity_date), "PPP") : "N/A"}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Actual Start Date</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {project.actual_start_date ? format(new Date(project.actual_start_date), "PPP") : "N/A"}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Expiry Date</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {project.expiry_date ? format(new Date(project.expiry_date), "PPP") : "N/A"}
                              </td>
                            </tr>

                            {/* Team Section */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 uppercase text-xs">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-[#FF5722]" />
                                  Team Members
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Project Engineer</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {project.engineer_name}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Time Keeper/Checker</td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {project.user_name}
                              </td>
                            </tr>

                            {/* Contact Section */}
                            {(project.contact_phone || project.contact_email || project.contact_social) && (
                              <>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 uppercase text-xs">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-[#FF5722]" />
                                      Contact Information
                                    </div>
                                  </td>
                                </tr>
                                {project.contact_phone && (
                                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {project.contact_phone}
                                    </td>
                                  </tr>
                                )}
                                {project.contact_email && (
                                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {project.contact_email}
                                    </td>
                                  </tr>
                                )}
                                {project.contact_social && (
                                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">Social Media</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {project.contact_social}
                                    </td>
                                  </tr>
                                )}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Details */}
                  {project.additional_details && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#FF5722]" />
                          Additional Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {project.additional_details}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Location Data Tab */}
                <TabsContent value="location" className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Region</p>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{project.region || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Province(s)</p>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{project.province || "N/A"}</p>
                    </div>
                  </div>

                  <Card className="border-0 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-white dark:bg-slate-900 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-[#FF5722]">
                        <MapPin className="w-5 h-5" />
                        Map View
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleOpenGoogleMaps}>
                          Google Maps
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleOpenWaze}>
                          Waze
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full h-[400px] bg-slate-100 relative">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.longitude - 0.01}%2C${project.latitude - 0.01}%2C${project.longitude + 0.01}%2C${project.latitude + 0.01}&layer=mapnik&marker=${project.latitude}%2C${project.longitude}`}
                          style={{ border: 0 }}
                        ></iframe>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t text-xs text-slate-500 flex justify-between items-center">
                        <span>Coordinates: {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}</span>
                        <span className="text-[10px] text-slate-400">© OpenStreetMap contributors</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="pt-6">
                  {project.image_url ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {project.image_url.split(',').filter(Boolean).map((url, index) => (
                        <div
                          key={index}
                          className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border bg-slate-100"
                          onClick={() => handleImageClick(project.image_url!.split(','), index)}
                        >
                          <img
                            src={url.trim()}
                            alt={`Project image ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <ImageIcon className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                      <p>No images available for this project.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="pt-6">
                  {project.document_urls ? (
                    <div className="grid grid-cols-1 gap-3">
                      {project.document_urls.split(',').filter(Boolean).map((url, index) => {
                        // Extract filename from URL
                        const fileName = url.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
                        // Remove timestamp prefix (first part before underscore)
                        // Example: "1765006351427_MyDocument.pdf" -> "MyDocument.pdf"
                        const readableName = decodeURIComponent(fileName).replace(/^\d+_/, '') || fileName;
                        return (
                          <a
                            key={index}
                            href={url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border rounded-lg hover:border-[#FF5722] hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                <FileText className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{readableName}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed">
                      <FileText className="w-12 h-12 mb-2 opacity-20" />
                      <p>No documents attached to this project.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={imageUrls}
        initialIndex={selectedImageIndex}
      />

      <ReportProjectModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        project={project}
      />

      <ShareProjectModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        projectUrl="https://www.qmazholdingsinc.site/"
      />
    </>
  );
};

export default ProjectDetailsModal;
