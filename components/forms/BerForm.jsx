
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Send, Save, PlusCircle, Trash2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast"; // New import for toast notifications

const berWizardConfig = {
  steps: [
    {
      id: "report-type",
      title: "Report Type & Incident Details",
      fields: [
        { type: "radio", key: "report_type", label: "Report Type", options: ["BER", "Incident Report"], required: true },
        { type: "student", key: "student_id", label: "Student", required: true },
        { type: "site", key: "site_id", label: "Site", required: true },
        { type: "date", key: "student_dob", label: "Student Date of Birth" },
        { type: "readonly", key: "age_at_incident", label: "Age at Incident" },
        { type: "date", key: "incident_date", label: "Incident Date", required: true },
        { type: "time", key: "incident_time", label: "Incident Time", required: true },
        { type: "text", key: "location", label: "Location", required: true, placeholder: "e.g., Classroom 101, Hallway, Cafeteria" },
        { type: "select", key: "setting", label: "Setting", options: ["Classroom","Hallway","Cafeteria","Playground","Bus","Office","Other"] },
        {
          type: "repeater",
          key: "staff_involved",
          label: "Staff Involved",
          min: 0,
          max: 10,
          template: [
            { type: "text", key: "name", label: "Staff Name", required: true },
            { type: "select", key: "role", label: "Role", options: ["Teacher", "Admin", "Counselor", "Office", "Cook", "Paraeducator", "Other"], required: true }
          ]
        },
        { type: "textarea", key: "incident_narrative", label: "Incident Narrative", required: true }
      ]
    },
    {
      id: "preventative-strategies",
      title: "Preventative Strategies",
      fields: [
        { type: "select", key: "cpi_crisis_stage", label: "CPI Crisis Stage Observed", options: ["Anxiety","Defensive","Risk","Tension Reduction"] },
        { type: "select", key: "cpi_staff_response", label: "CPI-Aligned Staff Response", options: ["Supportive","Directive","Safety Interventions","Therapeutic Rapport"] },
        { type: "textarea", key: "environmental_factors", helper: "Describe environmental factors that may have contributed to the incident." },
        {
          type: "checkboxes",
          key: "environmental_arrangements",
          label: "Environmental Arrangements in Place",
          items: [
            "Minimal visual clutter (covered shelves/walls)",
            "First-Then board",
            "Sound management (soft surfaces/white noise)",
            "Staff line-of-sight to students",
            "Posted visual schedule",
            "Sensory tools accessible (fidgets, headphones)",
            "Transition cues set (chime, lights, visuals)",
            "Flexible seating options (stools, wobble, standing)",
            "Calm/Regulation corner ready (tools + visuals)",
            "Visual timer/countdown available",
            "Preferential seating",
            "Materials organized: needed-in-reach, distractors out-of-sight",
            "Lighting adjusted (natural/dimmable; no flicker)",
            "De-escalation space near but separate"
          ]
        },
        {
          type: "section_title",
          label: "Emergency Intervention Details",
        },
        { type: "radio", key: "emergency_intervention_used", label: "Emergency Intervention Used:", options: ["No physical intervention", "Physical Intervention", "Seclusion", "Both"] },
        { type: "radio", key: "prohibited_techniques", label: "Prohibited Techniques Used:", options: ["Yes", "No"] },
        {
          type: "checkboxes",
          key: "supportive_strategies",
          label: "Supportive Strategies",
          helper: "De-escalation Attempts - Supportive Strategies Used",
          items: [
            "Calm, supportive stance & tone",
            "Reduce stimulation (space/quiet/fewer people)",
            "Offer two neutral choices",
            "Brief regulation break (water/move/sensory)",
            "Change of face/place (staff swap/quiet spot)",
            "Active listening + brief empathy",
            "Nonverbal prompt + wait time",
            "First-Then / visual timer",
            "Decrease or delay demands",
            "Reinforce small steps toward calm"
          ]
        },
        { type: "textarea", key: "deescalation_attempts", label: "De-escalation Attempts Narrative", placeholder: "Describe the sequence and outcome of de-escalation attempts." },
        {
          type: "checkboxes",
          key: "directive_strategies",
          label: "Directive Strategies Used",
          items: [
            "Brief, clear directive (one behavior at a time)",
            "When/Then contingency (precision request)",
            "Enforceable boundary/I will... statements",
            "Proximity control & supportive stance; keep exit route",
            "State pre-taught consequence neutrally; allow take-up time",
            "Set limits with two safe choices (both acceptable)",
            "Calm repetition (broken record) + short wait time",
            "Reduce audience / change location if possible",
            "Remove or pause triggering demand/materials",
            "Signal for assistance or change of face if escalation continues"
          ]
        }
      ]
    },
    {
      id: "emergency-intervention",
      title: "Emergency Intervention",
      fields: [
        { type: "conditional-time", key: "restraint_start_time", label: "Beginning Time of Restraint", condition: { field: "emergency_intervention_used", values: ["Physical Intervention", "Both"] } },
        { type: "conditional-time", key: "restraint_end_time", label: "Ending Time of Restraint", condition: { field: "emergency_intervention_used", values: ["Physical Intervention", "Both"] } },
        {
          type: "checkboxes",
          key: "disengagements",
          label: "Disengagement Techniques Used",
          items: [
            "Supportive Stance",
            "Hair Pull",
            "Turn Away - Low",
            "Wrist Grab",
            "Bite",
            "Turn Away - Medium",
            "Clothing Grab",
            "Body Grab",
            "Turn Away - High"
          ]
        },
        {
          type: "checkboxes",
          key: "holds_used",
          label: "Holds Used",
          groups: [
            {
              name: "Seated Holds",
              items: [
                "Seated (Low)",
                "Seated (Medium)",
                "Seated (High)",
                "Seated Add. Staff (High)"
              ]
            },
            {
              name: "Standing Holds",
              items: [
                "Standing (Low)",
                "Standing (Medium)",
                "Standing (High)",
                "Standing Add. Staff Head (High)",
                "Standing Add. Staff Shoulders (High)"
              ]
            }
          ]
        }
      ]
    },
    {
      id: "injuries-medical",
      title: "Injuries & Medical",
      fields: [
        {
          type: "checkboxes",
          key: "injuries",
          label: "Injuries Sustained",
          items: ["Student", "Staff", "Other"]
        },
        { type: "boolean", key: "medical_evaluation", label: "Medical evaluation required?" },
        { type: "textarea", key: "additional_intervention_details", label: "Describe Injuries & Medical treatment" }
      ]
    },
    {
      id: "post-incident-followup",
      title: "Post Incident & Follow-up",
      fields: [
        { type: "textarea", key: "post_incident_care", label: "Post-Incident Care Provided" },
        {
          type: "checkboxes",
          key: "therapeutic_rapport",
          label: "Therapeutic Rapport Activities",
          items: [
            "Check-in conversation",
            "Emotional regulation support",
            "Problem-solving discussion",
            "Relationship repair",
            "Future planning",
            "Skill practice"
          ]
        },
        {
          type: "checkboxes",
          key: "discipline_actions",
          label: "Progressive Discipline Actions",
          helper: "Select all discipline actions that were taken.",
          groups: [
            {
              name: "Tier 1",
              items: [
                "Verbal redirection / reminder",
                "Seat change / proximity",
                "Parent/guardian contact",
                "Classroom detention",
                "Reteach expectation / skill",
                "Student reflection form",
                "Brief check-in/check-out",
                "Warning (documented)",
                "Choice provided / cool-down break",
                "Loss of minor privilege",
                "Confiscation (return end of day)"
              ]
            },
            {
              name: "Tier 2",
              items: [
                "Behavior contract / goal sheet",
                "Restitution / repair",
                "Alternate room for period",
                "Problem-solving conference",
                "Skill-building session",
                "In-school detention",
                "CICO (scheduled)",
                "Mediation (student-student)"
              ]
            },
            {
              name: "Tier 3 (Admin Required)",
              items: [
                "In-school suspension (ISS)",
                "Out-of-school suspension (OSS)",
                "Schedule/placement change",
                "Safety/Threat assessment referral",
                "Law-enforcement notification",
                "Restitution plan (formal)"
              ]
            }
          ]
        },
        {
          type: "checkboxes",
          key: "restorative_practices",
          label: "Restorative Practices",
          helper: "Select all restorative practices that were implemented.",
          items: [
            "Affective statement",
            "Formal mediation",
            "Apology (verbal)",
            "Community service (school-based)",
            "Follow-up check-ins",
            "Restorative questions (quick)",
            "Restorative circle - proactive",
            "Written apology/impact letter",
            "Reentry conference/plan",
            "Restorative conversation",
            "Restorative circle - responsive",
            "Repair of harm / restitution",
            "Family conference"
          ]
        },
        {
          type: "checkboxes",
          key: "follow_up_actions",
          label: "Follow-up Actions Required",
          items: [
            "Student debrief meeting",
            "Staff debrief meeting",
            "IEP team meeting",
            "Behavior plan review",
            "Environmental assessment",
            "Additional training for staff",
            "Medical follow-up",
            "District notification",
            "Other agency notification"
          ]
        }
      ]
    },
    {
      id: "review-submit",
      title: "Review & Submit",
      fields: [
        { type: "radio", key: "bip_in_place", label: "Behavior Intervention Plan", options: ["Yes","No"] },
        {
            key: 'attachments',
            type: 'file_upload',
            label: 'Attachments',
            description: 'Upload any relevant documents, photos, or additional materials related to this incident.',
            multiple: true,
            accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'
        },
        {
          type: "repeater",
          key: "notification_recipients",
          label: "Notification of Recipients",
          min: 0,
          max: 10,
          template: [
            { type: "text", key: "name", label: "Name", required: true },
            { type: "select", key: "relationship", label: "Relationship", options: ["Parent/Guardian","Emergency Contact","Administrator","Counselor","Other"], required: true },
            { type: "select", key: "method", label: "Method", options: ["Phone Call","Email","In Person","Text Message"], required: true },
            { type: "date", key: "notified_at", label: "Date Notified", required: false }
          ]
        },
        {
          type: "checkboxes",
          key: "pre_submit_checklist",
          label: "Pre-Submission Checklist",
          helper: "Verify all required items before submitting.",
          items: [
            "Incident narrative is complete and accurate",
            "All interventions used are documented",
            "Parent/guardian has been notified within 24 hours",
            "Any injuries have been properly documented",
            "Compliant with FERPA"
          ]
        }
      ]
    }
  ]
};

// Helper function to calculate age
const calculateAge = (dob, incidentDate) => {
    if (dob && incidentDate) {
        const birthDate = new Date(dob);
        const incDate = new Date(incidentDate);
        if (!isNaN(birthDate.getTime()) && !isNaN(incDate.getTime())) {
            let age = incDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = incDate.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && incDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
    }
    return '';
};

function renderField(field, values, setValues, { students = [], sites = [], staff = [], isUploading, handleFileUpload, removeFile }) {
    const fieldId = `field-${field.key}`;
    const value = values[field.key];

    // Check if field should be displayed based on condition
    if (field.condition) {
        const conditionFieldValue = values[field.condition.field];
        // Convert conditional values to lowercase and replace spaces to match stored values
        const conditionedValues = field.condition.values.map(v => v.toLowerCase().replace(/\s+/g, '_'));
        if (!conditionedValues.includes((conditionFieldValue || '').toLowerCase().replace(/\s+/g, '_'))) {
            return null;
        }
    }

    const onChange = (key, val) => {
      setValues(prev => {
        let newValues = { ...prev };

        if (key === 'prohibited_techniques') {
            newValues[key] = val === 'yes';
        } else {
            newValues[key] = val;
        }

        const updateAgeAtIncident = (currentNewValues) => {
            currentNewValues.age_at_incident = calculateAge(
                currentNewValues.student_dob,
                currentNewValues.incident_date
            );
        };

        if (key === 'student_id') {
            const student = students.find(s => s.id === val);
            if (student) {
                let dobValue = '';
                const dobField = student.dob || student.date_of_birth || student.birth_date;
                if (dobField) {
                    try {
                        const dobDate = new Date(dobField);
                        if (!isNaN(dobDate.getTime())) {
                            dobValue = dobDate.toISOString().split('T')[0];
                        }
                    } catch (e) {
                        console.warn('Error parsing student DOB:', dobField);
                    }
                }
                newValues.student_dob = dobValue;
                newValues.site_id = student.site || '';
            } else {
                newValues.student_dob = '';
                newValues.site_id = '';
            }
            updateAgeAtIncident(newValues);
        } else if (key === 'incident_date' || key === 'student_dob') {
            updateAgeAtIncident(newValues);
        }

        return newValues;
      });
    };

    switch (field.type) {
        case 'text':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Input id={fieldId} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} required={field.required}/>
                </div>
            );
        case 'textarea':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Textarea id={fieldId} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} className="h-32" required={field.required}/>
                    {field.helper && <p className="text-sm text-gray-500">{field.helper}</p>}
                </div>
            );
        case 'date':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Input id={fieldId} type="date" value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} required={field.required}/>
                </div>
            );
        case 'time':
        case 'conditional-time': // Handle conditional-time similar to time, visibility handled by the condition check
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Input id={fieldId} type="time" value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} required={field.required}/>
                </div>
            );
        case 'select':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Select value={value || ''} onValueChange={(val) => onChange(field.key, val)} required={field.required}>
                        <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                        <SelectContent>
                            {field.options.map(option => (<SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>{option}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            );
        case 'student':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Select value={value || ''} onValueChange={(val) => onChange(field.key, val)} required={field.required}>
                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>
                            {students.map(student => (<SelectItem key={student.id} value={student.id}>{student.first_name} {student.last_name} - Grade {student.grade_level}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            );
        case 'site':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label} {field.required && '*'}</Label>
                    <Select value={value || ''} onValueChange={(val) => onChange(field.key, val)} required={field.required}>
                        <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                        <SelectContent>
                            {sites.map(site => (<SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            );
        case 'readonly':
            return (
                <div className="space-y-2">
                    <Label htmlFor={fieldId}>{field.label}</Label>
                    <Input id={fieldId} value={value || ''} readOnly className="bg-gray-50"/>
                </div>
            );
        case 'boolean':
            return (
                <div className="flex items-center space-x-2">
                    <Checkbox id={fieldId} checked={!!value} onCheckedChange={(checked) => onChange(field.key, checked)} required={field.required}/>
                    <Label htmlFor={fieldId}>{field.label}</Label>
                </div>
            );
        case 'radio':
            let radioValue;
            if (field.key === 'prohibited_techniques') {
                // Map boolean to 'yes'/'no' for display in radio group
                radioValue = values[field.key] === true ? 'yes' : values[field.key] === false ? 'no' : '';
            } else {
                radioValue = values[field.key] || '';
            }
            return (
                <div className="space-y-3">
                    <Label>{field.label} {field.required && '*'}</Label>
                    <RadioGroup value={radioValue} onValueChange={(val) => onChange(field.key, val)} className="flex space-x-4" required={field.required}>
                        {field.options.map(option => (<div key={option} className="flex items-center space-x-2"><RadioGroupItem value={option.toLowerCase().replace(/\s+/g, '_')} id={`${fieldId}-${option}`} /><Label htmlFor={`${fieldId}-${option}`}>{option}</Label></div>))}
                    </RadioGroup>
                </div>
            );
        case 'checkboxes':
            const currentValues = Array.isArray(value) ? value : [];
            return (
                <div className="space-y-4">
                    <Label className="text-base font-semibold">{field.label} {field.required && '*'}</Label>
                    {field.helper && <p className="text-sm text-gray-600 mb-3">{field.helper}</p>}
                    {field.groups ? (
                        field.groups.map(group => (
                            <div key={group.name} className="space-y-2">
                                <Badge className={group.name.includes('Tier 3') ? 'bg-red-100 text-red-800' : group.name.includes('Tier 2') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>{group.name}</Badge>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                                    {group.items.map(item => (<div key={item} className="flex items-center space-x-2"><Checkbox id={`${fieldId}-${item}`} checked={currentValues.includes(item)} onCheckedChange={(checked) => { const newValues = checked ? [...currentValues, item] : currentValues.filter(v => v !== item); onChange(field.key, newValues);}}/><Label htmlFor={`${fieldId}-${item}`} className="text-sm">{item}</Label></div>))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {field.items.map(item => (<div key={item} className="flex items-center space-x-2"><Checkbox id={`${fieldId}-${item}`} checked={currentValues.includes(item)} onCheckedChange={(checked) => { const newValues = checked ? [...currentValues, item] : currentValues.filter(v => v !== item); onChange(field.key, newValues); }}/><Label htmlFor={`${fieldId}-${item}`} className="text-sm">{item}</Label></div>))}
                        </div>
                    )}
                </div>
            );
        case 'repeater':
            const repeaterValues = Array.isArray(value) ? value : [];
            const handleRepeaterChange = (index, key, val) => {
                const newRepeaterValues = [...repeaterValues];
                newRepeaterValues[index] = { ...newRepeaterValues[index], [key]: val };
                setValues(prev => ({ ...prev, [field.key]: newRepeaterValues }));
            };

            const addRepeaterItem = () => {
                const newItem = {};
                field.template.forEach(f => { newItem[f.key] = ''; });
                setValues(prev => ({...prev, [field.key]: [...repeaterValues, newItem]}));
            };

            const removeRepeaterItem = (index) => {
                const newValues = repeaterValues.filter((_, i) => i !== index);
                setValues(prev => ({...prev, [field.key]: newValues}));
            };

            return (
                <div className="space-y-4">
                    <Label className="text-base font-semibold">{field.label} {field.required && '*'}</Label>
                    <div className="space-y-4">
                        {repeaterValues.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg relative">
                                {field.template.map(templateField => {
                                    const fieldProps = {
                                        id: `field-${field.key}-${index}-${templateField.key}`,
                                        value: item[templateField.key] || '',
                                        onChange: (e) => handleRepeaterChange(index, templateField.key, e.target.value),
                                        required: templateField.required
                                    };
                                    return (
                                        <div key={templateField.key} className="space-y-2">
                                            <Label htmlFor={fieldProps.id}>{templateField.label} {templateField.required && '*'}</Label>
                                            {templateField.type === 'text' && <Input {...fieldProps} />}
                                            {templateField.type === 'date' && <Input type="date" {...fieldProps} />}
                                            {templateField.type === 'select' && (
                                                <Select value={fieldProps.value} onValueChange={(val) => handleRepeaterChange(index, templateField.key, val)} required={fieldProps.required}>
                                                    <SelectTrigger id={fieldProps.id}><SelectValue placeholder={`Select ${templateField.label.toLowerCase()}`} /></SelectTrigger>
                                                    <SelectContent>
                                                        {templateField.options.map(option => (<SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>{option}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    );
                                })}
                                {repeaterValues.length > (field.min || 0) && (
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 text-gray-400 hover:text-red-500" onClick={() => removeRepeaterItem(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {repeaterValues.length < (field.max || 10) && (
                        <Button variant="outline" size="sm" onClick={addRepeaterItem}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add {field.label.slice(0, -1)}
                        </Button>
                    )}
                </div>
            );
        case 'file_upload':
            const uploadedFiles = Array.isArray(value) ? value : [];

            return (
                <div className="space-y-4">
                    <Label className="text-base font-semibold">{field.label} {field.required && '*'}</Label>
                    {field.description && <p className="text-sm text-gray-600">{field.description}</p>}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Input
                            type="file"
                            multiple={field.multiple}
                            accept={field.accept}
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden" // Hide default input
                            id={fieldId}
                        />
                        <Label htmlFor={fieldId} className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PlusCircle className="mr-2 h-4 w-4" /> Select Files
                        </Label>
                        {isUploading && <p className="text-sm text-blue-600 mt-2">Uploading files...</p>}
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Uploaded Files:</Label>
                            <div className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 text-lg">
                                                {file.type?.startsWith('image/') ? '📷' : '📄'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(1)} KB • {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        case 'section_title':
            return <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4 col-span-full">{field.label}</h3>;
        default:
            return <div>Unknown field type: {field.type}</div>;
    }
}

export default function BerForm({ mode = 'create', onSubmit, onCancel, initialValues = {}, students, sites, staff }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [values, setValues] = React.useState(() => {
    const defaultNotificationRecipient = { name: '', relationship: 'parent_guardian', method: 'phone_call', notified_at: '' }; // Updated default values for consistency
    const defaultStaffInvolved = { name: '', role: 'teacher' };
    const defaultValues = {
      report_type: 'ber', // Ensure consistency with stored values if options are converted
      discipline_actions: [],
      restorative_practices: [],
      environmental_arrangements: [],
      supportive_strategies: [],
      deescalation_attempts: '',
      directive_strategies: [],
      disengagements: [],
      holds_used: [],
      injuries: [],
      therapeutic_rapport: [],
      staff_involved: [],
      notification_recipients: [defaultNotificationRecipient],
      follow_up_actions: [],
      pre_submit_checklist: [],
      attachments: [], // Initialize attachments as an empty array
      prohibited_techniques: false, // Default for new field
    };

    const mergedNotificationRecipients = (initialValues.notification_recipients && initialValues.notification_recipients.length > 0)
        ? initialValues.notification_recipients.map(item => ({
            ...defaultNotificationRecipient, // Ensure all template fields have a default, if not present
            ...item
          }))
        : defaultValues.notification_recipients;
        
    const mergedStaffInvolved = (initialValues.staff_involved && initialValues.staff_involved.length > 0)
        ? initialValues.staff_involved.map(item => ({
            ...defaultStaffInvolved,
            ...item
        }))
        : defaultValues.staff_involved;

    return {
      ...defaultValues,
      ...initialValues,
      staff_involved: mergedStaffInvolved,
      notification_recipients: mergedNotificationRecipients,
    };
  });
  const [loading, setLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast(); // Initialize useToast hook

  const currentStepData = berWizardConfig.steps[currentStep];
  const progress = ((currentStep + 1) / berWizardConfig.steps.length) * 100;

  // Determine the form title based on report type
  const getFormTitle = () => {
      if (values.report_type && values.report_type.toLowerCase().includes('incident_report')) {
          return 'Incident Reports';
      }
      return 'Behavior Emergency Report (BER)';
  };

  const getFormSubtitle = () => {
      if (values.report_type && values.report_type.toLowerCase().includes('incident_report')) {
          return mode === 'edit' ? 'Edit Incident Report' : 'Create New Incident Report';
      }
      return mode === 'edit' ? 'Edit BER' : 'Create New BER';
  };

  // Helper function for form validation
  const validateFields = (fieldsToValidate, currentValues) => {
    const errors = [];
    for (const field of fieldsToValidate) {
      if (field.condition) {
        const conditionFieldValue = currentValues[field.condition.field];
        // Convert conditional values to lowercase and replace spaces to match stored values
        const conditionedValues = field.condition.values.map(v => v.toLowerCase().replace(/\s+/g, '_'));
        if (!conditionedValues.includes((conditionFieldValue || '').toLowerCase().replace(/\s+/g, '_'))) {
          continue; // Skip validation for hidden conditional fields
        }
      }

      if (field.required) {
        const fieldValue = currentValues[field.key];
        let isMissing = false;

        // Check based on field type
        if (field.type === 'checkboxes' || field.type === 'repeater' || field.type === 'file_upload') {
          isMissing = !Array.isArray(fieldValue) || fieldValue.length === 0;
        } else if (field.type === 'boolean') {
            // For boolean, 'required' typically means it must be checked (true)
            // For prohibited_techniques, required could mean it needs a selection, not necessarily 'true'
            // However, the field is a radio with Yes/No, so `fieldValue` itself will be boolean if selected.
            // If it's undefined (not selected), then it's missing.
            isMissing = fieldValue === undefined || fieldValue === null; // Requires selection of true/false
        }
        else {
          isMissing = !fieldValue; // Handles text, number, date, time, select, radio, student, site
        }

        if (isMissing) {
          errors.push(field.label || field.key);
        }
      }
      // Special validation for repeater items if the repeater itself is "required" through its template fields
      if (field.type === 'repeater' && Array.isArray(currentValues[field.key])) {
          const repeaterItems = currentValues[field.key];
          // This block focuses on required fields *within* existing repeater items.
          repeaterItems.forEach((item, itemIndex) => {
              field.template.forEach(templateField => {
                  if (templateField.required) {
                      const itemFieldValue = item[templateField.key];
                      if (!itemFieldValue) { // Generic check for falsy value
                          errors.push(`${field.label} (Item ${itemIndex + 1} - ${templateField.label})`);
                      }
                  }
              });
          });
      }
    }
    return errors;
  };

  // File upload handlers
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
        const uploadPromises = files.map(file => UploadFile({ file }));
        const uploadResults = await Promise.all(uploadPromises);

        const newFiles = uploadResults.map((result, index) => ({
            name: files[index].name,
            url: result.file_url,
            size: files[index].size,
            type: files[index].type,
            uploadedAt: new Date().toISOString()
        }));

        setValues(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newFiles]
        }));
    } catch (error) {
        console.error('Failed to upload files:', error);
        toast({
            title: "Upload Failed",
            description: "Failed to upload one or more files. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsUploading(false);
        // Clear the input field to allow re-uploading the same file if needed
        if (event.target) {
            event.target.value = '';
        }
    }
  };

  const removeFile = (index) => {
      setValues(prev => ({
          ...prev,
          attachments: prev.attachments.filter((_, i) => i !== index)
      }));
  };

  const handleNext = () => {
      const currentFields = berWizardConfig.steps[currentStep].fields;
      const errors = validateFields(currentFields, values);
      if (errors.length > 0) {
          toast({
              title: "Missing Information",
              description: `Please fill out all required fields on this step: ${errors.join(', ')}`,
              variant: "destructive",
          });
          return;
      }

      if (currentStep < berWizardConfig.steps.length - 1) {
          setCurrentStep(currentStep + 1);
      }
  };

  const handleBack = () => {
      if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  };

  const handleSubmit = async (status) => {
      const allFields = berWizardConfig.steps.flatMap(step => step.fields);
      const errors = validateFields(allFields, values);
      if (errors.length > 0) {
          toast({
              title: "Incomplete Report",
              description: `Please fill out all required fields before submitting: ${errors.join(', ')}`,
              variant: "destructive",
          });
          return;
      }

      setLoading(true);
      try {
          await onSubmit(values, status);
      } catch (error) {
          console.error('Error submitting form:', error);
          toast({
              title: "Submission Failed",
              description: "There was an error submitting the form. Please try again.",
              variant: "destructive",
          });
      } finally {
          setLoading(false);
      }
  };

  return (
      <div className="max-w-4xl mx-auto">
          <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800">{getFormTitle()}</h1>
              <p className="text-slate-600 mt-1">{getFormSubtitle()}</p>
          </header>

          <Progress value={progress} className="mb-6" />

          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                      <span>{currentStepData.title}</span>
                      <Badge variant="outline">
                          Step {currentStep + 1} of {berWizardConfig.steps.length}
                      </Badge>
                  </CardTitle>
                  <CardDescription>
                      {currentStepData.description || `Complete the ${currentStepData.title.toLowerCase()} section.`}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {currentStepData.fields.map(field => (
                      <div key={field.key || field.label} className={field.type === 'textarea' || field.type === 'checkboxes' || field.type === 'repeater' || field.type === 'file_upload' || field.type === 'section_title' ? 'md:col-span-2' : ''}>
                          {renderField(field, values, setValues, { students, sites, staff, isUploading, handleFileUpload, removeFile })}
                      </div>
                  ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                  <Button
                      variant="outline"
                      onClick={currentStep === 0 ? onCancel : handleBack}
                      disabled={loading}
                  >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {currentStep === 0 ? 'Cancel' : 'Previous'}
                  </Button>

                  <div className="flex gap-2">
                      {currentStep < berWizardConfig.steps.length - 1 ? (
                          <Button onClick={handleNext} disabled={loading}>
                              Next <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      ) : (
                          <>
                              <Button
                                  variant="outline"
                                  onClick={() => handleSubmit('draft')}
                                  disabled={loading}
                              >
                                  <Save className="mr-2 h-4 w-4" />
                                  {loading ? 'Saving...' : 'Save as Draft'}
                              </Button>
                              <Button
                                  onClick={() => handleSubmit('submitted')}
                                  disabled={loading}
                                  className="bg-blue-600 hover:bg-blue-700"
                              >
                                  <Send className="mr-2 h-4 w-4" />
                                  {loading ? 'Submitting...' : 'Submit Report'}
                              </Button>
                          </>
                      )}
                  </div>
              </CardFooter>
          </Card>
      </div>
  );
}
