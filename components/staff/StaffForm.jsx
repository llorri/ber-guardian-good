
import React, { useState } from 'react';
import { Staff } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StaffForm({ staff, sites = [], onSave, onCancel }) {
    const [formData, setFormData] = useState(staff || {
        first_name: '',
        last_name: '',
        staff_id: '',
        role: 'teacher',
        site: '',
        email: '',
        phone: '',
        active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (staff?.id) {
                await Staff.update(staff.id, formData);
            } else {
                await Staff.create(formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert(`Failed to save staff: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const activeSites = sites.filter(site => site.active);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staff_id">Staff ID</Label>
                    <Input id="staff_id" value={formData.staff_id} onChange={(e) => handleChange('staff_id', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleChange('role', value)} required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="counselor">Counselor</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="cook">Cook</SelectItem>
                            <SelectItem value="paraeducator">Paraeducator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="site">Site/School</Label>
                    <Select value={formData.site} onValueChange={(value) => handleChange('site', value)} required>
                        <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                        <SelectContent>
                            {activeSites.map(site => (
                                <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                    <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleChange('active', checked)} />
                    <Label htmlFor="active">Active</Label>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? 'Saving...' : 'Save Staff'}
                </Button>
            </div>
        </form>
    );
}
