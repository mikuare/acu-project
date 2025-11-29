import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Camera, FileText, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PROJECT_CATEGORIES, REGIONS, PROVINCES_BY_REGION, Region, getRegionForProvince } from "@/utils/philippineData";

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
  onSuccess: () => void;
}

const branchColors = {
  ADC: { bg: "bg-[#006D5B]", text: "text-[#006D5B]", border: "border-[#006D5B]" },    // Teal Green
  QGDC: { bg: "bg-[#000000]", text: "text-[#000000]", border: "border-[#000000]" },   // Black
  QMB: { bg: "bg-[#DC2626]", text: "text-[#DC2626]", border: "border-[#DC2626]" },    // Bright Red
};

const ProjectFormModal = ({ open, onOpenChange, latitude, longitude, onSuccess }: ProjectFormModalProps) => {
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");

  // Date States
  const [effectivityDate, setEffectivityDate] = useState<Date | undefined>(undefined);
  const [actualStartDate, setActualStartDate] = useState<Date | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const [engineerName, setEngineerName] = useState("");
  const [userName, setUserName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSocial, setContactSocial] = useState("");
  const [branch, setBranch] = useState<"ADC" | "QGDC" | "QMB" | "">("");
  const [category, setCategory] = useState("");
  const [contractCost, setContractCost] = useState("");

  // Location State
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [status, setStatus] = useState("ongoing");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 5;
  const MAX_DOCS = 5;

  // Automate Location Detection
  useEffect(() => {
    if (open && latitude && longitude) {
      detectLocation(latitude, longitude);
    }
  }, [open, latitude, longitude]);

  const detectLocation = async (lat: number, lng: number) => {
    setIsLocating(true);
    setLocationError("");
    setRegion("");
    setProvince("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        // Try to find province in address fields
        const detectedProvince = data.address.province || data.address.state || data.address.region;

        if (detectedProvince) {
          // Clean up province name (remove "Province" suffix if present)
          const cleanProvince = detectedProvince.replace(" Province", "").trim();

          // Attempt to find matching region
          const detectedRegion = getRegionForProvince(cleanProvince);

          if (detectedRegion) {
            setRegion(detectedRegion);
            setProvince(cleanProvince);
          } else {
            // Fallback: Try to match province directly against our list
            let found = false;
            for (const [reg, provs] of Object.entries(PROVINCES_BY_REGION)) {
              if (provs.some(p => cleanProvince.includes(p) || p.includes(cleanProvince))) {
                setRegion(reg);
                // Find the exact province name from our list
                const exactProv = provs.find(p => cleanProvince.includes(p) || p.includes(cleanProvince));
                setProvince(exactProv || cleanProvince);
                found = true;
                break;
              }
            }
            if (!found) {
              setLocationError(`Could not map location to a known region. Detected: ${cleanProvince}`);
              setProvince(cleanProvince); // Set it anyway so user can see
            }
          }
        } else {
          setLocationError("Could not detect province from location.");
        }
      }
    } catch (error) {
      console.error("Error detecting location:", error);
      setLocationError("Failed to detect location details.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (imageFiles.length + files.length > MAX_IMAGES) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${MAX_IMAGES} images`,
          variant: "destructive",
        });
        return;
      }

      const validFiles = files.filter(file => file.type.startsWith('image/'));

      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive",
        });
        return;
      }

      // Add new files
      setImageFiles(prev => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (documentFiles.length + files.length > MAX_DOCS) {
        toast({
          title: "Too many documents",
          description: `You can only upload up to ${MAX_DOCS} documents`,
          variant: "destructive",
        });
        return;
      }

      // Add new files
      setDocumentFiles(prev => [...prev, ...files]);
    }
  };

  const getPlaceName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      // Build place name from address components
      const address = data.address || {};
      const parts = [
        address.road || address.neighbourhood || address.suburb,
        address.city || address.town || address.municipality,
        address.province || address.state
      ].filter(Boolean);

      return parts.join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown Location';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Location';
    }
  };

  const handleCameraCapture = async () => {
    if (imageFiles.length >= MAX_IMAGES) {
      toast({
        title: "Maximum photos reached",
        description: `You can only capture up to ${MAX_IMAGES} photos`,
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      });

      // Create video element to show camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);

        // Get place name from coordinates
        const placeName = await getPlaceName(latitude, longitude);

        // Use the selected/pinned location (latitude & longitude props)
        // This ensures the geotag matches the project location, not user's current GPS
        const overlayHeight = 100;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`📍 ${placeName}`, 10, canvas.height - 70);
        ctx.font = '12px Arial';
        ctx.fillText(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, 10, canvas.height - 50);
        ctx.fillText(`🕐 ${new Date().toLocaleString()}`, 10, canvas.height - 30);
        ctx.fillText(`Photo ${imageFiles.length + 1} of ${MAX_IMAGES}`, 10, canvas.height - 10);

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = canvas.toDataURL('image/jpeg');

            setImageFiles(prev => [...prev, file]);
            setImagePreviews(prev => [...prev, preview]);

            toast({
              title: "📸 Photo Captured!",
              description: `Photo ${imageFiles.length + 1} with location geotag added`,
              duration: 2000,
            });
          }
        }, 'image/jpeg', 0.95);
      }

      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);

    } catch (error: any) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: error.message || "Could not access camera. Please use file upload instead.",
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!projectId || !description || !engineerName || !userName || !branch || !category || !region || !province) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields. Ensure location is detected.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      let documentUrls: string[] = [];

      // Upload all images if provided
      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(fileName, imageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        }
      }

      // Upload all documents if provided
      if (documentFiles.length > 0) {
        for (const docFile of documentFiles) {
          const fileExt = docFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('project-documents')
            .upload(fileName, docFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('project-documents')
            .getPublicUrl(fileName);

          documentUrls.push(publicUrl);
        }
      }

      // Insert project data
      const { error: insertError } = await supabase.from('projects').insert({
        project_id: projectId,
        description,
        status: status as any,
        category_type: category,
        region,
        province,
        contract_cost: contractCost ? parseFloat(contractCost) : null,

        // New Date Fields
        effectivity_date: effectivityDate ? format(effectivityDate, 'yyyy-MM-dd') : null,
        actual_start_date: actualStartDate ? format(actualStartDate, 'yyyy-MM-dd') : null,
        expiry_date: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : null,

        // Fallback for legacy project_date (use actual start or today)
        year: parseInt(format(actualStartDate || new Date(), 'yyyy')),
        project_date: format(actualStartDate || new Date(), 'yyyy-MM-dd'),

        engineer_name: engineerName,
        user_name: userName,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        contact_social: contactSocial || null,
        branch,
        latitude,
        longitude,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        document_urls: documentUrls.length > 0 ? documentUrls.join(',') : null,
        additional_details: additionalDetails || null,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Project has been added to the map",
      });

      // Reset form
      setProjectId("");
      setDescription("");
      setEffectivityDate(undefined);
      setActualStartDate(undefined);
      setExpiryDate(undefined);
      setEngineerName("");
      setUserName("");
      setContactPhone("");
      setContactEmail("");
      setContactSocial("");
      setBranch("");
      setCategory("");
      setContractCost("");
      setRegion("");
      setProvince("");
      setStatus("ongoing");
      setAdditionalDetails("");
      setImageFiles([]);
      setImagePreviews([]);
      setDocumentFiles([]);

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
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

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Effectivity Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !effectivityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectivityDate ? format(effectivityDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={effectivityDate}
                    onSelect={setEffectivityDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Actual Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !actualStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actualStartDate ? format(actualStartDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={actualStartDate}
                    onSelect={setActualStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="userName">Time Keeper/Checker Name *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Time keeper name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone Number</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Contact phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contact email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactSocial">Social Media</Label>
            <Input
              id="contactSocial"
              value={contactSocial}
              onChange={(e) => setContactSocial(e.target.value)}
              placeholder="Facebook, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              Project Images (Optional) - {imageFiles.length}/{MAX_IMAGES}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCameraCapture}
                className="flex items-center gap-2"
                disabled={imageFiles.length >= MAX_IMAGES}
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </Button>
              <Input
                id="image"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="cursor-pointer flex-1"
                disabled={imageFiles.length >= MAX_IMAGES}
              />
            </div>
            {imageFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1} of {imageFiles.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">
              Project Documents (Optional) - {documentFiles.length}/{MAX_DOCS}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="documents"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                multiple
                onChange={handleDocumentChange}
                className="cursor-pointer flex-1"
                disabled={documentFiles.length >= MAX_DOCS}
              />
            </div>
            {documentFiles.length > 0 && (
              <div className="space-y-2">
                {documentFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md border">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Yet Started</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated/Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contract Cost Field */}
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

          {/* Automated Location Display */}
          <div className="space-y-2">
            <Label>Location Details (Auto-Detected)</Label>
            <div className="p-3 bg-muted rounded-md border">
              {isLocating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Detecting region and province...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">
                      {region || "Region not detected"}
                    </span>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground">
                    {province || "Province not detected"}
                  </div>
                  {locationError && (
                    <div className="pl-6 text-xs text-destructive mt-1">
                      {locationError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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

          <div className="text-xs text-muted-foreground">
            Location: {latitude?.toFixed(6) || '0.000000'}, {longitude?.toFixed(6) || '0.000000'}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLocating || !region || !province}>
            {isSubmitting ? "Submitting..." : "Submit Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormModal;
