
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, User, MapPin, AlertTriangle, Users, Phone, Shield, Bell } from 'lucide-react';
import {
    environmentalArrangementOptions,
    supportiveStrategyOptions,
    directiveStrategyOptions,
    disengagementOptions,
    seatedHoldsOptions,
    standingHoldsOptions,
    otherHoldsOptions,
    therapeuticRapportOptions
} from '@/components/ber/InterventionChecklists';

// Progressive discipline options for display
const progressiveDisciplineLabels = {
    "pd_verbal_redirect": "Verbal redirection / reminder",
    "pd_reteach": "Reteach expectation / skill",
    "pd_choice_break": "Choice provided / cool-down break",
    "pd_seat_change": "Seat change / proximity",
    "pd_reflection": "Student reflection form",
    "pd_loss_privilege": "Loss of minor privilege",
    "pd_parent_contact": "Parent/guardian contact",
    "pd_cico_brief": "Brief check-in/check-out",
    "pd_confiscation": "Confiscation (return end of day)",
    "pd_class_detention": "Classroom detention",
    "pd_warning": "Warning (documented)",
    "pd_behavior_contract": "Behavior contract / goal sheet",
    "pd_problem_solving_conf": "Problem-solving conference",
    "pd_cico_scheduled": "CICO (scheduled)",
    "pd_restitution": "Restitution / repair",
    "pd_skill_building": "Skill-building session",
    "pd_mediation": "Mediation (student–student)",
    "pd_alt_room": "Alternate room for period",
    "pd_in_school_detention": "In-school detention",
    "pd_iss": "In-school suspension (ISS)",
    "pd_oss": "Out-of-school suspension (OSS)",
    "pd_schedule_change": "Schedule/placement change",
    "pd_threat_assessment": "Safety/Threat assessment referral",
    "pd_law_enforcement": "Law-enforcement notification",
    "pd_formal_restitution": "Restitution plan (formal)",
    "pd_expulsion_recommend": "Recommend expulsion (per policy)"
};

const restorativePracticeLabels = {
    "rp_affective_statement": "Affective statement",
    "rp_restorative_questions": "Restorative questions (quick)",
    "rp_conversation": "Restorative conversation",
    "rp_mediation": "Formal mediation",
    "rp_circle_proactive": "Restorative circle – proactive",
    "rp_circle_responsive": "Restorative circle – responsive",
    "rp_apology_verbal": "Apology (verbal)",
    "rp_apology_written": "Written apology/impact letter",
    "rp_repair_harm": "Repair of harm / restitution",
    "rp_community_service": "Community service (school-based)",
    "rp_reentry_plan": "Reentry conference/plan",
    "rp_family_conference": "Family conference",
    "rp_followup": "Follow-up check-ins"
};

const berFollowupLabels = {
    "bf_student_debrief": "Student debrief within 24h",
    "bf_team_review": "Team incident review within 48h",
    "bf_bip_review": "BIP review/update scheduled",
    "bf_staff_training": "Staff training refresh scheduled",
    "bf_parent_notification": "Parent/guardian notification sent",
    "bf_nurse_check": "Nurse/first-aid check completed",
    "bf_iep_notify": "IEP/504 team notified (if applicable)",
    "bf_reentry_shared": "Reentry plan created & shared"
};

// Convert label maps to options arrays for getChecklistLabel
const progressiveDisciplineOptions = Object.entries(progressiveDisciplineLabels).map(([id, label]) => ({ id, label }));
const restorativePracticeOptions = Object.entries(restorativePracticeLabels).map(([id, label]) => ({ id, label }));
const berFollowupOptions = Object.entries(berFollowupLabels).map(([id, label]) => ({ id, label }));

const getChecklistLabel = (id) => {
    const allOptions = [
        ...environmentalArrangementOptions, ...supportiveStrategyOptions, ...directiveStrategyOptions,
        ...disengagementOptions, ...seatedHoldsOptions, ...standingHoldsOptions, ...otherHoldsOptions,
        ...therapeuticRapportOptions, ...progressiveDisciplineOptions, ...restorativePracticeOptions,
        ...berFollowupOptions
    ];
    const option = allOptions.find(opt => opt.id === id);
    return option ? option.label : id;
};

function DetailItem({ label, value, className = "" }) {
    if (value === null || value === undefined || value === '') return null; // Only render if value is not empty or null/undefined

    return (
        <div className={`grid grid-cols-3 gap-4 py-2 border-b border-gray-100 ${className}`}>
            <span className="font-medium text-gray-700">{label}:</span>
            <span className="col-span-2 text-gray-900">{value}</span>
        </div>
    );
}

function Section({ title, children, icon: Icon }) {
    // Only render section if children are present, excluding null/undefined/empty string DetailItems
    const hasContent = React.Children.toArray(children).some(child => {
        if (React.isValidElement(child) && child.type === DetailItem) {
            return child.props.value !== null && child.props.value !== undefined && child.props.value !== '';
        }
        // For ArraySection, check if items are present
        if (React.isValidElement(child) && child.type === ArraySection) {
            return child.props.items && child.props.items.length > 0;
        }
        // For plain text, check if it's not empty
        if (typeof child === 'string') {
            return child.trim() !== '';
        }
        // If it's a wrapper div for notifications, check its children
        if (React.isValidElement(child) && child.props.className && child.props.className.includes('space-y-4')) {
            return React.Children.toArray(child.props.children).some(grandchild => {
                return React.isValidElement(grandchild) && (grandchild.props.children && React.Children.count(grandchild.props.children) > 0);
            });
        }
        return true;
    });

    if (!hasContent) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                {title}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
                {children}
            </div>
        </div>
    );
}

function ArraySection({ title, items, labelMap, emptyMessage = "None documented", icon }) {
    if (!items || items.length === 0) {
        // If this is a standalone ArraySection, wrap it in a Section component
        // This ensures the title and icon are displayed even if empty, per existing logic for ArraySection directly under CardContent
        return (
            <Section title={title} icon={icon}>
                <p className="text-gray-500 italic">{emptyMessage}</p>
            </Section>
        );
    }

    const getLabel = (item) => (labelMap && labelMap[item]) ? labelMap[item] : getChecklistLabel(item);

    return (
        <Section title={title} icon={icon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm">{getLabel(item)}</span>
                    </div>
                ))}
            </div>
        </Section>
    );
}

export default function BerReportCard({ ber, showStudentInfo = true, isPrinting = false }) {
    if (!ber) return null;

    const {
        status,
        incident_date,
        student_name,
        student_id,
        dob,
        age_at_incident,
        site,
        location,
        setting,
        incident_narrative,
        staff_involved,
        progressive_discipline,
        restorative_practices,
        ber_followup,
        cpi_crisis_stage, // CPI crisis stage is not displayed in the new layout
        cpi_staff_response, // CPI staff response is not displayed in the new layout
        environmental_arrangements,
        supportive_strategies,
        directive_strategies,
        deescalation_attempts,
        disengagements,
        holds_used,
        emergency_intervention_used,
        restraint_start_time,
        restraint_end_time,
        seclusion_start_time,
        seclusion_end_time,
        prohibited_techniques,
        describe_injuries_medical_treatment,
        injuries, // Assuming this is now a direct array of injury descriptions
        medical_evaluation, // Assuming boolean
        medical_provider, // Assuming string
        medical_time, // Assuming ISO string for medical evaluation time
        post_incident_care,
        therapeutic_rapport,
        bip_in_place, // Assuming boolean
        bip_date,
        environmental_factors,
        notifications, // Assuming this is now an array of notification objects
        admin_reviewed_by,
        reviewed_at,
        completed_at,
        filed_at,
        report_type
    } = ber;

    const getTitle = () => {
        return report_type === 'incident' ? 'Incident Report' : 'Behavior Emergency Report';
    };

    const getSubtitle = () => {
        const date = incident_date ? format(new Date(incident_date), 'MMMM d, yyyy') : 'an unknown date';
        if (showStudentInfo && student_name) {
            return `Report for ${student_name} on ${date}`;
        }
        return `Report on ${date}`;
    };

    const statusBadge = {
        'draft': "bg-gray-100 text-gray-800",
        'submitted': "bg-blue-100 text-blue-800",
        'under_review': "bg-purple-100 text-purple-800",
        'completed': "bg-green-100 text-green-800",
        'archived': "bg-yellow-100 text-yellow-800",
    }[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'; // Default for unknown status

    const mappedStaffInvolved = staff_involved && staff_involved.length > 0
        ? staff_involved.map(s => `${typeof s === 'object' ? s.name : s}${typeof s === 'object' && s.role ? ` (${s.role})` : ''}`)
        : [];

    return (
        <Card className="w-full font-sans print-friendly">
            <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                            <AlertTriangle className="mr-3 h-6 w-6 text-red-500" />
                            {getTitle()}
                        </CardTitle>
                        <CardDescription className="mt-1">{getSubtitle()}</CardDescription>
                    </div>
                    {status && <Badge className={`px-4 py-1 text-sm ${statusBadge}`}>{status.replace('_', ' ').toUpperCase()}</Badge>}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <Section title="Incident Details" icon={AlertTriangle}>
                    {showStudentInfo && <DetailItem label="Student Name" value={student_name} />}
                    {showStudentInfo && <DetailItem label="Date of Birth" value={dob ? format(new Date(dob), 'MMMM d, yyyy') : 'N/A'} />}
                    {showStudentInfo && <DetailItem label="Age at Incident" value={age_at_incident} />}
                    <DetailItem label="Student ID" value={student_id} />
                    <DetailItem label="Incident Date" value={incident_date ? format(new Date(incident_date), 'MMMM d, yyyy') : 'N/A'} />
                    <DetailItem label="Incident Time" value={incident_date ? format(new Date(incident_date), 'h:mm a') : 'N/A'} />
                    <DetailItem label="Site" value={site} />
                    <DetailItem label="Location" value={location} />
                    <DetailItem label="Setting" value={setting} />
                </Section>

                <ArraySection title="Staff Involved" items={mappedStaffInvolved} emptyMessage="No staff documented" icon={Users} />

                <Section title="Incident Narrative">
                    <p className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{incident_narrative || 'No narrative provided'}</p>
                </Section>

                <Section title="Environmental Factors">
                    <p className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{environmental_factors || 'Not documented.'}</p>
                </Section>

                <ArraySection
                    title="Environmental Arrangements in Place"
                    items={environmental_arrangements}
                    emptyMessage="No environmental arrangements documented"
                    icon={MapPin}
                />

                <Section title="Emergency Intervention Details" icon={Shield}>
                    <DetailItem label="Emergency Intervention Used" value={emergency_intervention_used || 'No Physical Intervention'} />
                    <DetailItem label="Prohibited Techniques Used" value={prohibited_techniques ? <span className="text-red-600 font-semibold">YES - REVIEW REQUIRED</span> : "No"} />
                </Section>

                <ArraySection
                    title="Supportive Strategies Used"
                    items={supportive_strategies}
                    emptyMessage="No supportive strategies documented"
                    icon={Shield}
                />
                
                <Section title="De-escalation Attempts">
                    <p className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{deescalation_attempts || 'Not documented.'}</p>
                </Section>
                
                <ArraySection
                    title="Directive Strategies Used"
                    items={directive_strategies}
                    emptyMessage="No directive strategies documented"
                    icon={Shield}
                />
                
                <ArraySection
                    title="Disengagement Techniques Used"
                    items={disengagements}
                    emptyMessage="No disengagements documented"
                    icon={Shield}
                />
                
                <ArraySection
                    title="Physical Holds Used"
                    items={holds_used}
                    emptyMessage="No physical holds documented"
                    icon={Shield}
                />

                {(restraint_start_time || seclusion_start_time) && (
                    <Section title="Physical Intervention Details" icon={Clock}>
                        <DetailItem label="Restraint Start Time" value={restraint_start_time ? format(new Date(restraint_start_time), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                        <DetailItem label="Restraint End Time" value={restraint_end_time ? format(new Date(restraint_end_time), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                        <DetailItem label="Seclusion Start Time" value={seclusion_start_time ? format(new Date(seclusion_start_time), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                        <DetailItem label="Seclusion End Time" value={seclusion_end_time ? format(new Date(seclusion_end_time), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                    </Section>
                )}

                <Section title="Injuries, Medical & BIP Status" icon={User}>
                    <ArraySection title="Injuries Sustained" items={injuries} emptyMessage="No injuries reported." />
                    <DetailItem label="Medical Evaluation Provided" value={medical_evaluation ? "Yes" : "No"} />
                    <DetailItem label="Medical Provider" value={medical_evaluation ? (medical_provider || 'Not specified') : null} />
                    <DetailItem label="Medical Care Time" value={medical_evaluation && medical_time ? format(new Date(medical_time), 'MMM d, yyyy, h:mm a') : null} />
                    <DetailItem label="Medical Care Details" value={<p className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{describe_injuries_medical_treatment || 'Not documented.'}</p>} />
                    <DetailItem label="BIP in Place" value={bip_in_place === true ? 'Yes' : (bip_in_place === false ? 'No' : 'Not specified')} />
                    <DetailItem label="BIP Date" value={(bip_in_place && bip_date) ? format(new Date(bip_date), 'MMMM d, yyyy') : null} />
                    <DetailItem label="Post-Incident Care" value={<p className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">{post_incident_care || 'Not documented.'}</p>} />
                </Section>

                <ArraySection
                    title="Progressive Discipline Actions"
                    items={progressive_discipline}
                    labelMap={progressiveDisciplineLabels}
                    emptyMessage="No progressive discipline actions documented"
                    icon={Shield}
                />
                
                <ArraySection
                    title="Restorative Practices Implemented"
                    items={restorative_practices}
                    labelMap={restorativePracticeLabels}
                    emptyMessage="No restorative practices documented"
                    icon={Shield}
                />

                <ArraySection
                    title="Re-established Therapeutic Rapport Steps"
                    items={therapeutic_rapport}
                    emptyMessage="No therapeutic rapport steps documented"
                    icon={Users}
                />

                <Section title="Notifications" icon={Bell}>
                    {notifications && notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((n, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <DetailItem label="Name" value={n.name} className="border-none py-0" />
                                        <DetailItem label="Relationship" value={n.relationship} className="border-none py-0" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <DetailItem label="Method" value={n.method} className="border-none py-0" />
                                        <DetailItem label="Date/Time" value={n.notified_at ? format(new Date(n.notified_at), 'MMM d, yyyy, h:mm a') : 'N/A'} className="border-none py-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No notifications documented.</p>
                    )}
                </Section>

                <ArraySection
                    title="BER Follow-up Actions"
                    items={ber_followup}
                    labelMap={berFollowupLabels}
                    emptyMessage="No follow-up actions documented"
                    icon={Clock}
                />

                <Section title="Administrative Review" icon={Shield}>
                    <div className="space-y-2">
                        <DetailItem label="Reviewed By" value={admin_reviewed_by || 'N/A'} />
                        <DetailItem label="Review Date" value={reviewed_at ? format(new Date(reviewed_at), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                        <DetailItem label="Completed Date" value={completed_at ? format(new Date(completed_at), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                        <DetailItem label="Filed Date" value={filed_at ? format(new Date(filed_at), 'MMM d, yyyy, h:mm a') : 'N/A'} />
                    </div>
                </Section>

                {/* Report Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>Generated on {format(new Date(), 'MMM d, yyyy, h:mm a')}</p>
                    <p>This report contains confidential student information protected by FERPA</p>
                </div>
            </CardContent>
        </Card>
    );
}
