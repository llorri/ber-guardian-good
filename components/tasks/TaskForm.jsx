import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/api/entities';

export default function TaskForm({ task, onSave, onCancel }) {
    const [formData, setFormData] = useState(task || {
        description: '',
        task_type: 'follow_up',
        student_name: '',
        site: '',
        due_date: '',
        priority: 'medium',
        assigned_to: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (formData.id) {
                await Task.update(formData.id, formData);
            } else {
                await Task.create(formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task. Please check the fields and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="description">Task Description *</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the task to be completed"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="task_type">Task Type *</Label>
                    <Select value={formData.task_type} onValueChange={(value) => handleChange('task_type', value)} required>
                        <SelectTrigger id="task_type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guardian_notification">Guardian Notification</SelectItem>
                            <SelectItem value="debrief_meeting">Debrief Meeting</SelectItem>
                            <SelectItem value="district_submission">District Submission</SelectItem>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="student_name">Student Name</Label>
                    <Input
                        id="student_name"
                        value={formData.student_name}
                        onChange={(e) => handleChange('student_name', e.target.value)}
                        placeholder="Optional: Associated student"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Input
                        id="site"
                        value={formData.site}
                        onChange={(e) => handleChange('site', e.target.value)}
                        placeholder="Optional: Associated site"
                    />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date ? formData.due_date.split('T')[0] : ''}
                        onChange={(e) => handleChange('due_date', `${e.target.value}T00:00:00`)}
                        required
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                        id="assigned_to"
                        value={formData.assigned_to}
                        onChange={(e) => handleChange('assigned_to', e.target.value)}
                        placeholder="Optional: user@example.com"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? 'Saving...' : 'Save Task'}
                </Button>
            </div>
        </form>
    );
}