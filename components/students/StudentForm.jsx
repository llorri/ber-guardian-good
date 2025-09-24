import React, { useState, useEffect } from 'react';
import { Student } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function StudentForm({ student, sites = [], onSave, onCancel }) {
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        dob: '',
        grade_level: '',
        site: '',
        iep_status: false,
        emergency_contact: '',
        emergency_phone: '',
        ...student
    });

    useEffect(() => {
        if (student) {
            setFormData({
                student_id: student.student_id || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
                grade_level: student.grade_level || '',
                site: student.site || '',
                iep_status: student.iep_status || false,
                emergency_contact: student.emergency_contact || '',
                emergency_phone: student.emergency_phone || '',
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (student) {
                await Student.update(student.id, formData);
            } else {
                await Student.create(formData);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save student:", error);
            alert(`Failed to save student: ${error.message || 'Please check the fields and try again.'}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input id="student_id" name="student_id" value={formData.student_id} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="grade_level">Grade Level</Label>
                    <Input id="grade_level" name="grade_level" value={formData.grade_level} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Select name="site" value={formData.site} onValueChange={(value) => handleSelectChange('site', value)}>
                        <SelectTrigger><SelectValue placeholder="Select a site" /></SelectTrigger>
                        <SelectContent>
                            {sites.map(site => (
                                <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input id="emergency_contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                    <Input id="emergency_phone" name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} />
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                    <Checkbox id="iep_status" name="iep_status" checked={formData.iep_status} onCheckedChange={(checked) => handleCheckboxChange('iep_status', checked)} />
                    <Label htmlFor="iep_status">Student has an IEP</Label>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Student</Button>
            </div>
        </form>
    );
}