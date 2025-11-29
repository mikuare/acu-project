import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Link, Mail, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectUrl: string;
}

const ShareProjectModal = ({ open, onOpenChange, projectUrl }: ShareProjectModalProps) => {

    const handleCopyLink = () => {
        navigator.clipboard.writeText(projectUrl);
        toast({
            title: "Link Copied",
            description: "Project link has been copied to clipboard.",
        });
    };

    const handleShare = (platform: string) => {
        let url = "";
        switch (platform) {
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
                break;
            case "twitter":
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}`;
                break;
            case "email":
                url = `mailto:?subject=Check out this project&body=${encodeURIComponent(projectUrl)}`;
                break;
        }
        if (url) window.open(url, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 bg-white dark:bg-slate-900 [&>button]:hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <DialogTitle className="text-lg font-semibold">Share Project</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-2 gap-8 justify-items-center">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleShare("facebook")}
                                className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Facebook className="w-8 h-8 fill-current" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Facebook</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleShare("twitter")}
                                className="w-16 h-16 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Twitter className="w-8 h-8 fill-current" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Twitter</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={handleCopyLink}
                                className="w-16 h-16 rounded-full bg-[#4B5563] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Link className="w-8 h-8" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Copy Link</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleShare("email")}
                                className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Mail className="w-8 h-8" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareProjectModal;
