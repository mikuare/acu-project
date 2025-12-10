import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X, CheckCircle, Loader2, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    branch: "ADC" | "QGDC" | "QMB";
    image_url: string | null;
    document_urls: string | null;
    additional_details: string | null;
    // Implementation details (optional)
    completion_date?: string;
    implementation_notes?: string;
    verification_images?: string;
    verification_documents?: string;
}

interface MarkImplementedPanelProps {
    project: Project | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const branchColors = {
    ADC: "bg-[#006D5B] text-white",
    QGDC: "bg-[#000000] text-white",
    QMB: "bg-[#DC2626] text-white",
};

const MarkImplementedPanel = ({ project, onSuccess, onCancel }: MarkImplementedPanelProps) => {
    const [completionDate, setCompletionDate] = useState(
        project?.completion_date || new Date().toISOString().split('T')[0]
    );
    const [notes, setNotes] = useState(project?.implementation_notes || "");
    const [status, setStatus] = useState(project?.status || 'ongoing');
    const [keptImages, setKeptImages] = useState<string[]>(project?.verification_images ? project.verification_images.split(',') : []);
    const [keptDocs, setKeptDocs] = useState<string[]>(project?.verification_documents ? project.verification_documents.split(',') : []);
    const [verificationImages, setVerificationImages] = useState<File[]>([]);
    const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(project?.status !== 'implemented');

    if (!project) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setVerificationImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setVerificationDocs(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setVerificationImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeDoc = (index: number) => {
        setVerificationDocs(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
        try {
            // Preserve original filename with timestamp prefix
            const fileName = `${Date.now()}_${file.name}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error(`Error uploading to ${bucket}:`, error);
            return null;
        }
    };

    const handleSubmit = async () => {


        setIsSubmitting(true);

        try {
            // Upload verification files
            let uploadedImageUrls: string[] = [];
            let uploadedDocUrls: string[] = [];

            // Upload images
            for (const img of verificationImages) {
                const url = await uploadFile(img, 'project-images');
                if (url) uploadedImageUrls.push(url);
            }

            // Upload documents
            for (const doc of verificationDocs) {
                const url = await uploadFile(doc, 'project-documents');
                if (url) uploadedDocUrls.push(url);
            }

            // Combine with existing files


            // Combine with kept files (not using project props directly anymore)
            const finalImages = [...keptImages, ...uploadedImageUrls];
            const finalDocs = [...keptDocs, ...uploadedDocUrls];

            // Create or update implementation record
            const { error: updateError } = await (supabase as any)
                .from('project_implementations')
                .upsert({
                    project_id: project.id,
                    status: status,
                    completion_date: completionDate,
                    implementation_notes: notes,
                    verification_images: finalImages.length > 0 ? (finalImages.join(',') as string) : null,
                    verification_documents: finalDocs.length > 0 ? (finalDocs.join(',') as string) : null,
                }, { onConflict: 'project_id' });

            if (updateError) throw updateError;

            toast({
                title: "✅ Success!",
                description: `Project ${project.project_id} marked as implemented.`,
            });

            onSuccess();
        } catch (error: any) {
            console.error('Error marking as implemented:', error);
            toast({
                title: "❌ Error",
                description: error.message || "Failed to update project.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={!!project} onOpenChange={() => !isSubmitting && onCancel()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {project.status === 'implemented' ? 'Update Implementation' : 'Mark as Implemented'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">{project.project_id}</span>
                            <Badge className={branchColors[project.branch]}>{project.branch}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            {isEditing ? (
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-8 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="implemented">Implemented</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant="outline" className={project.status === 'implemented' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                                    {project.status}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Completion Date */}
                    <div className="space-y-2">
                        <Label htmlFor="completionDate">Completion Date *</Label>
                        <Input
                            id="completionDate"
                            type="date"
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                            disabled={!isEditing}
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-filled to today. You can change if needed.
                        </p>
                    </div>

                    {/* Implementation Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Implementation Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about the implementation..."
                            rows={3}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Existing Verification Images */}
                    {keptImages.length > 0 && (
                        <div className="space-y-2">
                            <Label>Existing Images</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {keptImages.map((url, i) => (
                                    <div key={i} className="relative group aspect-video">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full h-full"
                                        >
                                            <img
                                                src={url}
                                                alt={`Verification ${i}`}
                                                className="w-full h-full object-cover rounded border transition-transform hover:scale-105"
                                            />
                                        </a>
                                        {isEditing && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setKeptImages(prev => prev.filter((_, idx) => idx !== i));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Images */}
                    {isEditing && (
                        <div className="space-y-2">
                            <Label>Add New Images</Label>
                            {verificationImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {verificationImages.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Verification ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Existing Verification Documents */}
                    {keptDocs.length > 0 && (
                        <div className="space-y-2">
                            <Label>Existing Documents</Label>
                            <div className="flex flex-wrap gap-2">
                                {keptDocs.map((url, i) => (
                                    <div key={i} className="relative group flex items-center bg-muted rounded pr-2">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 px-2 py-1"
                                        >
                                            Document {i + 1}
                                        </a>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setKeptDocs(prev => prev.filter((_, idx) => idx !== i));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Documents */}
                    {isEditing && (
                        <div className="space-y-2">
                            <Label>Add New Documents</Label>
                            {verificationDocs.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {verificationDocs.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                            <span className="text-sm truncate">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDoc(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                multiple
                                onChange={handleDocUpload}
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    {isEditing ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !completionDate}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {project.status === 'implemented' ? 'Save Changes' : 'Mark as Implemented'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Data
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MarkImplementedPanel;
