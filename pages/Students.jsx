import React, { useState, useEffect } from 'react';
import { Student, Site } from '@/api/entities';
import StudentForm from '@/components/students/StudentForm';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Search, Archive, Trash2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [sites, setSites] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, sitesData] = await Promise.all([
                Student.list('last_name'),
                Site.list('name')
            ]);
            setStudents(studentsData);
            setSites(sitesData);
            setFilteredStudents(studentsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let results = students.filter(student => {
            const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.student_id.includes(searchTerm) ||
                student.site.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesArchiveFilter = showArchived ? !student.active : student.active;
            
            return matchesSearch && matchesArchiveFilter;
        });
        setFilteredStudents(results);
    }, [searchTerm, students, showArchived]);
    
    const handleSave = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
        fetchData();
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const handleArchive = async (student) => {
        const reason = prompt(`Why are you archiving ${student.first_name} ${student.last_name}?`);
        if (reason) {
            try {
                await Student.update(student.id, {
                    active: false,
                    archived_date: new Date().toISOString(),
                    archived_reason: reason
                });
                fetchData();
            } catch (error) {
                console.error('Failed to archive student:', error);
                alert('Failed to archive student.');
            }
        }
    };

    const handleReactivate = async (student) => {
        try {
            await Student.update(student.id, {
                active: true,
                archived_date: null,
                archived_reason: null
            });
            fetchData();
        } catch (error) {
            console.error('Failed to reactivate student:', error);
            alert('Failed to reactivate student.');
        }
    };

    const handleDelete = async (student) => {
        if (confirm(`Are you sure you want to permanently delete ${student.first_name} ${student.last_name}? This action cannot be undone.`)) {
            try {
                await Student.delete(student.id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete student:', error);
                alert('Failed to delete student. They may have associated records.');
            }
        }
    };

    const activeStudents = students.filter(s => s.active);
    const archivedStudents = students.filter(s => !s.active);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Student Directory</h1>
                    <p className="text-slate-600 mt-1">Manage student information and IEP status.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add Student
                </Button>
            </header>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                        <DialogDescription>
                            {editingStudent ? 'Update the student information below.' : 'Fill in the details below to add a new student to the directory.'}
                        </DialogDescription>
                    </DialogHeader>
                    <StudentForm 
                        student={editingStudent} 
                        sites={sites}
                        onSave={handleSave} 
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingStudent(null);
                        }} 
                    />
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStudents.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">IEP Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStudents.filter(s => s.iep_status).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Archived Students</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{archivedStudents.length}</div>
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
                        <CardTitle>All Students</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="show-archived" 
                                    checked={showArchived} 
                                    onCheckedChange={setShowArchived} 
                                />
                                <Label htmlFor="show-archived">Show Archived</Label>
                            </div>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    placeholder="Search students..."
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
                                <TableHead>Student</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>IEP Status</TableHead>
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
                                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredStudents.map(student => (
                                <TableRow key={student.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                                        <div className="text-sm text-slate-500">{student.emergency_contact}</div>
                                    </TableCell>
                                    <TableCell>{student.student_id}</TableCell>
                                    <TableCell>{student.grade_level}</TableCell>
                                    <TableCell>{student.site}</TableCell>
                                    <TableCell>
                                        {student.iep_status ? (
                                            <Badge className="bg-blue-100 text-blue-700">IEP</Badge>
                                        ) : (
                                            <Badge variant="outline">Regular</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={student.active ? "default" : "secondary"}>
                                            {student.active ? 'Active' : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleEdit(student)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {student.active ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchive(student)}
                                                >
                                                    <Archive className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleReactivate(student)}
                                                >
                                                    Restore
                                                </Button>
                                            )}
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => handleDelete(student)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredStudents.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            {showArchived ? 'No archived students found.' : 'No active students found matching your search.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}