
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BER, IncidentReport } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Archive, Trash2, Eye, Pencil } from 'lucide-react';

const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-700"
};

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, report: null });
    const [archiveDialog, setArchiveDialog] = useState({ open: false, report: null });
    const navigate = useNavigate();

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [berData, incidentData] = await Promise.all([
                BER.list('-incident_date').catch(() => []),
                IncidentReport.list('-incident_date').catch(() => [])
            ]);

            // Assign a 'report_type' property to distinguish between BER and Incident Reports
            // and align with the badge display logic
            const allReports = [
                ...berData.map(r => ({ ...r, report_type: 'ber' })),
                ...incidentData.map(r => ({ ...r, report_type: 'incident' }))
            ].sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date));

            setReports(allReports);
            setFilteredReports(allReports);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setReports([]);
            setFilteredReports([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);
    
    useEffect(() => {
        const results = reports.filter(report =>
            report.site?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredReports(results);
    }, [searchTerm, reports]);
    
    const handleRowClick = (report) => {
        const isBER = report.report_type === 'ber';
        if (report.status === 'draft') {
            // Navigate to the creation/edit page for drafts
            const editPage = isBER ? 'CreateBER' : 'CreateIncidentReport'; 
            navigate(createPageUrl(`${editPage}?edit=${report.id}`));
        } else {
            // Navigate to the detail page for submitted/reviewed/completed/archived reports
            const detailPage = isBER ? 'BerDetail' : 'IncidentDetail';
            navigate(createPageUrl(`${detailPage}?id=${report.id}`));
        }
    };

    const handleArchive = async (report) => {
        try {
            const Model = report.report_type === 'ber' ? BER : IncidentReport;
            await Model.update(report.id, { status: 'archived' });
            setArchiveDialog({ open: false, report: null });
            fetchReports();
        } catch (error) {
            console.error('Failed to archive report:', error);
            alert('Failed to archive report. Please try again.');
        }
    };

    const handleDelete = async (report) => {
        try {
            const Model = report.report_type === 'ber' ? BER : IncidentReport;
            await Model.delete(report.id);
            setDeleteDialog({ open: false, report: null });
            fetchReports();
        } catch (error) {
            console.error('Failed to delete report:', error);
            alert('Failed to delete report. It may have associated records.');
        }
    };

    const openArchiveDialog = (report) => {
        setArchiveDialog({ open: true, report });
    };

    const openDeleteDialog = (report) => {
        setDeleteDialog({ open: true, report });
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">All Reports</h1>
                <p className="text-slate-600 mt-1">Search, filter, and manage all behavior emergency and incident reports.</p>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Reports</CardTitle>
                        <Input 
                            placeholder="Search by site..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report Type</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Incident Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredReports.map(report => (
                                <TableRow 
                                    key={report.id} 
                                    className="cursor-pointer hover:bg-slate-50" 
                                    onClick={() => handleRowClick(report)}
                                >
                                    <TableCell>
                                        <Badge variant={report.report_type === 'incident' ? 'secondary' : 'default'}>
                                            {report.report_type === 'incident' ? 'Incident' : 'BER'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{report.site}</TableCell>
                                    <TableCell>
                                        {report.incident_date ? format(new Date(report.incident_date), 'MMM d, yyyy, h:mm a') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[report.status]}>{report.status?.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {report.status === 'draft' ? (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(report);
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Draft
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(report);
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                )}
                                                {report.status !== 'archived' && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        openArchiveDialog(report);
                                                    }}>
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteDialog(report);
                                                    }}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredReports.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            No reports found.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={archiveDialog.open} onOpenChange={(open) => !open && setArchiveDialog({ open: false, report: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive this report? 
                            Archived reports can still be viewed but will be marked as archived.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleArchive(archiveDialog.report)}>
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, report: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this report? 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDelete(deleteDialog.report)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
