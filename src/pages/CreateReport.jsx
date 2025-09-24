import React, { useState } from 'react';
import { BehaviorEmergencyReport, ComplianceTask } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
    { id: 1, title: 'Incident Details' },
    { id: 2, title: 'Interventions & Staff' },
    { id: 3, title: 'Outcomes & Debrief' },
    { id: 4, title: 'Review & Submit' },
];

export default function CreateReport() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        student_name: '',
        student_id: '',
        incident_date: '',
        location: '',
        site: '',
        behavior_description: '',
        interventions: [],
        staff_involved: '',
        injury_involved: false,
        property_damage: false,
        debrief_notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const reportData = { ...formData, staff_involved: formData.staff_involved.split(',').map(s => s.trim()) };
            const newReport = await BehaviorEmergencyReport.create(reportData);
            
            // Create compliance tasks
            const now = new Date();
            await ComplianceTask.create({
                report_id: newReport.id,
                student_name: newReport.student_name,
                site: newReport.site,
                task_type: 'guardian_notification',
                due_date: new Date(now.setDate(now.getDate() + 1)).toISOString(), // 24 hours
            });
             await ComplianceTask.create({
                report_id: newReport.id,
                student_name: newReport.student_name,
                site: newReport.site,
                task_type: 'debrief_meeting',
                due_date: new Date(now.setDate(now.getDate() + 2)).toISOString(), // 2 school days
            });

            navigate(createPageUrl('Reports'));
        } catch (error) {
            console.error("Failed to submit report:", error);
            // Add user-facing error handling
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const progress = (currentStep / steps.length) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Create New Behavior Report</h1>
                <p className="text-slate-600 mt-1">Follow the steps to create a compliant BER.</p>
            </header>
            
            <Progress value={progress} className="mb-4" />

            <Card>
                <CardHeader>
                    <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                    <CardDescription>Step {currentStep} of {steps.length}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Student Name</Label><Input name="student_name" value={formData.student_name} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Student ID</Label><Input name="student_id" value={formData.student_id} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Incident Date & Time</Label><Input type="datetime-local" name="incident_date" value={formData.incident_date} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Site / School</Label><Input name="site" value={formData.site} onChange={handleChange} /></div>
                            <div className="col-span-full space-y-2"><Label>Location of Incident</Label><Input name="location" value={formData.location} onChange={handleChange} /></div>
                            <div className="col-span-full space-y-2"><Label>Description of Behavior</Label><Textarea name="behavior_description" value={formData.behavior_description} onChange={handleChange} /></div>
                        </div>
                    )}
                    {currentStep === 2 && (
                         <div className="space-y-6">
                            <div className="space-y-2"><Label>CPI Interventions Used</Label><Textarea name="interventions" placeholder="List all interventions..." value={formData.interventions} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Staff Involved</Label><Input name="staff_involved" placeholder="e.g., John Doe, Jane Smith" value={formData.staff_involved} onChange={handleChange} /></div>
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                             <div className="space-y-2"><Label>Debrief Notes</Label><Textarea name="debrief_notes" value={formData.debrief_notes} onChange={handleChange} /></div>
                             <div className="flex items-center space-x-2"><Checkbox id="injury_involved" name="injury_involved" checked={formData.injury_involved} onCheckedChange={c => handleChange({target: {name: 'injury_involved', type: 'checkbox', checked: c}})} /><Label htmlFor="injury_involved">Injury to student or staff occurred</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="property_damage" name="property_damage" checked={formData.property_damage} onCheckedChange={c => handleChange({target: {name: 'property_damage', type: 'checkbox', checked: c}})} /><Label htmlFor="property_damage">Property damage occurred</Label></div>
                        </div>
                    )}
                     {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Review your report details before submitting.</h3>
                            {Object.entries(formData).map(([key, value]) => (
                                <div key={key} className="flex border-b pb-2">
                                    <strong className="w-1/3 text-slate-600">{key.replace(/_/g, ' ')}:</strong>
                                    <span className="w-2/3 text-slate-800">{value.toString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : <>Submit Report <Send className="ml-2 h-4 w-4" /></>}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}