import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, CloudUpload } from "lucide-react";

interface ReportProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: any;
}

const REPORT_CATEGORIES = [
    "completed",
    "defective",
    "duplicate",
    "unfinished",
    "ghost",
    "finished project",
    "subject for edit",
    "for deletion"
];

const ReportProjectModal = ({ open, onOpenChange, project }: ReportProjectModalProps) => {
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            // Filter files larger than 10MB
            const validFiles = newFiles.filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    toast({
                        title: "File too large",
                        description: `${file.name} exceeds 10MB limit`,
                        variant: "destructive",
                    });
                    return false;
                }
                return true;
            });

            if (files.length + validFiles.length > 5) {
                toast({
                    title: "Too many files",
                    description: "Maximum 5 files allowed",
                    variant: "destructive",
                });
                return;
            }
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!category || !message) {
            toast({
                title: "Missing required fields",
                description: "Please select a category and enter a message.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let proofUrls: string[] = [];

            // Upload files
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('report-proofs')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('report-proofs')
                        .getPublicUrl(fileName);

                    proofUrls.push(publicUrl);
                }
            }

            // Submit report
            const { error } = await supabase
                .from('project_reports')
                .insert({
                    project_id: project.id,
                    category,
                    reporter_name: name || null,
                    reporter_email: email || null,
                    reporter_phone: contactNumber || null,
                    message,
                    proof_urls: proofUrls.length > 0 ? proofUrls : null,
                    status: 'pending'
                });

            if (error) throw error;

            toast({
                title: "Report Submitted",
                description: "Thank you for your report. It has been submitted for review.",
            });

            onOpenChange(false);
            // Reset form
            setCategory("");
            setName("");
            setEmail("");
            setContactNumber("");
            setMessage("");
            setFiles([]);

        } catch (error: any) {
            console.error('Error submitting report:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to submit report. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 border-0">
                <div className="bg-[#FF5722] p-4 text-center">
                    <DialogTitle className="text-white text-xl font-bold uppercase tracking-wide">
                        I-REPORT
                    </DialogTitle>
                </div>

                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* Category */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Label className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground z-10">
                                Category *
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="-- Please select --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat} className="capitalize">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Name */}
                    <Input
                        placeholder="Name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                    />

                    {/* Email */}
                    <Input
                        placeholder="Email (optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                    />

                    {/* Contact Number */}
                    <Input
                        placeholder="Contact Number (optional)"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="h-11"
                    />

                    {/* Message */}
                    <Textarea
                        placeholder="Message *"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] resize-none p-3"
                    />

                    {/* File Upload */}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-2 bg-muted/5 relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex justify-center">
                            <div className="bg-blue-500 rounded-full p-2 text-white">
                                <CloudUpload className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-blue-500 font-medium text-sm">Drop files here or click to upload</p>
                            <p className="text-xs text-muted-foreground">Upload photo or video proof (optional)</p>
                            <p className="text-xs text-muted-foreground">Maximum 5 files, 10MB each</p>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-background">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="font-semibold text-muted-foreground hover:text-foreground"
                    >
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold px-6"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                SUBMITTING...
                            </>
                        ) : (
                            "SUBMIT REPORT"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReportProjectModal;
