
import React, { useState, useEffect } from 'react';
import { Task } from '@/api/entities';
import TaskForm from '@/components/tasks/TaskForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Plus, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
};

const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    archived: 'bg-gray-100 text-gray-700'
};

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
    const [archiveDialog, setArchiveDialog] = useState({ open: false, task: null });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await Task.list('-due_date');
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSave = () => {
        setIsFormOpen(false);
        setEditingTask(null);
        fetchTasks();
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleCompleteTask = async (task) => {
        try {
            await Task.update(task.id, {
                status: 'completed',
                completed_at: new Date().toISOString()
            });
            setTasks(prev => prev.map(t =>
                t.id === task.id
                    ? { ...t, status: 'completed', completed_at: new Date().toISOString() }
                    : t
            ));
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const handleArchiveTask = async () => {
        if (!archiveDialog.task) return;
        try {
            await Task.update(archiveDialog.task.id, { status: 'archived' });
            fetchTasks();
        } catch (error) {
            console.error('Failed to archive task:', error);
            alert('Failed to archive task.');
        }
        setArchiveDialog({ open: false, task: null });
    };

    const handleDeleteTask = async () => {
        if (!deleteDialog.task) return;
        try {
            await Task.delete(deleteDialog.task.id);
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task.');
        }
        setDeleteDialog({ open: false, task: null });
    };

    const activeTasks = tasks.filter(t => t.status !== 'archived');
    const pendingTasks = activeTasks.filter(t => t.status === 'pending').length;
    const overdueTasks = activeTasks.filter(t => t.status === 'overdue').length;
    const completedTasks = activeTasks.filter(t => t.status === 'completed').length;

    const displayedTasks = showArchived ? tasks.filter(t => t.status === 'archived') : activeTasks;

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                        <DialogDescription>
                            {editingTask ? 'Update the task details below.' : 'Fill in the details for the new compliance task.'}
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        task={editingTask}
                        onSave={handleSave}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingTask(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Compliance Tasks</h1>
                    <p className="text-slate-600 mt-1">Track and manage all follow-up tasks and compliance requirements.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Task
                </Button>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>{showArchived ? 'Archived Tasks' : 'All Tasks'}</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                        <Label htmlFor="show-archived">Show Archived</Label>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : displayedTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.task_type.replace(/_/g, ' ')}</div>
                                        <div className="text-sm text-slate-500">{task.description}</div>
                                    </TableCell>
                                    <TableCell>{task.site}</TableCell>
                                    <TableCell>
                                        {task.due_date && format(new Date(task.due_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[task.status]}>{task.status.replace(/_/g, ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(task)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {task.status !== 'completed' && task.status !== 'archived' && (
                                                    <DropdownMenuItem onClick={() => handleCompleteTask(task)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark as Complete
                                                    </DropdownMenuItem>
                                                )}
                                                {task.status !== 'archived' && (
                                                    <DropdownMenuItem onClick={() => setArchiveDialog({ open: true, task })}>
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setDeleteDialog({ open: true, task })}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {displayedTasks.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-500">
                            No tasks found.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={archiveDialog.open} onOpenChange={(open) => !open && setArchiveDialog({ open: false, task: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Task</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to archive this task? You can view archived tasks later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchiveTask}>
                        Archive
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, task: null })}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to permanently delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteTask}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
);
}
