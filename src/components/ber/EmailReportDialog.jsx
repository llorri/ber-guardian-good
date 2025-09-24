import React, { useState } from 'react';
import { SendEmail } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Mail, Send } from 'lucide-react';

export default function EmailReportDialog({ ber, isOpen, onClose }) {
    const [formData, setFormData] = useState({
        recipients: '',
        subject: `BER Report Completed - ${ber?.student_name || 'Student'}`,
        includeReportLink: true,
        includeDetails: true,
        customMessage: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateEmailBody = () => {
        let body = `Dear Recipient,

This email is to inform you that a Behavior Emergency Report (BER) has been completed and is ready for review.

Report Details:
- Student: ${ber.student_name}
- Student ID: ${ber.student_id}
- Site: ${ber.site}
- Incident Date: ${ber.incident_date ? format(new Date(ber.incident_date), 'MMMM d, yyyy, h:mm a') : 'N/A'}
- Location: ${ber.location}
- Status: ${ber.status?.replace('_', ' ')}`;

        if (formData.includeDetails && ber.incident_narrative) {
            body += `
- Incident Summary: ${ber.incident_narrative.substring(0, 200)}${ber.incident_narrative.length > 200 ? '...' : ''}`;
        }

        if (ber.emergency_intervention !== 'No Physical Intervention') {
            body += `
- Emergency Intervention Used: ${ber.emergency_intervention}`;
        }

        if (ber.student_injuries || ber.staff_injuries || ber.other_injuries) {
            body += `
- Injuries Occurred: Yes`;
        }

        if (formData.customMessage) {
            body += `

Additional Message:
${formData.customMessage}`;
        }

        body += `

This report has been reviewed and completed in accordance with district policies and procedures.

If you have any questions or need additional information, please contact the site administration.

Best regards,
BER Guardian System`;

        return body;
    };

    const handleSend = async () => {
        if (!formData.recipients.trim()) {
            alert('Please enter at least one recipient email address.');
            return;
        }

        setIsSending(true);
        try {
            const emailBody = generateEmailBody();
            const recipientEmails = formData.recipients.split(',').map(email => email.trim());

            // Send email to each recipient
            for (const email of recipientEmails) {
                await SendEmail({
                    to: email,
                    subject: formData.subject,
                    body: emailBody,
                    from_name: 'BER Guardian System'
                });
            }

            alert(`BER report successfully emailed to ${recipientEmails.length} recipient(s).`);
            onClose();
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    if (!ber) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email BER Report
                    </DialogTitle>
                    <DialogDescription>
                        Send this completed BER report to relevant stakeholders.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="recipients">Recipients *</Label>
                        <Input 
                            id="recipients"
                            value={formData.recipients}
                            onChange={(e) => handleChange('recipients', e.target.value)}
                            placeholder="Enter email addresses separated by commas"
                        />
                        <p className="text-sm text-slate-500">
                            Enter multiple email addresses separated by commas
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Email Content Options</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="includeDetails"
                                    checked={formData.includeDetails}
                                    onCheckedChange={(checked) => handleChange('includeDetails', checked)}
                                />
                                <Label htmlFor="includeDetails">Include incident details summary</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customMessage">Additional Message (Optional)</Label>
                        <Textarea 
                            id="customMessage"
                            value={formData.customMessage}
                            onChange={(e) => handleChange('customMessage', e.target.value)}
                            placeholder="Add any additional message or instructions..."
                            className="h-20"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium">Preview:</Label>
                        <div className="text-sm text-slate-600 mt-2 max-h-32 overflow-y-auto">
                            {generateEmailBody().substring(0, 300)}...
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending} className="bg-blue-600 hover:bg-blue-700">
                        {isSending ? 'Sending...' : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Email
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}