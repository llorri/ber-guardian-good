import React, { useState, useEffect } from 'react';
import { Site } from '@/api/entities';
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
import { Building, Plus, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SiteForm({ site, onSave, onCancel }) {
    const [formData, setFormData] = useState(site || {
        name: '',
        code: '',
        address: '',
        principal: '',
        phone: '',
        active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (site?.id) {
                await Site.update(site.id, formData);
            } else {
                await Site.create(formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save site:', error);
            alert(`Failed to save site: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">School/Site Name</Label>
                    <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="code">Site Code</Label>
                    <Input 
                        id="code" 
                        value={formData.code} 
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} 
                        required 
                    />
                </div>
                <div className="col-span-full space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="principal">Principal</Label>
                    <Input 
                        id="principal" 
                        value={formData.principal} 
                        onChange={(e) => setFormData(prev => ({ ...prev, principal: e.target.value }))} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                    />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                    <Switch 
                        id="active" 
                        checked={formData.active} 
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))} 
                    />
                    <Label htmlFor="active">Active</Label>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? 'Saving...' : (site ? 'Update Site' : 'Create Site')}
                </Button>
            </div>
        </form>
    );
}

export default function Sites() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSite, setEditingSite] = useState(null);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const data = await Site.list('name');
            setSites(data);
        } catch (error) {
            console.error('Failed to fetch sites:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const handleSave = () => {
        setIsFormOpen(false);
        setEditingSite(null);
        fetchSites();
    };

    const handleEdit = (site) => {
        setEditingSite(site);
        setIsFormOpen(true);
    };

    const handleDelete = async (site) => {
        if (confirm(`Are you sure you want to delete ${site.name}? This action cannot be undone.`)) {
            try {
                await Site.delete(site.id);
                fetchSites();
            } catch (error) {
                console.error('Failed to delete site:', error);
                alert('Failed to delete site. It may be in use by students or reports.');
            }
        }
    };

    const handleToggleActive = async (site) => {
        try {
            await Site.update(site.id, { active: !site.active });
            fetchSites();
        } catch (error) {
            console.error('Failed to update site:', error);
            alert('Failed to update site status.');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">School Management</h1>
                    <p className="text-slate-600 mt-1">Manage schools and sites in the district.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Site
                </Button>
            </header>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
                        <DialogDescription>
                            {editingSite ? 'Update the site information below.' : 'Fill in the details below to add a new site.'}
                        </DialogDescription>
                    </DialogHeader>
                    <SiteForm 
                        site={editingSite} 
                        onSave={handleSave} 
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingSite(null);
                        }} 
                    />
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sites.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sites.filter(s => s.active).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Sites</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sites.filter(s => !s.active).length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Sites</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : sites.map(site => (
                                <TableRow key={site.id}>
                                    <TableCell>
                                        <div className="font-medium">{site.name}</div>
                                        <div className="text-sm text-slate-500">{site.address}</div>
                                    </TableCell>
                                    <TableCell>{site.code}</TableCell>
                                    <TableCell>{site.principal}</TableCell>
                                    <TableCell>{site.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={site.active ? "default" : "secondary"}>
                                            {site.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleEdit(site)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleToggleActive(site)}
                                            >
                                                {site.active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => handleDelete(site)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {sites.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            No sites found. Add your first site to get started.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}