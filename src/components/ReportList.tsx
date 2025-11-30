import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";

interface ProjectReport {
    id: string;
    project_id: string;
    category: string;
    reporter_name: string | null;
    reporter_email: string | null;
    reporter_phone: string | null;
    message: string;
    proof_urls: string[] | null;
    status: 'pending' | 'catered' | 'cancelled';
    resolution_message: string | null;
    resolved_by: string | null;
    created_at: string;
    projects?: {
        project_id: string;
        description: string;
    };
}

const ReportList = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
    const [resolutionMessage, setResolutionMessage] = useState("");

    const loadReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('project_reports')
                .select(`
          *,
          projects (
            project_id,
            description
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
            toast({
                title: "Error",
                description: "Failed to load reports",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: 'catered' | 'cancelled', message?: string, resolvedBy?: string) => {
        setProcessingId(id);
        try {
            const updateData: any = { status: newStatus };
            if (newStatus === 'catered') {
                if (message) updateData.resolution_message = message;
                if (resolvedBy) updateData.resolved_by = resolvedBy;
            }

            const { error } = await supabase
                .from('project_reports')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            setReports(prev => prev.map(r => r.id === id ? {
                ...r,
                status: newStatus,
                resolution_message: message || r.resolution_message,
                resolved_by: resolvedBy || r.resolved_by
            } : r));

            if (selectedReport?.id === id) {
                setSelectedReport(prev => prev ? {
                    ...prev,
                    status: newStatus,
                    resolution_message: message || prev.resolution_message,
                    resolved_by: resolvedBy || prev.resolved_by
                } : null);
            }

            toast({
                title: "Status Updated",
                description: `Report marked as ${newStatus}`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Error",
                description: "Failed to update report status",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleCaterClick = () => {
        if (!resolutionMessage.trim()) {
            toast({
                title: "Resolution Message Required",
                description: "Please enter a resolution message before catering the report.",
                variant: "destructive",
            });
            return;
        }

        const adminName = user?.user_metadata?.full_name || user?.email || 'Admin';

        if (selectedReport) {
            handleStatusUpdate(selectedReport.id, 'catered', resolutionMessage, adminName);
            setResolutionDialogOpen(false);
            setResolutionMessage("");
        }
    };

    const openDetails = (report: ProjectReport) => {
        setSelectedReport(report);
        setDetailsOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'catered':
                return <Badge className="bg-green-500 hover:bg-green-600">Catered</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Project Reports</CardTitle>
                    <CardDescription>Manage user submitted reports for projects</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No reports found
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Project ID</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(report.created_at), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {report.projects?.project_id || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                <Badge variant="outline">{report.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {report.reporter_name || 'Anonymous'}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(report.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetails(report)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Report Details</DialogTitle>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Project ID</p>
                                    <p className="font-bold text-lg">{selectedReport.projects?.project_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>

                            {/* Report Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Category</p>
                                    <p className="text-sm capitalize font-medium">{selectedReport.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Date Submitted</p>
                                    <p className="text-sm">{format(new Date(selectedReport.created_at), 'PPP p')}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Reporter Name</p>
                                    <p className="text-sm">{selectedReport.reporter_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Contact</p>
                                    <p className="text-sm">{selectedReport.reporter_phone || selectedReport.reporter_email || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Message</p>
                                <p className="text-sm whitespace-pre-wrap">{selectedReport.message}</p>
                            </div>

                            {/* Resolution Message */}
                            {selectedReport.resolution_message && (
                                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Resolution Message</p>
                                    <p className="text-sm text-green-900 dark:text-green-100 whitespace-pre-wrap">{selectedReport.resolution_message}</p>
                                    {selectedReport.resolved_by && (
                                        <p className="text-xs text-green-700 dark:text-green-300 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                            Resolved by: <span className="font-semibold">{selectedReport.resolved_by}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Proofs */}
                            {selectedReport.proof_urls && selectedReport.proof_urls.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Attached Proofs</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedReport.proof_urls.map((url, idx) => (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                                            >
                                                <img src={url} alt="Proof" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedReport.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => setResolutionDialogOpen(true)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === selectedReport.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Cater Report
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate(selectedReport.id, 'cancelled')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === selectedReport.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Cancel Report
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Resolution Message Dialog */}
            <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Enter Resolution Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide a resolution message explaining how this report was addressed.
                        </p>
                        <Textarea
                            placeholder="Enter resolution message..."
                            value={resolutionMessage}
                            onChange={(e) => setResolutionMessage(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResolutionDialogOpen(false);
                                setResolutionMessage("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleCaterClick}
                            disabled={!!processingId}
                        >
                            {processingId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Submit & Cater
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReportList;
