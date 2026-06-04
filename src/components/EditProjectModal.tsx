import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { X as XIcon, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { optimizeImageFile } from "@/utils/optimizeImageFile";
import { joinStoredUrls, splitStoredUrls } from "@/utils/projectMedia";
import { optimizeStoredImages } from "@/utils/optimizeStoredImages";
import { useAppSettings } from "@/contexts/AppSettingsContext";

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
  updated_at?: string | null;
  created_by?: string | null;
  created_by_email?: string | null;
  updated_by?: string | null;
  updated_by_email?: string | null;
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

const DOCUMENT_ACCEPT_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,application/zip,application/x-zip-compressed";

interface PhotoInfoForm {
  componentId: string;
  purpose: string;
  dateCaptured: string;
  location: string;
}

const getPhotoFileName = (url: string) => {
  const path = url.split("?")[0];
  return decodeURIComponent(path.split("/").pop() || "Project photo");
};

const getComponentIdFromPhotoName = (url: string) => {
  const fileName = getPhotoFileName(url);
  return fileName.replace(/\.[^/.]+$/, "").replace(/^\d+_/, "") || "Project photo";
};

const getUploadedDateFromPhotoName = (url: string, fallbackDate: string) => {
  const fileName = getPhotoFileName(url);
  const timestamp = fileName.match(/^(\d{13})_/)?.[1];
  const parsedDate = timestamp ? new Date(Number(timestamp)) : new Date(fallbackDate);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString().slice(0, 10);
};

const getUserDisplayName = (user: any) =>
  user?.user_metadata?.full_name ||
  user?.user_metadata?.display_name ||
  user?.user_metadata?.name ||
  user?.email ||
  null;

const getChangedFields = (before: Project, after: Record<string, any>) => {
  const changes: Record<string, { from: any; to: any }> = {};
  const skippedFields = new Set(["updated_by", "updated_by_email"]);

  Object.entries(after).forEach(([key, value]) => {
    if (skippedFields.has(key)) return;
    const previous = (before as any)[key];
    if ((previous ?? null) !== (value ?? null)) {
      changes[key] = { from: previous ?? null, to: value ?? null };
    }
  });

  return changes;
};

const EditProjectModal = ({ open, onOpenChange, project, onSuccess }: EditProjectModalProps) => {
  const { projectStatuses } = useAppSettings();
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not_started");
  const [effectivityDate, setEffectivityDate] = useState("");
  const [actualStartDate, setActualStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
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
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingDocUrls, setExistingDocUrls] = useState<string[]>([]);
  const [isOptimizingExistingImages, setIsOptimizingExistingImages] = useState(false);
  const [photoEditorUrl, setPhotoEditorUrl] = useState<string | null>(null);
  const [photoInfoForm, setPhotoInfoForm] = useState<PhotoInfoForm>({
    componentId: "",
    purpose: "attachment",
    dateCaptured: "",
    location: "",
  });
  const [isSavingPhotoInfo, setIsSavingPhotoInfo] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectId(project.project_id);
      setDescription(project.description);
      setStatus(project.status);
      setEffectivityDate(project.effectivity_date || "");
      setActualStartDate(project.actual_start_date || "");
      setExpiryDate(project.expiry_date || "");
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
        setExistingImageUrls(splitStoredUrls(project.image_url));
      } else {
        setExistingImageUrls([]);
      }

      // Set existing documents
      if (project.document_urls) {
        setExistingDocUrls(splitStoredUrls(project.document_urls));
      } else {
        setExistingDocUrls([]);
      }

      setNewImages([]);
      setNewDocuments([]);
      setPhotoEditorUrl(null);
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
    const uploadTarget = bucket === 'project-images'
      ? await optimizeImageFile(file)
      : file;

    // Preserve original filename with timestamp prefix to prevent conflicts
    const fileName = `${Date.now()}_${uploadTarget.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, uploadTarget);

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
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user ?? null;

      const updateData = {
        project_id: projectId,
        description,
        status,
        effectivity_date: effectivityDate || null,
        actual_start_date: actualStartDate || null,
        expiry_date: expiryDate || null,
        project_date: actualStartDate || new Date().toISOString().split('T')[0],
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
        updated_by: currentUser?.id ?? null,
        updated_by_email: currentUser?.email ?? null,
      };
      const auditChanges = getChangedFields(project, {
        ...updateData,
        status,
      });

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          ...updateData,
          status: status as any, // Cast to any since we're limiting values via dropdown
        })
        .eq('id', project.id);

      if (updateError) {
        throw updateError;
      }

      if (currentUser) {
        const { error: auditError } = await (supabase as any)
          .from('project_audit_logs')
          .insert({
            project_id: project.id,
            action: 'updated',
            changed_by: currentUser.id,
            changed_by_email: currentUser.email,
            changed_by_name: getUserDisplayName(currentUser),
            changes: auditChanges,
          });

        if (auditError) {
          console.error("Error saving project audit log:", auditError);
        }
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

  const handlePhotoInfoClick = async (url: string) => {
    if (!project) return;

    const defaultForm = {
      componentId: getComponentIdFromPhotoName(url),
      purpose: "attachment",
      dateCaptured: getUploadedDateFromPhotoName(url, project.project_date || new Date().toISOString()),
      location: `${project.latitude.toFixed(7)}, ${project.longitude.toFixed(7)}`,
    };

    setPhotoEditorUrl(url);
    setPhotoInfoForm(defaultForm);

    const { data, error } = await (supabase as any)
      .from("project_photo_metadata")
      .select("component_id, purpose, date_captured, location")
      .eq("project_id", project.id)
      .eq("photo_url", url)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading photo metadata:", error);
      toast({
        title: "Photo metadata unavailable",
        description: "Using default values until the metadata table is available.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setPhotoInfoForm({
        componentId: data.component_id || defaultForm.componentId,
        purpose: data.purpose || defaultForm.purpose,
        dateCaptured: data.date_captured || defaultForm.dateCaptured,
        location: data.location || defaultForm.location,
      });
    }
  };

  const handleSavePhotoInfo = async () => {
    if (!project || !photoEditorUrl) return;

    setIsSavingPhotoInfo(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await (supabase as any)
        .from("project_photo_metadata")
        .upsert(
          {
            project_id: project.id,
            photo_url: photoEditorUrl,
            component_id: photoInfoForm.componentId.trim() || null,
            purpose: photoInfoForm.purpose.trim() || "attachment",
            date_captured: photoInfoForm.dateCaptured || null,
            location: photoInfoForm.location.trim() || null,
            updated_by: sessionData.session?.user.id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_id,photo_url" },
        );

      if (error) throw error;

      const { error: auditError } = await (supabase as any)
        .from("project_audit_logs")
        .insert({
          project_id: project.id,
          action: "photo_metadata_updated",
          changed_by: sessionData.session?.user.id ?? null,
          changed_by_email: sessionData.session?.user.email ?? null,
          changed_by_name: getUserDisplayName(sessionData.session?.user),
          changes: {
            photo_url: photoEditorUrl,
            component_id: photoInfoForm.componentId.trim() || null,
            purpose: photoInfoForm.purpose.trim() || "attachment",
            date_captured: photoInfoForm.dateCaptured || null,
            location: photoInfoForm.location.trim() || null,
          },
        });

      if (auditError) {
        console.error("Error saving photo metadata audit log:", auditError);
      }

      toast({
        title: "Photo information saved",
        description: "This photo metadata will show in project details.",
      });
      setPhotoEditorUrl(null);
    } catch (error: any) {
      console.error("Error saving photo metadata:", error);
      toast({
        title: "Could not save photo information",
        description: error.message || "Apply the photo metadata migration, then try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPhotoInfo(false);
    }
  };

  const handleOptimizeExistingImages = async () => {
    if (!project || existingImageUrls.length === 0) return;

    setIsOptimizingExistingImages(true);

    try {
      const { urls: optimizedUrls, replacedCount } = await optimizeStoredImages(existingImageUrls, 'project-images');

      if (replacedCount === 0) {
        toast({
          title: "No optimization needed",
          description: "These stored images are already small enough.",
        });
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          image_url: joinStoredUrls(optimizedUrls),
        })
        .eq('id', project.id);

      if (error) throw error;

      setExistingImageUrls(optimizedUrls);

      toast({
        title: "Images optimized",
        description: `${replacedCount} existing project image${replacedCount === 1 ? '' : 's'} replaced with faster copies.`,
      });
    } catch (error: any) {
      console.error("Error optimizing project images:", error);
      toast({
        title: "Optimization failed",
        description: error.message || "Could not optimize existing project images.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizingExistingImages(false);
    }
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
            <DialogDescription className="sr-only">
              Update project information, location, and attached files for the selected project.
            </DialogDescription>
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
                    {projectStatuses.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
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
                <Label htmlFor="effectivityDate">Effectivity Date</Label>
                <Input
                  id="effectivityDate"
                  type="date"
                  value={effectivityDate}
                  onChange={(e) => setEffectivityDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={actualStartDate}
                  onChange={(e) => setActualStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Project Images</Label>
                {existingImageUrls.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOptimizeExistingImages}
                    disabled={isSubmitting || isOptimizingExistingImages}
                  >
                    {isOptimizingExistingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      "Optimize Existing Images"
                    )}
                  </Button>
                )}
              </div>
              {allImagesToDisplay.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                  {allImagesToDisplay.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer"
                        onClick={() => img.type === 'existing' && handlePhotoInfoClick(img.url)}
                      />
                      {img.type === 'existing' && (
                        <div className="pointer-events-none absolute inset-x-1 bottom-1 rounded bg-black/70 px-2 py-1 text-center text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Edit photo info
                        </div>
                      )}
                      {img.type === 'new' && (
                        <div className="pointer-events-none absolute inset-x-1 bottom-1 rounded bg-blue-600/80 px-2 py-1 text-center text-[10px] font-medium text-white">
                          New image
                        </div>
                      )}
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
                <p className="text-xs text-muted-foreground mt-1">Upload new images or keep existing ones. Use optimize for older slow-loading uploads.</p>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Project Documents</Label>
              {existingDocUrls.length > 0 && (
                <div className="space-y-2 mb-2">
                  {existingDocUrls.map((url, index) => {
                    const fileName = url.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
                    // Remove timestamp prefix to show original filename
                    const readableName = decodeURIComponent(fileName).replace(/^\d+_/, '') || fileName;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{readableName}</span>
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
                <Input type="file" multiple accept={DOCUMENT_ACCEPT_TYPES} onChange={handleDocumentUpload} className="cursor-pointer" />
                <p className="text-xs text-muted-foreground mt-1">Upload new documents or keep existing ones. Supported files: PDF, Word, Excel, text, CSV, and ZIP.</p>
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
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isOptimizingExistingImages}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isOptimizingExistingImages}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!photoEditorUrl} onOpenChange={(nextOpen) => !nextOpen && setPhotoEditorUrl(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Photo Information</DialogTitle>
            <DialogDescription>
              Configure the photo metadata shown to users in the project gallery.
            </DialogDescription>
          </DialogHeader>

          {photoEditorUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={photoEditorUrl}
                    alt={photoInfoForm.componentId || "Project photo"}
                    className="max-h-[60vh] w-full object-contain"
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">{getPhotoFileName(photoEditorUrl)}</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-photo-component-id">Component ID</Label>
                  <Input
                    id="edit-photo-component-id"
                    value={photoInfoForm.componentId}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, componentId: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-photo-purpose">Purpose</Label>
                  <Input
                    id="edit-photo-purpose"
                    value={photoInfoForm.purpose}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, purpose: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-photo-date-captured">Date Captured</Label>
                  <Input
                    id="edit-photo-date-captured"
                    type="date"
                    value={photoInfoForm.dateCaptured}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, dateCaptured: event.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-photo-location">Location</Label>
                  <Input
                    id="edit-photo-location"
                    value={photoInfoForm.location}
                    onChange={(event) => setPhotoInfoForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    className="bg-[#FF5722] hover:bg-[#E64A19]"
                    onClick={handleSavePhotoInfo}
                    disabled={isSavingPhotoInfo}
                  >
                    {isSavingPhotoInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Photo Info
                  </Button>
                  <Button variant="outline" onClick={() => setPhotoEditorUrl(null)} disabled={isSavingPhotoInfo}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditProjectModal;
