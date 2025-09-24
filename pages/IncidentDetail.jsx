
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IncidentReport, Task } from '@/api/entities';
import { createPageUrl } from '@/utils';
import IncidentReportCard from '@/components/incident/IncidentReportCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle, ArrowLeft, Printer, Pencil, Mail } from 'lucide-react';
import EmailReportDialog from '@/components/ber/EmailReportDialog';


export default function IncidentDetail() {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const [report, setReport] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const id = params.get('id');

            if (id) {
                try {
                    const reportData = await IncidentReport.get(id);
                    setReport(reportData);

                    // Fetch related tasks
                    const taskData = await Task.filter({ incident_report_id: id });
                    setTasks(taskData);
                } catch (error) {
                    console.error('Failed to fetch incident details:', error);
                }
            }
            setLoading(false);
        };
        fetchDetails();
    }, [location.search]);

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!report) {
        return <p>Report not found.</p>;
    }
    
    const isBERTriggered = report.emergency_used || report.serious_prop_damage;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center no-print">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(createPageUrl(`EditIncidentReport?id=${report.id}`))}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => window.open(createPageUrl(`BerPrint?id=${report.id}&type=incident_report`), '_blank', 'noopener,noreferrer')}>
                        <Printer className="mr-2 h-4 w-4" /> Print / Download PDF
                    </Button>
                    {report.status === 'completed' && (
                        <Button onClick={() => setIsEmailDialogOpen(true)} variant="outline" className="bg-blue-50 hover:bg-blue-100">
                            <Mail className="mr-2 h-4 w-4" /> Email Report
                        </Button>
                    )}
                </div>
            </div>

            {isBERTriggered && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-yellow-800">Compliance Alert</CardTitle>
                    </CardHeader>
                    <CardContent className="text-yellow-700">
                        This incident involved a behavioral emergency or serious property damage, triggering additional BER compliance requirements.
                    </CardContent>
                </Card>
            )}

            <IncidentReportCard report={report} showStudentInfo={false} />

            <Card>
                <CardHeader>
                    <CardTitle>Compliance & Follow-up Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                     {tasks.length > 0 ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.description}</TableCell>
                                        <TableCell><Badge>{task.status}</Badge></TableCell>
                                        <TableCell>{format(new Date(task.due_date), 'PP')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-slate-500">No associated tasks found for this report.</p>
                    )}
                </CardContent>
            </Card>

            <EmailReportDialog 
                ber={report}
                isOpen={isEmailDialogOpen}
                onClose={() => setIsEmailDialogOpen(false)}
            />
        </div>
    );
}
