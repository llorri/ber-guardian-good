import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const environmentalArrangementOptions = [
    { id: 'env_clutter', label: 'Minimal visual clutter (covered shelves/walls)' },
    { id: 'env_seating', label: 'Flexible seating options (stools, wobble, standing)' },
    { id: 'env_first_then', label: 'First-Then board' },
    { id: 'env_calm_corner', label: 'Calm/Regulation corner ready (tools + visuals)' },
    { id: 'env_sound', label: 'Sound management (soft surfaces/white noise)' },
    { id: 'env_timer', label: 'Visual timer/countdown available' },
    { id: 'env_sightline', label: 'Staff line-of-sight to students' },
    { id: 'env_pref_seating', label: 'Preferential seating' },
    { id: 'env_schedule', label: 'Posted visual schedule' },
    { id: 'env_materials', label: 'Materials organized: needed-in-reach, distractors out-of-sight' },
    { id: 'env_sensory_tools', label: 'Sensory tools accessible (fidgets, headphones)' },
    { id: 'env_lighting', label: 'Lighting adjusted (natural/dimmable; no flicker)' },
    { id: 'env_transition_cues', label: 'Transition cues set (chime, lights, visuals)' },
    { id: 'env_deescalation_space', label: 'De-escalation space near but separate' }
];

export const supportiveStrategyOptions = [
    { id: 'sup_stance', label: 'Calm, supportive stance & tone' },
    { id: 'sup_stimulation', label: 'Reduce stimulation (space/quiet/fewer people)' },
    { id: 'sup_choices', label: 'Offer two neutral choices' },
    { id: 'sup_break', label: 'Brief regulation break (water/move/sensory)' },
    { id: 'sup_change_face', label: 'Change of face/place (staff swap/quiet spot)' },
    { id: 'sup_listening', label: 'Active listening + brief empathy' },
    { id: 'sup_prompt', label: 'Nonverbal prompt + wait time' },
    { id: 'sup_first_then', label: 'First-Then / visual timer' },
    { id: 'sup_demands', label: 'Decrease or delay demands' },
    { id: 'sup_reinforce', label: 'Reinforce small steps toward calm' }
];

export const directiveStrategyOptions = [
    { id: 'dir_brief', label: 'Brief, clear directive (one behavior at a time)' },
    { id: 'dir_when_then', label: '"When/Then" contingency (precision request)' },
    { id: 'dir_enforceable', label: 'Enforceable boundary/"I will..." statements' },
    { id: 'dir_proximity', label: 'Proximity control & supportive stance; keep exit route' },
    { id: 'dir_consequence', label: 'State pre-taught consequence neutrally; allow take-up time' },
    { id: 'dir_choices', label: 'Set limits with two safe choices (both acceptable)' },
    { id: 'dir_repetition', label: 'Calm repetition ("broken record") + short wait time' },
    { id: 'dir_audience', label: 'Reduce audience / change location if possible' },
    { id: 'dir_remove', label: 'Remove or pause triggering demand/materials' },
    { id: 'dir_signal', label: 'Signal for assistance or change of face if escalation continues' }
];

export const disengagementOptions = [
    { id: 'dis_stance', label: 'Supportive Stance' }, 
    { id: 'dis_hair', label: 'Hair Pull' }, 
    { id: 'dis_turn_low', label: 'Turn Away - Low' },
    { id: 'dis_wrist', label: 'Wrist Grab' }, 
    { id: 'dis_bite', label: 'Bite' }, 
    { id: 'dis_turn_med', label: 'Turn Away - Medium' }, 
    { id: 'dis_clothing', label: 'Clothing Grab' }, 
    { id: 'dis_body', label: 'Body Grab' }, 
    { id: 'dis_turn_high', label: 'Turn Away - High' }
];

export const seatedHoldsOptions = [
    { id: 'hold_seat_low', label: 'Seated (Low)' }, 
    { id: 'hold_seat_med', label: 'Seated (Medium)' }, 
    { id: 'hold_seat_high', label: 'Seated (High)' }, 
    { id: 'hold_seat_add', label: 'Seated Add. Staff (High)' }
];

export const standingHoldsOptions = [
    { id: 'hold_stand_low', label: 'Standing (Low)' }, 
    { id: 'hold_stand_med', label: 'Standing (Medium)' }, 
    { id: 'hold_stand_high', label: 'Standing (High)' }, 
    { id: 'hold_stand_add_head', label: 'Standing Add. Staff Head (High)' }, 
    { id: 'hold_stand_add_shoulders', label: 'Standing Add. Staff Shoulders (High)' }
];

export const otherHoldsOptions = [
    { id: 'hold_team', label: 'Team Control (High)' }, 
    { id: 'hold_seat_to_stand', label: 'Seated to Standing (High)' }, 
    { id: 'hold_stand_to_kneel', label: 'Standing to Kneeling (High)' }
];

export const therapeuticRapportOptions = [
    { id: 'rap_needs', label: 'Offer Basic Needs' }, 
    { id: 'rap_medical', label: 'Medical Check' }, 
    { id: 'rap_debrief', label: 'Private Debrief (3-5m)' }, 
    { id: 'rap_listening', label: 'Reflective Listening' },
    { id: 'rap_reinforce', label: 'Reinforce Recovery' }, 
    { id: 'rap_plan_step', label: 'Plan One Next Step' }, 
    { id: 'rap_reentry', label: 'Re-Entry Plan Set' }, 
    { id: 'rap_action', label: 'Restorative Action' },
    { id: 'rap_teach', label: 'Teach Replacement Skill' }, 
    { id: 'rap_followup', label: 'Schedule Follow-Up' }, 
    { id: 'rap_doc', label: 'Document/Notify' }, 
    { id: 'rap_staff_debrief', label: 'Staff Debrief' }
];

function ChecklistSection({ title, options, selected, onChange, sectionClass, gridClass = "md:grid-cols-2", titleIcon }) {
    const handleCheckChange = (optionId, checked) => {
        const newSelection = checked 
            ? [...selected, optionId]
            : selected.filter(id => id !== optionId);
        onChange(newSelection);
    };

    return (
        <div className={`p-4 rounded-lg border ${sectionClass}`}>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
                {titleIcon && <span className="mr-2">{titleIcon}</span>}
                {title}
            </h3>
            <div className={`grid grid-cols-1 gap-2 ${gridClass}`}>
                {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={option.id}
                            checked={selected.includes(option.id)}
                            onCheckedChange={(checked) => handleCheckChange(option.id, checked)}
                        />
                        <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChecklistSection;