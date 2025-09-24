
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IncidentReport, Student, Staff, Site } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditIncidentReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const [incidentReport, setIncidentReport] = useState(null);
    const [formData, setFormData] = useState(null);
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams(location.search);
            const id = params.get('id');
            if (!id) {
                navigate(-1);
                return;
            }

            try {
                const [reportData, allStudents, staffData, siteData] = await Promise.all([
                    IncidentReport.get(id),
                    Student.list('last_name'),
                    Staff.list('last_name'),
                    Site.list('name')
                ]);

                setIncidentReport(reportData);
                
                const incidentDate = reportData.incident_date ? new Date(reportData.incident_date) : new Date();
                const formattedDate = incidentDate.toISOString().split('T')[0];
                const formattedTime = reportData.incident_time || (reportData.incident_date ? incidentDate.toTimeString().substring(0, 5) : '');

                setFormData({
                    ...reportData,
                    incident_date: formattedDate,
                    incident_time: formattedTime,
                });

                // Show active students, PLUS the student on the report if they are archived
                const activeAndReportStudent = allStudents.filter(s => s.active || s.id === reportData.student_id);
                setStudents(activeAndReportStudent);
                
                setStaffList(staffData.filter(s => s.active));
                setSites(siteData.filter(s => s.active));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data for editing:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [location.search, navigate]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (name, value, checked) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked 
                ? [...(prev[name] || []), value]
                : (prev[name] || []).filter(item => item !== value)
        }));
    };
    
    const handleStudentChange = (studentId) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            handleChange('student_id', student.id);
            handleChange('student_name', `${student.first_name} ${student.last_name} - Grade ${student.grade_level}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                incident_date: `${formData.incident_date}T${formData.incident_time || '00:00:00'}`,
            };
            await IncidentReport.update(incidentReport.id, payload);
            navigate(createPageUrl(`IncidentDetail?id=${incidentReport.id}`));
        } catch (error) {
            console.error("Failed to update incident report:", error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    if (!formData) {
        return <div className="text-center text-slate-600">Could not load incident report data for editing.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Incident Report</CardTitle>
                    <CardDescription>Update the details for the incident involving {incidentReport?.student_name}.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                         <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="student">Student *</Label>
                                    <Select 
                                        value={formData.student_id} 
                                        onValueChange={handleStudentChange}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.first_name} {student.last_name} - Grade {student.grade_level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site">Site *</Label>
                                    <Select value={formData.site} onValueChange={(value) => handleChange('site', value)} required>
                                        <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                                        <SelectContent>
                                            {sites.map(site => (
                                                <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="incident_date">Incident Date *</Label>
                                    <Input id="incident_date" type="date" value={formData.incident_date} onChange={(e) => handleChange('incident_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="incident_time">Incident Time *</Label>
                                    <Input id="incident_time" type="time" value={formData.incident_time} onChange={(e) => handleChange('incident_time', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input id="location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="setting">Setting</Label>
                                    <Select value={formData.setting} onValueChange={(value) => handleChange('setting', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select setting" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hallway">Hallway</SelectItem>
                                            <SelectItem value="classroom">Classroom</SelectItem>
                                            <SelectItem value="cafeteria">Cafeteria</SelectItem>
                                            <SelectItem value="patio">Patio</SelectItem>
                                            <SelectItem value="office">Office</SelectItem>
                                            <SelectItem value="bathroom">Bathroom</SelectItem>
                                            <SelectItem value="transportation">Transportation</SelectItem>
                                            <SelectItem value="community">Community</SelectItem>
                                            <SelectItem value="parking_lot">Parking lot</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="incident_type">Incident Type</Label>
                                    <Select value={formData.incident_type} onValueChange={(value) => handleChange('incident_type', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select incident type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minor_disruption">Minor Disruption</SelectItem>
                                            <SelectItem value="verbal_conflict">Verbal Conflict</SelectItem>
                                            <SelectItem value="property_damage">Property Damage</SelectItem>
                                            <SelectItem value="safety_concern">Safety Concern</SelectItem>
                                            <SelectItem value="medical">Medical</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority_level">Priority</Label>
                                    <Select value={formData.priority_level} onValueChange={(value) => handleChange('priority_level', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="incident_description">Incident Description *</Label>
                                <Textarea id="incident_description" value={formData.incident_description} onChange={(e) => handleChange('incident_description', e.target.value)} className="h-32" />
                            </div>
                            
                            <div className="space-y-3">
                                <Label>Staff Involved</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {staffList.map((staff) => {
                                        const staffIdentifier = `${staff.first_name} ${staff.last_name} (${staff.role})`;
                                        return (
                                            <div key={staff.id} className="flex items-center space-x-2">
                                                <Checkbox id={`staff-${staff.id}`} checked={formData.staff_involved?.includes(staffIdentifier)} onCheckedChange={(checked) => handleArrayChange('staff_involved', staffIdentifier, checked)} />
                                                <Label htmlFor={`staff-${staff.id}`}>{staffIdentifier}</Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="actions_taken">Actions Taken</Label>
                                <Textarea id="actions_taken" value={formData.actions_taken} onChange={(e) => handleChange('actions_taken', e.target.value)} className="h-24" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Incident Outcomes</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2"><Checkbox id="student_injuries" checked={formData.student_injuries} onCheckedChange={(c) => handleChange('student_injuries', c)} /><Label htmlFor="student_injuries">Student injuries</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="staff_injuries" checked={formData.staff_injuries} onCheckedChange={(c) => handleChange('staff_injuries', c)} /><Label htmlFor="staff_injuries">Staff injuries</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="property_damage" checked={formData.property_damage} onCheckedChange={(c) => handleChange('property_damage', c)} /><Label htmlFor="property_damage">Property damage</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="medical_attention" checked={formData.medical_attention} onCheckedChange={(c) => handleChange('medical_attention', c)} /><Label htmlFor="medical_attention">Medical attention required</Label></div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold">Parent/Guardian Contact</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="parent_contacted" checked={formData.parent_contacted} onCheckedChange={(c) => handleChange('parent_contacted', c)} />
                                    <Label htmlFor="parent_contacted">Parent/Guardian was contacted</Label>
                                </div>
                                {formData.parent_contacted && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="parent_contact_method">Contact Method</Label>
                                            <Select value={formData.parent_contact_method} onValueChange={(value) => handleChange('parent_contact_method', value)}>
                                                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone">Phone Call</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="in_person">In Person</SelectItem>
                                                    <SelectItem value="text">Text Message</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="parent_contact_time">Contact Date/Time</Label>
                                            <Input id="parent_contact_time" type="datetime-local" value={formData.parent_contact_time} onChange={(e) => handleChange('parent_contact_time', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Follow-up</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="follow_up_required" checked={formData.follow_up_required} onCheckedChange={(c) => handleChange('follow_up_required', c)} />
                                    <Label htmlFor="follow_up_required">Follow-up action required</Label>
                                </div>
                                {formData.follow_up_required && (
                                    <div className="space-y-2">
                                        <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                                        <Textarea id="follow_up_notes" value={formData.follow_up_notes} onChange={(e) => handleChange('follow_up_notes', e.target.value)} className="h-20" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
