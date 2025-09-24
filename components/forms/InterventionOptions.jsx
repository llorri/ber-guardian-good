import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const progressiveDisciplineOptions = [
  {"id":"pd_verbal_redirect","label":"Verbal redirection / reminder","tier":1},
  {"id":"pd_reteach","label":"Reteach expectation / skill","tier":1},
  {"id":"pd_choice_break","label":"Choice provided / cool-down break","tier":1},
  {"id":"pd_seat_change","label":"Seat change / proximity","tier":1},
  {"id":"pd_reflection","label":"Student reflection form","tier":1},
  {"id":"pd_loss_privilege","label":"Loss of minor privilege","tier":1},
  {"id":"pd_parent_contact","label":"Parent/guardian contact","tier":1},
  {"id":"pd_cico_brief","label":"Brief check-in/check-out","tier":1},
  {"id":"pd_confiscation","label":"Confiscation (return end of day)","tier":1},
  {"id":"pd_class_detention","label":"Classroom detention","tier":1},
  {"id":"pd_warning","label":"Warning (documented)","tier":1},
  {"id":"pd_behavior_contract","label":"Behavior contract / goal sheet","tier":2},
  {"id":"pd_problem_solving_conf","label":"Problem-solving conference","tier":2},
  {"id":"pd_cico_scheduled","label":"CICO (scheduled)","tier":2},
  {"id":"pd_restitution","label":"Restitution / repair","tier":2},
  {"id":"pd_skill_building","label":"Skill-building session","tier":2},
  {"id":"pd_mediation","label":"Mediation (student–student)","tier":2},
  {"id":"pd_alt_room","label":"Alternate room for period","tier":2},
  {"id":"pd_in_school_detention","label":"In-school detention","tier":2},
  {"id":"pd_iss","label":"In-school suspension (ISS)","tier":3,"requiresAdmin":true},
  {"id":"pd_oss","label":"Out-of-school suspension (OSS)","tier":3,"requiresAdmin":true},
  {"id":"pd_schedule_change","label":"Schedule/placement change","tier":3,"requiresAdmin":true},
  {"id":"pd_threat_assessment","label":"Safety/Threat assessment referral","tier":3,"requiresAdmin":true},
  {"id":"pd_law_enforcement","label":"Law-enforcement notification","tier":3,"requiresAdmin":true},
  {"id":"pd_formal_restitution","label":"Restitution plan (formal)","tier":3,"requiresAdmin":true},
  {"id":"pd_expulsion_recommend","label":"Recommend expulsion (per policy)","tier":3,"requiresAdmin":true}
];

const restorativePracticeOptions = [
  {"id":"rp_affective_statement","label":"Affective statement"},
  {"id":"rp_restorative_questions","label":"Restorative questions (quick)"},
  {"id":"rp_conversation","label":"Restorative conversation"},
  {"id":"rp_mediation","label":"Formal mediation"},
  {"id":"rp_circle_proactive","label":"Restorative circle – proactive"},
  {"id":"rp_circle_responsive","label":"Restorative circle – responsive"},
  {"id":"rp_apology_verbal","label":"Apology (verbal)"},
  {"id":"rp_apology_written","label":"Written apology/impact letter"},
  {"id":"rp_repair_harm","label":"Repair of harm / restitution"},
  {"id":"rp_community_service","label":"Community service (school-based)"},
  {"id":"rp_reentry_plan","label":"Reentry conference/plan"},
  {"id":"rp_family_conference","label":"Family conference"},
  {"id":"rp_followup","label":"Follow-up check-ins"}
];

const berFollowupOptions = [
  {"id":"bf_student_debrief","label":"Student debrief within 24h"},
  {"id":"bf_team_review","label":"Team incident review within 48h"},
  {"id":"bf_bip_review","label":"BIP review/update scheduled"},
  {"id":"bf_staff_training","label":"Staff training refresh scheduled"},
  {"id":"bf_parent_notification","label":"Parent/guardian notification sent"},
  {"id":"bf_nurse_check","label":"Nurse/first-aid check completed"},
  {"id":"bf_iep_notify","label":"IEP/504 team notified (if applicable)"},
  {"id":"bf_reentry_shared","label":"Reentry plan created & shared"}
];

const getTierColor = (tier) => {
  switch (tier) {
    case 1: return "bg-green-100 text-green-800";
    case 2: return "bg-yellow-100 text-yellow-800";
    case 3: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function ProgressiveDisciplineSection({ selectedOptions, onChange }) {
  const handleOptionChange = (optionId, checked) => {
    const newSelection = checked 
      ? [...(selectedOptions || []), optionId]
      : (selectedOptions || []).filter(id => id !== optionId);
    onChange(newSelection);
  };

  const groupedOptions = {
    1: progressiveDisciplineOptions.filter(opt => opt.tier === 1),
    2: progressiveDisciplineOptions.filter(opt => opt.tier === 2),
    3: progressiveDisciplineOptions.filter(opt => opt.tier === 3)
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Progressive Discipline Actions</h3>
      <p className="text-sm text-blue-700 mb-4">Select all discipline actions that were taken:</p>
      
      {[1, 2, 3].map(tier => (
        <div key={tier} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getTierColor(tier)}>
              Tier {tier} {tier === 3 && "(Admin Required)"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {groupedOptions[tier].map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id}
                  checked={(selectedOptions || []).includes(option.id)}
                  onCheckedChange={(checked) => handleOptionChange(option.id, checked)}
                />
                <Label htmlFor={option.id} className="text-sm flex-1">
                  {option.label}
                  {option.requiresAdmin && <span className="text-red-600 ml-1">*</span>}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RestorativePracticesSection({ selectedOptions, onChange }) {
  const handleOptionChange = (optionId, checked) => {
    const newSelection = checked 
      ? [...(selectedOptions || []), optionId]
      : (selectedOptions || []).filter(id => id !== optionId);
    onChange(newSelection);
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-3">Restorative Practices</h3>
      <p className="text-sm text-purple-700 mb-4">Select all restorative practices that were implemented:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {restorativePracticeOptions.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox 
              id={option.id}
              checked={(selectedOptions || []).includes(option.id)}
              onCheckedChange={(checked) => handleOptionChange(option.id, checked)}
            />
            <Label htmlFor={option.id} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BERFollowupSection({ selectedOptions, onChange }) {
  const handleOptionChange = (optionId, checked) => {
    const newSelection = checked 
      ? [...(selectedOptions || []), optionId]
      : (selectedOptions || []).filter(id => id !== optionId);
    onChange(newSelection);
  };

  return (
    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
      <h3 className="text-lg font-semibold text-amber-800 mb-3">BER Follow-up Actions</h3>
      <p className="text-sm text-amber-700 mb-4">Select all follow-up actions that were completed or scheduled:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {berFollowupOptions.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox 
              id={option.id}
              checked={(selectedOptions || []).includes(option.id)}
              onCheckedChange={(checked) => handleOptionChange(option.id, checked)}
            />
            <Label htmlFor={option.id} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}