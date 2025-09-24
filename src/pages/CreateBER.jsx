
import React, { useState, useEffect } from 'react';
import { BER, Task, Student, Staff, Site, IncidentReport } from '@/api/entities'; // Added IncidentReport
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BerForm from '@/components/forms/BerForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateBER() {
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [sites, setSites] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [editingBER, setEditingBER] = useState(null); // This variable name might be misleading if editing an IncidentReport
    const [isLoading, setIsLoading] = useState(true);

    const transformBERToFormData = (berData) => {
        if (!berData) return {};
        return {
            ...berData,
            student_dob: berData.dob,
            site_id: berData.site, // Assuming site name is used as ID in select
            incident_time: berData.incident_date ? new Date(berData.incident_date).toTimeString().slice(0, 5) : '',
            incident_date: berData.incident_date ? berData.incident_date.split('T')[0] : '',
            discipline_actions: berData.progressive_discipline || [],
            restorative_practices: berData.restorative_practices || [],
            cpi_crisis_stage: berData.crisis_stage,
            cpi_staff_response: berData.staff_response,
            emergency_intervention_used: berData.emergency_intervention || 'No Physical Intervention',
            notification_recipients: berData.notifications || [],
            follow_up_actions: berData.ber_followup || [],

            // IncidentReport specific fields
            incident_narrative: berData.incident_description || berData.incident_narrative, // Map incident_description from IR to incident_narrative for form
            actions_taken: berData.actions_taken,
            follow_up_required: berData.follow_up_required,
            follow_up_notes: berData.follow_up_notes,
            incident_type: berData.incident_type,
            antecedent: berData.antecedent,
            strategies_used: berData.strategies_used,
            witnesses: berData.witnesses,
            priority_level: berData.priority_level,
            emergency_used: berData.emergency_used,
            serious_prop_damage: berData.serious_prop_damage,
            student_injuries: berData.student_injuries,
            staff_injuries: berData.staff_injuries,
            other_injuries: berData.other_injuries,
            medical_attention: berData.medical_attention,
            medical_provider: berData.medical_provider,
            restraint_used: berData.restraint_used,
            restraint_start: berData.restraint_start,
            restraint_end: berData.restraint_end,
            elopement_involved: berData.elopement_involved,
            elopement_start_time: berData.elopement_start_time,
            elopement_end_time: berData.elopement_end_time,
            parent_contacted: berData.parent_contacted,
            parent_contact_method: berData.parent_contact_method,
            parent_contact_time: berData.parent_contact_time,
            parent_contact_notes: berData.parent_contact_notes,
            staff_involved: berData.staff_involved,
            bip_date: berData.bip_date,
            attachments: berData.attachments,
        };
    };
    
    const transformFormDataToBER = (formData, currentStatus) => {
        const selectedStudent = students.find(s => s.id === formData.student_id);
        const isIncidentReport = formData.report_type === 'incident_report';
        
        const baseData = {
            student_id: formData.student_id,
            student_name: selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name} - Grade ${selectedStudent.grade_level}` : '',
            dob: formData.student_dob,
            age_at_incident: formData.age_at_incident,
            incident_date: `${formData.incident_date}T${formData.incident_time || '00:00'}`,
            location: formData.location,
            site: formData.site_id,
            setting: formData.setting,
            status: currentStatus,
            progressive_discipline: formData.discipline_actions || [],
            restorative_practices: formData.restorative_practices || [],
            staff_involved: formData.staff_involved || [],
            emergency_intervention: formData.emergency_intervention_used,
            prohibited_techniques: !!formData.prohibited_techniques,
            additional_intervention_details: formData.additional_intervention_details,
            injuries: formData.injuries || [],
            medical_evaluation: !!formData.medical_evaluation,
            post_incident_care: formData.post_incident_care,
            bip_in_place: formData.bip_in_place === 'yes' ? true : formData.bip_in_place === 'no' ? false : null,
            bip_date: formData.bip_date,
            environmental_factors: formData.environmental_factors,
            notifications: formData.notification_recipients?.filter(n => n.name) || [],
            pre_submission_checklist: formData.pre_submit_checklist || [],
            attachments: formData.attachments || []
        };

        if (isIncidentReport) {
            return {
                ...baseData,
                report_type: 'incident_report', // Explicitly set report_type for IncidentReport
                incident_description: formData.incident_narrative, // Map incident_narrative from form to incident_description for IR
                actions_taken: formData.actions_taken,
                follow_up_required: !!formData.follow_up_required,
                follow_up_notes: formData.follow_up_notes,
                incident_type: formData.incident_type || 'other',
                antecedent: formData.antecedent,
                strategies_used: formData.strategies_used,
                witnesses: formData.witnesses || [],
                priority_level: formData.priority_level || 'medium',
                emergency_used: !!formData.emergency_used,
                serious_prop_damage: !!formData.serious_prop_damage,
                student_injuries: !!formData.student_injuries,
                staff_injuries: !!formData.staff_injuries,
                other_injuries: !!formData.other_injuries,
                medical_attention: !!formData.medical_attention,
                medical_provider: formData.medical_provider,
                restraint_used: !!formData.restraint_used,
                restraint_start: formData.restraint_start,
                restraint_end: formData.restraint_end,
                elopement_involved: !!formData.elopement_involved,
                elopement_start_time: formData.elopement_start_time,
                elopement_end_time: formData.elopement_end_time,
                parent_contacted: !!formData.parent_contacted,
                parent_contact_method: formData.parent_contact_method,
                parent_contact_time: formData.parent_contact_time,
                parent_contact_notes: formData.parent_contact_notes
            };
        } else {
            return {
                ...baseData,
                report_type: 'ber',
                incident_narrative: formData.incident_narrative,
                ber_followup: formData.follow_up_actions || [],
                crisis_stage: formData.cpi_crisis_stage,
                staff_response: formData.cpi_staff_response,
                environmental_arrangements: formData.environmental_arrangements || [],
                supportive_strategies: formData.supportive_strategies || [],
                deescalation_attempts: formData.deescalation_attempts,
                directive_strategies: formData.directive_strategies || [],
                disengagements: formData.disengagements || [],
                holds_used: formData.holds_used || [],
                therapeutic_rapport: formData.therapeutic_rapport || []
            };
        }
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [studentData, staffData, siteData] = await Promise.all([
                    Student.list('last_name').catch(() => []),
                    Staff.list('last_name').catch(() => []),
                    Site.list('name').catch(() => [])
                ]);
                setStudents(studentData.filter(s => s.active !== false));
                setStaffList(staffData.filter(s => s.active !== false));
                setSites(siteData.filter(s => s.active !== false));
            } catch (error) {
                console.error('Failed to fetch dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editId = params.get('edit');
        const loadInitialData = async () => {
            setIsLoading(true);
            if (editId) {
                try {
                    // Attempt to fetch as BER first, then as IncidentReport
                    let reportData;
                    try {
                        reportData = await BER.get(editId);
                    } catch (berError) {
                        try {
                            reportData = await IncidentReport.get(editId);
                        } catch (irError) {
                            throw new Error('Failed to load report as BER or IncidentReport.');
                        }
                    }
                    
                    setEditingBER(reportData); // This now holds either BER or IncidentReport
                    setInitialData(transformBERToFormData(reportData)); // Renamed from transformBERToFormData for clarity, but logic is still BER-centric for now.
                } catch (error) {
                    console.error('Failed to load report for editing:', error);
                    alert('Failed to load report for editing.');
                    navigate(createPageUrl('Reports'));
                }
            } else {
                setInitialData({});
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [location.search, navigate]);

    const handleSubmit = async (values, status) => {
        const payload = transformFormDataToBER(values, status);
        const isIncidentReport = values.report_type === 'incident_report';

        try {
            const Model = isIncidentReport ? IncidentReport : BER;
            
            if (editingBER) { // Note: editingBER might be an IncidentReport too
                await Model.update(editingBER.id, payload);
                alert(`Report ${status === 'draft' ? 'draft saved' : 'updated'} successfully.`);
                if (status === 'submitted') {
                    const detailPage = isIncidentReport ? 'IncidentDetail' : 'BerDetail';
                    navigate(createPageUrl(`${detailPage}?id=${editingBER.id}`));
                }
            } else {
                const newReport = await Model.create(payload);
                alert(`Report ${status === 'draft' ? 'draft saved' : 'submitted'} successfully.`);
                
                if (status === 'submitted') {
                    // Task creation for guardian notification remains. This task can apply to any incident.
                    await Task.create({
                        ber_id: newReport.id, // This should probably be incident_id or report_id for generality
                        student_name: payload.student_name,
                        site: payload.site,
                        task_type: 'guardian_notification',
                        description: 'Notify guardian of incident',
                        due_date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
                        priority: 'high'
                    });
                    navigate(createPageUrl('Reports'));
                } else {
                    // When a new draft is created, we should go to edit mode for that draft.
                    navigate(createPageUrl(`CreateBER?edit=${newReport.id}`), { replace: true });
                }
            }
        } catch (error) {
            console.error(`Failed to ${status} report:`, error);
            alert(`Failed to ${status} report: ${error.message || 'Unknown error'}.`);
        }
    };
    
    const handleCancel = () => {
        if (editingBER) {
            // Navigate based on the type of report being edited
            const detailPage = editingBER.report_type === 'incident_report' ? 'IncidentDetail' : 'BerDetail';
            navigate(createPageUrl(`${detailPage}?id=${editingBER.id}`));
        } else {
            navigate(createPageUrl('Reports'));
        }
    };

    if (isLoading || initialData === null) {
        return (
            <div className="max-w-4xl mx-auto space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <BerForm
            mode={editingBER ? 'edit' : 'create'}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialValues={initialData}
            students={students}
            sites={sites}
            staff={staffList}
        />
    );
}
