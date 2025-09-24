
import React, { useState, useEffect } from 'react';
import { BER } from '@/api/entities';
import { IncidentReport } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertTriangle, CheckCircle, Eye, RefreshCw, FileText, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700', 
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
};

const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700'
};

export default function ReviewQueue() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching reports for review queue...');
            
            // Fetch both BER and Incident Reports
            const [berData, incidentData] = await Promise.all([
                BER.list('-incident_date'),
                IncidentReport.list('-incident_date')
            ]);
            
            console.log('Fetched BERs:', berData);
            console.log('Fetched Incident Reports:', incidentData);
            
            // Filter for submitted reports and add report type
            const submittedBERs = berData
                .filter(ber => ber.status === 'submitted')
                .map(ber => ({ ...ber, report_type: 'BER' }));
                
            const submittedIncidents = incidentData
                .filter(incident => incident.status === 'submitted')
                .map(incident => ({ ...incident, report_type: 'Incident Report' }));
            
            // Combine and sort by incident date
            const allReports = [...submittedBERs, ...submittedIncidents]
                .sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date));
            
            setReports(allReports);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setError(error.message || 'Failed to load reports');
            setReports([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusChange = async (report, newStatus) => {
        try {
            if (report.report_type === 'BER') {
                await BER.update(report.id, { status: newStatus });
            } else {
                await IncidentReport.update(report.id, { status: newStatus });
            }
            setReports(prev => prev.map(r => r.id === report.id ? {...r, status: newStatus} : r));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    if (error) {
        return (
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-slate-800">Review Queue</h1>
                    <p className="text-slate-600 mt-1">Reports waiting for administrative review and approval.</p>
                </header>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center py-10">
                            <p className="text-red-600 mb-4">Error loading reports: {error}</p>
                            <Button onClick={fetchReports} className="bg-blue-600 hover:bg-blue-700">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const berReports = reports.filter(r => r.report_type === 'BER');
    const incidentReports = reports.filter(r => r.report_type === 'Incident Report');
    const highPriorityReports = reports.filter(r => r.priority_level === 'high' || r.priority_level === 'critical');

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Review Queue</h1>
                    <p className="text-slate-600 mt-1">Reports waiting for administrative review and approval.</p>
                </div>
                <Button onClick={fetchReports} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </header>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">BER Reports</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{berReports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incident Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{incidentReports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highPriorityReports.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports Awaiting Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                                    </TableRow>
                                ))
                            ) : reports.map(report => (
                                <TableRow key={`${report.report_type}-${report.id}`}>
                                    <TableCell>
                                        <Badge variant={report.report_type === 'BER' ? 'destructive' : 'default'}>
                                            {report.report_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{report.site}</TableCell>
                                    <TableCell>
                                        {report.incident_date ? format(new Date(report.incident_date), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={priorityColors[report.priority_level]}>{report.priority_level}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[report.status]}>{report.status.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={createPageUrl(report.report_type === 'BER' ? `BerDetail?id=${report.id}` : `IncidentDetail?id=${report.id}`)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={createPageUrl(report.report_type === 'BER' ? `EditBER?id=${report.id}` : `EditIncidentReport?id=${report.id}`)}>
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {reports.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            No reports pending review.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
