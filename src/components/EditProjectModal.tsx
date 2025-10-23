import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
}

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

const branchColors = {
  ADC: { bg: "bg-[#006D5B]", text: "text-[#006D5B]", border: "border-[#006D5B]" },    // Teal Green
  QGDC: { bg: "bg-[#000000]", text: "text-[#000000]", border: "border-[#000000]" },   // Black
  QMB: { bg: "bg-[#DC2626]", text: "text-[#DC2626]", border: "border-[#DC2626]" },    // Bright Red
};

const EditProjectModal = ({ open, onOpenChange, project, onSuccess }: EditProjectModalProps) => {
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [projectDate, setProjectDate] = useState<Date>(new Date());
  const [engineerName, setEngineerName] = useState("");
  const [userName, setUserName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSocial, setContactSocial] = useState("");
  const [branch, setBranch] = useState<"ADC" | "QGDC" | "QMB" | "">("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setProjectId(project.project_id);
      setDescription(project.description);
      setStatus(project.status);
      setProjectDate(new Date(project.project_date));
      setEngineerName(project.engineer_name);
      setUserName(project.user_name);
      setContactPhone(project.contact_phone || "");
      setContactEmail(project.contact_email || "");
      setContactSocial(project.contact_social || "");
      setBranch(project.branch);
      setAdditionalDetails(project.additional_details || "");
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project || !projectId || !description || !engineerName || !userName || !branch) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        project_id: projectId,
        description,
        status,
        project_date: format(projectDate, 'yyyy-MM-dd'),
        engineer_name: engineerName,
        user_name: userName,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        contact_social: contactSocial || null,
        branch,
        additional_details: additionalDetails || null,
      };

      console.log('Updating project with data:', updateData);

      // First, try update without select to avoid RLS issues
      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      console.log('Update successful');

      // Verify the update by fetching the record
      const { data: verifyData, error: verifyError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
        // Still show success since update didn't error
      } else {
        console.log('Verified updated data:', verifyData);
      }

      toast({
        title: "✅ Success!",
        description: "Project has been updated successfully. Changes will appear immediately.",
        duration: 2000,
      });

      // Call success callback and close modal
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (urls: string[], index: number) => {
    setImageUrls(urls);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="projectId" className="text-sm">Project ID *</Label>
              <Input
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="branch" className="text-sm">Branch *</Label>
              <Select value={branch} onValueChange={(value: "ADC" | "QGDC" | "QMB") => setBranch(value)}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADC">
                    <span className={cn("font-medium text-sm", branchColors.ADC.text)}>ADC (Teal Green)</span>
                  </SelectItem>
                  <SelectItem value="QGDC">
                    <span className={cn("font-medium text-sm", branchColors.QGDC.text)}>QGDC (Black)</span>
                  </SelectItem>
                  <SelectItem value="QMB">
                    <span className={cn("font-medium text-sm", branchColors.QMB.text)}>QMB (Red)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm">Project Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              className="text-sm sm:text-base resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-sm">Active</SelectItem>
                  <SelectItem value="completed" className="text-sm">Completed</SelectItem>
                  <SelectItem value="inactive" className="text-sm">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Project Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm sm:text-base h-9 sm:h-10",
                      !projectDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {projectDate ? format(projectDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={projectDate}
                    onSelect={(date) => date && setProjectDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="engineerName" className="text-sm">Project Engineer *</Label>
              <Input
                id="engineerName"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                placeholder="Engineer name"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="userName" className="text-sm">Time Keeper/Checker *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Time keeper name"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="contactPhone" className="text-sm">Phone Number</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Contact phone"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="contactEmail" className="text-sm">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contact email"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="contactSocial" className="text-sm">Social Media</Label>
            <Input
              id="contactSocial"
              value={contactSocial}
              onChange={(e) => setContactSocial(e.target.value)}
              placeholder="Facebook, etc."
              className="text-sm sm:text-base"
            />
          </div>

          {project.image_url && (() => {
            const projectImageUrls = project.image_url.split(',').filter(Boolean).map(url => url.trim());
            return projectImageUrls.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Project Images ({projectImageUrls.length})</Label>
                <div className={`grid gap-2 sm:gap-3 ${
                  projectImageUrls.length === 1 ? 'grid-cols-1' :
                  projectImageUrls.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 sm:grid-cols-3'
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
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded pointer-events-none">
                        {index + 1}/{projectImageUrls.length}
                      </div>
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="bg-white/90 px-2 py-1 rounded text-[10px] sm:text-xs font-medium">
                          Click to enlarge
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Note: Images are view-only. Contact support to modify project images.
                </p>
              </div>
            );
          })()}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="additionalDetails" className="text-sm">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="text-sm sm:text-base resize-none"
            />
          </div>

          <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <span className="font-medium">Location:</span> {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full sm:w-auto text-sm"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
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

export default EditProjectModal;

