/**
 * Pedagogical Academic Intervention Engine
 * 
 * Generates transparent, actionable, evidence-based academic support recommendations.
 * 
 * Strict Guideline:
 * Recommendations must be based on available empirical data and should never
 * claim to know the psychological, personal, or cognitive reason behind difficulties.
 */

import { StudentSummary, InterventionRecommendation, SystemSettings } from '../types';

export function generateStudentInterventions(
  summary: StudentSummary,
  _settings: SystemSettings
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];

  // 1. Overall Critical Performance Intervention
  if (summary.overall_percentage !== null && summary.overall_percentage < 40) {
    recommendations.push({
      id: `intervention-critical-${summary.student_id}`,
      student_id: summary.student_id,
      student_name: summary.student_name,
      title: 'Structured Multi-Subject Foundation Review',
      type: 'academic_support',
      urgency: 'high',
      summary: `Overall performance (${summary.overall_percentage}%) indicates foundational challenges across course topics.`,
      recommended_actions: [
        'Schedule a 15-minute diagnostic conference with the academic advisor to review core study routines.',
        'Pair student with peer study circles or structured tutoring sessions for key syllabus modules.',
        'Provide simplified concept review checklists and progressive difficulty problem sets.',
        'Break down forthcoming summative assessments into bite-sized formative checkpoints.',
      ],
      evidence_basis: `Current overall standing is ${summary.overall_percentage}% across ${summary.graded_assessments} graded assessment(s).`,
      caveat: 'A low average marks an academic need; it does not indicate inherent capability or lack of student effort.',
    });
  }

  // 2. Steep Performance Decline Intervention
  if (summary.trend_direction === 'declining' && summary.trend_delta !== null) {
    const absDrop = Math.abs(summary.trend_delta);
    recommendations.push({
      id: `intervention-decline-${summary.student_id}`,
      student_id: summary.student_id,
      student_name: summary.student_name,
      title: 'Recent Assessment Topic Review & Transition Check',
      type: 'pedagogical_review',
      urgency: absDrop >= 20 ? 'high' : 'medium',
      summary: `A drop of ${absDrop} percentage points occurred between earlier (${summary.earlier_score}%) and later (${summary.later_score}%) assessments.`,
      recommended_actions: [
        'Review the specific syllabus units tested in the later assessment to pinpoint new conceptual hurdles.',
        'Provide the student with worked solutions and targeted revision exercises on recent missed questions.',
        'Inquire informally if external scheduling or project overlap affected preparation time during this period.',
        'Set up a checkpoint quiz before the next major term test to evaluate score stabilization.',
      ],
      evidence_basis: `Trajectory changed from ${summary.earlier_score}% to ${summary.later_score}% (-${absDrop}% delta).`,
      caveat: 'Performance drops often correspond to increased syllabus complexity or temporary life transitions, not diminished aptitude.',
    });
  }

  // 3. Isolated Subject Gap Interventions
  Object.entries(summary.subject_averages).forEach(([subject, data]) => {
    if (summary.overall_percentage !== null) {
      const gap = summary.overall_percentage - data.avg_percentage;
      if (gap >= 15) {
        recommendations.push({
          id: `intervention-subject-${summary.student_id}-${subject.replace(/\s+/g, '-').toLowerCase()}`,
          student_id: summary.student_id,
          student_name: summary.student_name,
          title: `Targeted Concept Reinforcement in ${subject}`,
          type: 'academic_support',
          urgency: 'medium',
          summary: `Performance in ${subject} (${data.avg_percentage}%) diverges sharply from the student's overall competence (${summary.overall_percentage}%).`,
          recommended_actions: [
            `Arrange a 1-on-1 consultation with the ${subject} instructor to review prerequisite concepts.`,
            `Offer alternative explanation materials (e.g. video walkthroughs, interactive problem sets) for ${subject}.`,
            `Identify whether assessment format (e.g., timed essay, theoretical derivation, numerical calculations) posed a bottleneck.`,
            `Encourage participation in ${subject} collaborative problem-solving labs.`,
          ],
          evidence_basis: `${subject} average (${data.avg_percentage}%) is ${Math.round(gap)}% lower than overall profile average (${summary.overall_percentage}%).`,
          caveat: 'The student clearly demonstrates academic mastery in other areas, pointing towards specific topical blockers in this discipline.',
        });
      }
    }
  });

  // 4. Attendance Outreach Intervention
  if (summary.attendance_percentage !== null && summary.attendance_percentage < 75) {
    recommendations.push({
      id: `intervention-attendance-${summary.student_id}`,
      student_id: summary.student_id,
      student_name: summary.student_name,
      title: 'Supportive Attendance Check-in & Barrier Review',
      type: 'attendance_outreach',
      urgency: summary.attendance_percentage < 65 ? 'high' : 'medium',
      summary: `Cumulative attendance of ${summary.attendance_percentage}% reflects missed instructional contact hours.`,
      recommended_actions: [
        'Coordinate an empathetic pastoral check-in to identify potential health, transport, or family barriers.',
        'Ensure the student has seamless access to lecture slides, class recordings, and peer notes for missed dates.',
        'Verify that attendance logs accurately reflect school-sanctioned athletic or extracurricular leaves.',
        'Establish an attendance tracking goal for the upcoming academic cycle.',
      ],
      evidence_basis: `Documented attendance is ${summary.attendance_percentage}% (institutional threshold: 75%).`,
      caveat: 'Absence data indicates opportunity gap and missed lecture exposure, without presuming disengagement.',
    });
  }

  // 5. Positive Reinforcement for Consistent/Improving Students
  if (
    summary.trend_direction === 'improving' &&
    summary.overall_percentage !== null &&
    summary.overall_percentage >= 60
  ) {
    recommendations.push({
      id: `intervention-positive-${summary.student_id}`,
      student_id: summary.student_id,
      student_name: summary.student_name,
      title: 'Academic Progress Affirmation & Peer Mentorship Opportunity',
      type: 'academic_support',
      urgency: 'low',
      summary: `Positive academic momentum with an upward trajectory of +${summary.trend_delta}% across recent assessments.`,
      recommended_actions: [
        'Acknowledge student improvement and highlight successful study tactics during feedback.',
        'Invite student to share approach or assist peers in study group activities.',
        'Encourage participation in advanced extension assignments or honors questions.',
      ],
      evidence_basis: `Score increased from ${summary.earlier_score}% to ${summary.later_score}% (+${summary.trend_delta}%).`,
      caveat: 'Reinforcing positive study habits builds sustainable learning confidence.',
    });
  }

  return recommendations;
}
