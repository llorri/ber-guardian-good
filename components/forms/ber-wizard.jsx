export const berWizardConfig = {
  steps: [
    {
      id: "incident-details",
      title: "Incident Details",
      fields: [
        { type: "student", key: "student_id", label: "Student", required: true },
        { type: "site", key: "site_id", label: "Site", required: true },
        { type: "dob-readonly", key: "student_dob", label: "Student Date of Birth" },
        { type: "readonly", key: "age_at_incident", label: "Age at Incident" },
        { type: "date", key: "incident_date", label: "Incident Date", required: true },
        { type: "time", key: "incident_time", label: "Incident Time", required: true },
        { type: "text", key: "location", label: "Location", required: true, placeholder: "e.g., Classroom 101, Hallway, Cafeteria" },
        { type: "select", key: "setting", label: "Setting", options: ["Classroom","Hallway","Cafeteria","Playground","Bus","Office","Other"] },
        { type: "textarea", key: "incident_narrative", label: "Incident Narrative", required: true },
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
                "Restitution plan (formal)",
                "Recommend expulsion (per policy)"
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
        }
      ]
    },
    {
      id: "intervention",
      title: "Intervention",
      fields: [
        { type: "select", key: "cpi_crisis_stage", label: "CPI Crisis Stage Observed", options: ["Anxiety","Defensive","Risk Behavior","Tension Reduction"] },
        { type: "select", key: "cpi_staff_response", label: "CPI-Aligned Staff Response", options: ["Supportive","Directive","Physical Intervention","Therapeutic Rapport"] },
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
          type: "checkboxes",
          key: "supportive_strategies",
          label: "Supportive Strategies Used",
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
        { type: "textarea", key: "deescalation_attempts", label: "De-escalation Attempts", helper: "Describe specific attempts made to de-escalate the situation." },
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
      id: "emergency-interventions",
      title: "Emergency Interventions",
      fields: [
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
            },
            {
              name: "Supine Holds",
              items: [
                "Supine (High)",
                "Supine Add. Staff (High)"
              ]
            }
          ]
        },
        { type: "select", key: "emergency_intervention_used", label: "Emergency Intervention Type", options: ["No Physical Intervention","Physical Restraint","Seclusion","Both"] },
        { type: "boolean", key: "prohibited_techniques", label: "Were any prohibited techniques used?" },
        { type: "textarea", key: "additional_intervention_details", label: "Additional Intervention Details" }
      ]
    },
    {
      id: "outcomes-care",
      title: "Outcomes & Post-Incident Care",
      fields: [
        {
          type: "checkboxes",
          key: "injuries",
          label: "Injuries Sustained",
          items: ["Student", "Staff", "Other"]
        },
        { type: "boolean", key: "medical_evaluation", label: "Medical evaluation required?" },
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
        { type: "radio", key: "bip_in_place", label: "Behavior Intervention Plan (BIP) in place?", options: ["Yes","No","Unknown"] },
        { type: "textarea", key: "environmental_factors", label: "Environmental Factors", helper: "Describe any environmental factors that may have contributed to the incident." }
      ]
    },
    {
      id: "notifications-followup",
      title: "Notifications & Follow-up",
      fields: [
        {
          type: "repeater",
          key: "notification_recipients",
          label: "Notification Recipients",
          min: 1,
          max: 10,
          template: [
            { type: "text", key: "name", label: "Name", required: true },
            { type: "select", key: "relationship", label: "Relationship", options: ["Parent/Guardian","Case Manager","Administrator","Counselor","Other"], required: true },
            { type: "select", key: "method", label: "Contact Method", options: ["Phone","Email","In-Person","Letter"], required: true },
            { type: "date", key: "date", label: "Date Contacted" }
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
            "Medical evaluation completed if required",
            "Staff involved have been debriefed",
            "Follow-up actions have been identified",
            "Administrator has reviewed this report",
            "All required signatures obtained"
          ]
        }
      ]
    }
  ]
};