
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

const DetailItem = ({ label, value, className = '' }) => (
    value ? (
        <div className={`grid grid-cols-3 gap-4 ${className}`}>
            <dt className="font-medium text-slate-600">{label}</dt>
            <dd className="col-span-2 text-slate-800">{value}</dd>
        </div>
    ) : null
);

const Section = ({ title, children }) => (
    <div className="space-y-4 py-4 border-t first:border-t-0 first:pt-0">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <dl className="space-y-4">{children}</dl>
    </div>
);

export default function IncidentReportCard({ report }) {
    if (!report) return null;
    
    const isBERTriggered = report.emergency_used || report.serious_prop_damage;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Incident Report Details</CardTitle>
                <CardDescription>
                    Incident on {report.incident_date ? format(new Date(report.incident_date), 'MMMM d, yyyy') : 'N/A'} for {report.student_name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Section title="Student & Incident Info">
                        <DetailItem label="Student" value={report.student_name} />
                        <DetailItem label="Student ID" value={report.student_id} />
                        <DetailItem label="Date of Birth" value={report.dob ? format(new Date(report.dob), 'PP') : 'N/A'} />
                        <DetailItem label="Age at Incident" value={report.age_at_incident} />
                        <DetailItem label="Site" value={report.site} />
                        <DetailItem label="Date & Time" value={report.incident_date ? format(new Date(report.incident_date), 'PPp') : null} />
                        <DetailItem label="Location" value={report.location} />
                        <DetailItem label="Setting" value={report.setting} />
                    </Section>

                    <Section title="Incident Description">
                        <DetailItem label="Incident Type" value={report.incident_type} />
                        <DetailItem label="Antecedent" value={report.antecedent} className="whitespace-pre-wrap"/>
                        <DetailItem label="Strategies Used" value={report.strategies_used} className="whitespace-pre-wrap"/>
                        <DetailItem label="Narrative" value={report.incident_description} className="whitespace-pre-wrap" />
                        <DetailItem label="Actions Taken" value={report.actions_taken} className="whitespace-pre-wrap"/>
                    </Section>

                    <Section title="Parent/Guardian Contact">
                        <DetailItem label="Contacted" value={report.parent_contacted ? 'Yes' : 'No'} />
                        {report.parent_contacted && (
                            <>
                                <DetailItem label="Method" value={report.parent_contact_method} />
                                <DetailItem label="Time" value={report.parent_contact_time ? format(new Date(report.parent_contact_time), 'Pp') : 'N/A'} />
                                <DetailItem label="Notes" value={report.parent_contact_notes} />
                            </>
                        )}
                    </Section>
                    
                    <Section title="Follow-up">
                        <DetailItem label="Follow-up Required" value={report.follow_up_required ? 'Yes' : 'No'} />
                        <DetailItem label="Follow-up Notes" value={report.follow_up_notes} />
                    </Section>

                    <Section title="Compliance Triggers">
                        <DetailItem label="Emergency Intervention Used?" value={report.emergency_used ? 'Yes' : 'No'} />
                        <DetailItem label="Serious Property Damage?" value={report.serious_prop_damage ? 'Yes' : 'No'} />
                    </Section>

                    {isBERTriggered && (
                        <>
                            <Section title="Injury & Medical Assessment">
                                <DetailItem label="Student Injuries?" value={report.student_injuries ? 'Yes' : 'No'} />
                                <DetailItem label="Staff Injuries?" value={report.staff_injuries ? 'Yes' : 'No'} />
                                <DetailItem label="Other Injuries?" value={report.other_injuries ? 'Yes' : 'No'} />
                                <DetailItem label="Medical Attention Required?" value={report.medical_attention ? 'Yes' : 'No'} />
                                <DetailItem label="Medical Provider / Details" value={report.medical_provider} />
                            </Section>

                            <Section title="Elopement Details">
                                <DetailItem label="Elopement Involved?" value={report.elopement_involved ? 'Yes' : 'No'} />
                                <DetailItem label="Elopement Start" value={report.elopement_start_time ? format(new Date(report.elopement_start_time), 'PPp') : null} />
                                <DetailItem label="Elopement End" value={report.elopement_end_time ? format(new Date(report.elopement_end_time), 'PPp') : null} />
                            </Section>
                            
                            <Section title="BIP Status">
                                <DetailItem label="BIP in Place?" value={report.bip_in_place === true ? 'Yes' : (report.bip_in_place === false ? 'No' : 'Not specified')} />
                                <DetailItem label="BIP Date" value={report.bip_date ? format(new Date(report.bip_date), 'PP') : null} />
                            </Section>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
