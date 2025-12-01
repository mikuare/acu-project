import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X as XIcon, MapPin, Trash2 } from "lucide-react";
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
  contract_cost: number | null;
  region: string | null;
  province: string | null;
  category_type: string | null;
}

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

const branchColors = {
  ADC: { bg: "bg-[#006D5B]", text: "text-[#006D5B]", border: "border-[#006D5B]" },
  QGDC: { bg: "bg-[#000000]", text: "text-[#000000]", border: "border-[#000000]" },
  QMB: { bg: "bg-[#DC2626]", text: "text-[#DC2626]", border: "border-[#DC2626]" },
};

const EditProjectModal = ({ open, onOpenChange, project, onSuccess }: EditProjectModalProps) => {
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not_started");
  const [effectivityDate, setEffectivityDate] = useState<Date | undefined>();
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [contractCost, setContractCost] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [userName, setUserName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSocial, setContactSocial] = useState("");
  const [branch, setBranch] = useState<"ADC" | "QGDC" | "QMB" | "">("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingDocUrls, setExistingDocUrls] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setProjectId(project.project_id);
      setDescription(project.description);
      setStatus(project.status);
      setEffectivityDate(project.effectivity_date ? new Date(project.effectivity_date) : undefined);
      setActualStartDate(project.actual_start_date ? new Date(project.actual_start_date) : undefined);
      setExpiryDate(project.expiry_date ? new Date(project.expiry_date) : undefined);
      setContractCost(project.contract_cost?.toString() || "");
      setEngineerName(project.engineer_name);
      setUserName(project.user_name);
      setContactPhone(project.contact_phone || "");
      setContactEmail(project.contact_email || "");
      setContactSocial(project.contact_social || "");
      setBranch(project.branch);
      setAdditionalDetails(project.additional_details || "");
      setLatitude(project.latitude.toString());
      setLongitude(project.longitude.toString());

      // Set existing images
      if (project.image_url) {
        setExistingImageUrls(project.image_url.split(',').filter(Boolean).map(url => url.trim()));
      } else {
        setExistingImageUrls([]);
      }

      // Set existing documents
      if (project.document_urls) {
        setExistingDocUrls(project.document_urls.split(',').filter(Boolean).map(url => url.trim()));
      } else {
        setExistingDocUrls([]);
      }

      setNewImages([]);
      setNewDocuments([]);
    }
  }, [project?.id, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (index: number) => {
    setExistingDocUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewDoc = (index: number) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!project || !projectId || !description || !engineerName || !userName || !branch) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid location",
        description: "Please enter valid latitude and longitude",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      let uploadedImageUrls: string[] = [];
      for (const file of newImages) {
        const url = await uploadFile(file, 'project-images');
        if (url) uploadedImageUrls.push(url);
      }

      // Upload new documents
      let uploadedDocUrls: string[] = [];
      for (const file of newDocuments) {
        const url = await uploadFile(file, 'project-documents');
        if (url) uploadedDocUrls.push(url);
      }

      // Combine existing and new URLs
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];
      const allDocUrls = [...existingDocUrls, ...uploadedDocUrls];

      const updateData = {
        project_id: projectId,
        description,
        status,
        effectivity_date: effectivityDate ? format(effectivityDate, 'yyyy-MM-dd') : null,
        actual_start_date: actualStartDate ? format(actualStartDate, 'yyyy-MM-dd') : null,
        expiry_date: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : null,
        project_date: actualStartDate ? format(actualStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        contract_cost: contractCost ? parseFloat(contractCost) : null,
        engineer_name: engineerName,
        user_name: userName,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        contact_social: contactSocial || null,
        branch,
        additional_details: additionalDetails || null,
        latitude: lat,
        longitude: lng,
        image_url: allImageUrls.length > 0 ? allImageUrls.join(',') : null,
        document_urls: allDocUrls.length > 0 ? allDocUrls.join(',') : null,
      };

      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "✅ Success!",
        description: "Project has been updated successfully.",
        duration: 2000,
      });

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

  const allImagesToDisplay = [
    ...existingImageUrls.map(url => ({ type: 'existing' as const, url })),
    ...newImages.map(file => ({ type: 'new' as const, url: URL.createObjectURL(file), file }))
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Project Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Project ID and Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID *</Label>
                <Input
                  id="projectId"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Enter project ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select value={branch} onValueChange={(value: "ADC" | "QGDC" | "QMB") => setBranch(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADC">
                      <span className={cn("font-medium", branchColors.ADC.text)}>ADC (Teal Green)</span>
                    </SelectItem>
                    <SelectItem value="QGDC">
                      <span className={cn("font-medium", branchColors.QGDC.text)}>QGDC (Black)</span>
                    </SelectItem>
                    <SelectItem value="QMB">
                      <span className={cn("font-medium", branchColors.QMB.text)}>QMB (Red)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            {/* Status and Contract Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Yet Started</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="terminated">Terminated/Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractCost">Contract Cost</Label>
                <Input
                  id="contractCost"
                  type="number"
                  value={contractCost}
                  onChange={(e) => setContractCost(e.target.value)}
                  placeholder="Enter contract cost"
                />
              </div>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Effectivity Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {effectivityDate ? format(effectivityDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={effectivityDate} onSelect={setEffectivityDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Actual Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {actualStartDate ? format(actualStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={actualStartDate} onSelect={setActualStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Engineer and Time Keeper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engineerName">Project Engineer *</Label>
                <Input
                  id="engineerName"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  placeholder="Engineer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Time Keeper/Checker *</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Time keeper name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Contact email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactSocial">Social Media</Label>
                <Input id="contactSocial" value={contactSocial} onChange={(e) => setContactSocial(e.target.value)} placeholder="Facebook, etc." />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input id="latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input id="longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Project Images</Label>
              {allImagesToDisplay.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                  {allImagesToDisplay.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer"
                        onClick={() => img.type === 'existing' && handleImageClick(existingImageUrls, existingImageUrls.indexOf(img.url))}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => img.type === 'existing' ? removeExistingImage(existingImageUrls.indexOf(img.url)) : removeNewImage(newImages.findIndex(f => URL.createObjectURL(f) === img.url))}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
                <p className="text-xs text-muted-foreground mt-1">Upload new images or keep existing ones</p>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Project Documents</Label>
              {existingDocUrls.length > 0 && (
                <div className="space-y-2 mb-2">
                  {existingDocUrls.map((url, index) => {
                    const fileName = url.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{decodeURIComponent(fileName)}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeExistingDoc(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {newDocuments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {newDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm truncate">{file.name} (New)</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeNewDoc(index)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleDocumentUpload} className="cursor-pointer" />
                <p className="text-xs text-muted-foreground mt-1">Upload new documents or keep existing ones</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details</Label>
              <Textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
