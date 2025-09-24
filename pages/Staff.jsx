
import React, { useState, useEffect } from 'react';
import { Staff as StaffEntity, Site } from '@/api/entities';
import StaffForm from '@/components/staff/StaffForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserCheck, UserPlus, Search, Users, UserX, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const roleColors = {
    teacher: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    counselor: 'bg-green-100 text-green-700',
    office: 'bg-orange-100 text-orange-700',
    cook: 'bg-pink-100 text-pink-700',
    paraeducator: 'bg-indigo-100 text-indigo-700'
};

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [sites, setSites] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffData, sitesData] = await Promise.all([
                StaffEntity.list('last_name'),
                Site.list('name')
            ]);
            setStaff(staffData);
            setSites(sitesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const results = staff.filter(member => {
            const matchesSearch = member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (member.staff_id && member.staff_id.includes(searchTerm)) ||
                member.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.role.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesActiveFilter = showInactive ? !member.active : member.active;
            
            return matchesSearch && matchesActiveFilter;
        });
        setFilteredStaff(results);
    }, [searchTerm, staff, showInactive]);

    const handleSave = () => {
        setIsFormOpen(false);
        setEditingStaff(null);
        fetchData();
    };

    const handleEdit = (staffMember) => {
        setEditingStaff(staffMember);
        setIsFormOpen(true);
    };
    
    const handleToggleActive = async (staffMember) => {
        try {
            await StaffEntity.update(staffMember.id, { active: !staffMember.active });
            fetchData();
        } catch (error) {
            console.error('Failed to update staff status:', error);
            alert('Failed to update staff status.');
        }
    };
    
    const handleDelete = async (staffMember) => {
        if (confirm(`Are you sure you want to permanently delete ${staffMember.first_name} ${staffMember.last_name}? This action cannot be undone.`)) {
            try {
                await StaffEntity.delete(staffMember.id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete staff:', error);
                alert('Failed to delete staff member. They may have associated records.');
            }
        }
    };
    
    const activeStaff = staff.filter(s => s.active);
    const inactiveStaff = staff.filter(s => !s.active);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Staff Directory</h1>
                    <p className="text-slate-600 mt-1">Manage staff members and their roles.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add Staff
                </Button>
            </header>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                        <DialogDescription>
                            {editingStaff ? 'Update the staff information below.' : 'Fill in the details for the new staff member.'}
                        </DialogDescription>
                    </DialogHeader>
                    <StaffForm 
                        staff={editingStaff} 
                        sites={sites}
                        onSave={handleSave} 
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingStaff(null);
                        }} 
                    />
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStaff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inactiveStaff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sites.filter(s => s.active).length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Staff Members</CardTitle>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center space-x-2">
                                <Switch 
                                    id="show-inactive" 
                                    checked={showInactive} 
                                    onCheckedChange={setShowInactive} 
                                />
                                <Label htmlFor="show-inactive">Show Inactive</Label>
                            </div>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Staff ID</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredStaff.map(member => (
                                <TableRow key={member.id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-medium">{member.first_name} {member.last_name}</div>
                                    </TableCell>
                                    <TableCell>{member.staff_id}</TableCell>
                                    <TableCell>
                                        <Badge className={roleColors[member.role] || 'bg-gray-100 text-gray-700'}>{member.role}</Badge>
                                    </TableCell>
                                    <TableCell>{member.site}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{member.email}</div>
                                            <div className="text-slate-500">{member.phone}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.active ? "default" : "secondary"}>
                                            {member.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleToggleActive(member)}>
                                                {member.active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(member)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredStaff.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            {showInactive ? 'No inactive staff members found.' : 'No active staff members found.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
