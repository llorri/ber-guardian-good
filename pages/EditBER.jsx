import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BER, Student, Staff, Site, Task } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Send } from 'lucide-react';
import { add, isWeekend, differenceInMinutes, format } from 'date-fns';

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

export default function EditBER() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [report, setReport] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const fetchReport = async () => {
            const params = new URLSearchParams(location.search);
            const id = params.get('id');
            if (id) {
                setLoading(true);
                try {
                    const data = await BER.get(id);
                    setReport(data);
                    const incidentDate = data.incident_date ? new Date(data.incident_date) : new Date();
                    setFormData({
                        ...data,
                        incident_date: format(incidentDate, 'yyyy-MM-dd'),
                        incident_time: format(incidentDate, 'HH:mm'),
                    });
                } catch (error) {
                    console.error('Failed to fetch BER:', error);
                    toast({ title: "Error", description: "Failed to load report data.", variant: "destructive" });
                }
                setLoading(false);
            } else {
                 navigate(createPageUrl('Reports'));
            }
        };
        fetchReport();
    }, [location.search, navigate, toast]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-calculate age
    useEffect(() => {
        if (formData?.dob && formData?.incident_date) {
            const age = new Date(formData.incident_date).getFullYear() - new Date(formData.dob).getFullYear();
            handleChange('age_at_incident', age);
        }
    }, [formData?.dob, formData?.incident_date]);

    // Auto-calculate restraint duration
    useEffect(() => {
        if (formData?.restraint_start && formData?.restraint_end) {
            const start = new Date(formData.restraint_start);
            const end = new Date(formData.restraint_end);
            if (end > start) {
                const minutes = differenceInMinutes(end, start);
                handleChange('restraint_minutes', minutes);
            }
        }
    }, [formData?.restraint_start, formData?.restraint_end]);

    const handleSave = async (status) => {
        const isFinalizing = status === 'submitted';
        if (isFinalizing) {
            if (!formData.student_id || !formData.incident_date || !formData.location || !formData.incident_narrative || formData.emergency_used === undefined || formData.serious_prop_damage === undefined || formData.bip_in_place === undefined) {
                toast({ title: "Missing Fields", description: "Please complete all required fields before finalizing.", variant: "destructive" });
                return;
            }
             if (formData.emergency_used && !formData.emergency_type) {
                toast({ title: "Missing Fields", description: "Please specify the emergency intervention type.", variant: "destructive" });
                return;
            }
        }

        isFinalizing ? setIsSubmitting(true) : setIsSaving(true);
        
        try {
            const payload = { 
                ...formData, 
                status,
                incident_date: `${formData.incident_date}T${formData.incident_time || '00:00'}:00`
            };
            await BER.update(report.id, payload);

            if (isFinalizing) {
                await Task.create({
                    ber_id: report.id,
                    student_name: formData.student_name,
                    site: formData.site,
                    task_type: 'review',
                    description: `Review BER for ${formData.student_name}`,
                    due_date: addSchoolDays(new Date(), 1).toISOString(),
                    priority: 'high',
                });
                toast({ title: "Report Finalized", description: "The report has been submitted for review." });
                navigate(createPageUrl('Reports'));
            } else {
                 toast({ title: "Draft Saved", description: "Your report has been saved." });
            }
        } catch (error) {
            console.error(`Failed to save report:`, error);
            toast({ title: "Save Failed", description: error.message, variant: "destructive" });
        } finally {
            isFinalizing ? setIsSubmitting(false) : setIsSaving(false);
        }
    };

    if (loading || !formData) {
        return (
            <div className="max-w-4xl mx-auto space-y-4">
                 <Skeleton className="h-12 w-1/2" />
                 <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Behavior Emergency Report</CardTitle>
                    <CardDescription>Editing report for {formData.student_name}. Status: {formData.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Minimal form fields for brevity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Student Date of Birth</Label>
                            <Input type="date" value={formData.dob || ''} onChange={(e) => handleChange('dob', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Age at Incident (auto-calculated)</Label>
                            <Input type="number" value={formData.age_at_incident || ''} readOnly disabled />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Emergency Intervention Used?</Label>
                            <Select onValueChange={(v) => handleChange('emergency_used', v === 'true')} value={String(formData.emergency_used)}>
                                <SelectTrigger><SelectValue placeholder="Select an option"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         {formData.emergency_used && (
                            <div className="space-y-2">
                                <Label>Intervention Type</Label>
                                <Select onValueChange={(v) => handleChange('emergency_type', v)} value={formData.emergency_type}>
                                     <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="physical">Physical</SelectItem>
                                        <SelectItem value="seclusion">Seclusion</SelectItem>
                                        <SelectItem value="mechanical">Mechanical</SelectItem>
                                        <SelectItem value="time-out">Time-out</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                     </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Incident Narrative</Label>
                        <Textarea value={formData.incident_narrative || ''} onChange={(e) => handleChange('incident_narrative', e.target.value)} rows={6}/>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate(createPageUrl('Reports'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving || isSubmitting}>
                            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button onClick={() => handleSave('submitted')} disabled={isSaving || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Finalizing...' : <>Finalize Report <Send className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}