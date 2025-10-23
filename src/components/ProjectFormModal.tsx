import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Camera } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [projectDate, setProjectDate] = useState<Date>(new Date());
  const [engineerName, setEngineerName] = useState("");
  const [userName, setUserName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSocial, setContactSocial] = useState("");
  const [branch, setBranch] = useState<"ADC" | "QGDC" | "QMB" | "">("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 5;

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

  const handleSubmit = async () => {
    if (!projectId || !description || !engineerName || !userName || !branch) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

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

      // Insert project data (store multiple URLs as comma-separated string)
      const { error: insertError } = await supabase.from('projects').insert({
        project_id: projectId,
        description,
        status: 'active',
        project_date: format(projectDate, 'yyyy-MM-dd'),
        engineer_name: engineerName,
        user_name: userName,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        contact_social: contactSocial || null,
        branch,
        latitude,
        longitude,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
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
      setProjectDate(new Date());
      setEngineerName("");
      setUserName("");
      setContactPhone("");
      setContactEmail("");
      setContactSocial("");
      setBranch("");
      setAdditionalDetails("");
      setImageFiles([]);
      setImagePreviews([]);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to submit project. Please try again.",
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

          <div className="space-y-2">
            <Label>Project Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !projectDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {projectDate ? format(projectDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={projectDate}
                  onSelect={(date) => date && setProjectDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormModal;
