
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BER, Task, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, CheckCircle, FileClock, Mail, Pencil } from 'lucide-react';
import BerReportCard from '@/components/ber/BerReportCard';
import EmailReportDialog from '@/components/ber/EmailReportDialog';
import { useToast } from "@/components/ui/use-toast";
import { add, isWeekend, differenceInBusinessDays } from 'date-fns';

function addSchoolDays(date, days) {
  let result = new Date(date);
  let addedDays = 0;
  while (addedDays < days) {
    result = add(result, { days: 1 });
    if (!isWeekend(result)) {
      addedDays++;
    }
  }
  return result;
}

export default function BerDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [ber, setBer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [user, setUser] = useState(null);

    const isIncident = ber?.report_type === 'incident';
    const docTitle = isIncident ? 'Incident Report' : 'Behavior Emergency Report';

    useEffect(() => {
        const fetchBer = async () => {
            const params = new URLSearchParams(location.search);
            const id = params.get('id');
            if (id) {
                setLoading(true);
                try {
                    const [data, currentUser] = await Promise.all([
                        BER.get(id),
                        User.me()
                    ]);
                    setBer(data);
                    setUser(currentUser);
                } catch (error) {
                    console.error('Failed to fetch BER:', error);
                }
                setLoading(false);
            }
        };
        fetchBer();
    }, [location.search]);

    useEffect(() => {
        if (ber) {
            document.title = `${docTitle} - ${ber.student_name}`;
        } else {
            document.title = 'Report Details';
        }
    }, [ber, docTitle]);

    const handleStatusChange = async (newStatus) => {
        if (!ber || !user) return;

        if (newStatus === 'completed') {
            // Seclusion validation - keep this one
            if (ber.emergency_type === 'seclusion' && !ber.continuous_observation) {
                toast({
                    title: "Action Required",
                    description: "Continuous visual observation must be confirmed for incidents involving seclusion.",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            const now = new Date().toISOString();
            let payload = { status: newStatus };

            if (newStatus === 'under_review') {
                payload = { 
                    ...payload, 
                    forwarded_to: user.full_name, 
                    forwarded_at: now
                };
            }

            if (newStatus === 'completed') {
                payload = { 
                    ...payload, 
                    admin_reviewed_by: user.full_name,
                    reviewed_at: now,
                    completed_at: now,
                    filed_at: now
                };
            }
            
            const updatedBer = await BER.update(ber.id, payload);
            setBer(updatedBer);

            // Task automation for 'completed' status
            if (newStatus === 'completed') {
                if (ber.bip_in_place === false) {
                    await Task.create({
                        ber_id: ber.id,
                        student_name: ber.student_name, // Kept for backend logic, but not displayed in description
                        site: ber.site,
                        task_type: 'iep_meeting',
                        description: `Schedule IEP meeting for the student (ID: ${ber.student_id}) to develop a BIP.`,
                        due_date: addSchoolDays(new Date(), 2).toISOString(),
                        priority: 'high',
                    });
                } else {
                     await Task.create({
                        ber_id: ber.id,
                        student_name: ber.student_name, // Kept for backend logic, but not displayed in description
                        site: ber.site,
                        task_type: 'iep_meeting',
                        description: `Schedule a review of the existing BIP/IEP for the student (ID: ${ber.student_id}).`,
                        due_date: addSchoolDays(new Date(), 10).toISOString(),
                        priority: 'medium',
                    });
                }

                toast({ title: "Report Completed", description: "Follow-up tasks have been created." });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status.');
        }
    };
    
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (!ber) {
        return <div className="text-center text-slate-600">Report not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center no-print">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(createPageUrl(`CreateBER?edit=${ber.id}`))}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => window.open(createPageUrl(`BerPrint?id=${ber.id}&type=${isIncident ? 'incident_report' : 'ber'}`), '_blank', 'noopener,noreferrer')}>
                        <Printer className="mr-2 h-4 w-4" /> Print / Download PDF
                    </Button>
                    {ber.status === 'completed' && (
                        <Button onClick={() => setIsEmailDialogOpen(true)} variant="outline" className="bg-blue-50 hover:bg-blue-100">
                            <Mail className="mr-2 h-4 w-4" /> Email Report
                        </Button>
                    )}
                    {ber.status === 'submitted' && (
                        <Button onClick={() => handleStatusChange('under_review')} className="bg-purple-600 hover:bg-purple-700">
                            <FileClock className="mr-2 h-4 w-4" /> Mark as Under Review
                        </Button>
                    )}
                    {ber.status === 'under_review' && (
                        <Button onClick={() => handleStatusChange('completed')} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                        </Button>
                    )}
                </div>
            </div>
            
            <BerReportCard ber={ber} showStudentInfo={false} />

            <EmailReportDialog 
                ber={ber}
                isOpen={isEmailDialogOpen}
                onClose={() => setIsEmailDialogOpen(false)}
            />
        </div>
    );
}
