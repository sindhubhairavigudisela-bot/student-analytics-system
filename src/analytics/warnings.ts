/**
 * Early Warning Detection Engine
 * 
 * Implements transparent, explainable, rule-based analytics.
 * No black-box guesses or fabricated probabilities.
 */

import {
  AssessmentRecord,
  StudentSummary,
  SystemSettings,
  WarningItem,
  WarningSeverity,
} from '../types';
import { calculateRecordPercentage } from './calculations';

/**
 * Evaluates warning rules for a single student summary and their underlying records.
 */
export function evaluateStudentWarnings(
  summary: StudentSummary,
  studentRecords: AssessmentRecord[],
  settings: SystemSettings,
  reviewedWarningIds: Set<string> = new Set()
): WarningItem[] {
  const warnings: WarningItem[] = [];

  // 1. Low Performance Warning (Overall or Critical Subject)
  if (summary.overall_percentage !== null) {
    if (summary.overall_percentage < settings.pass_threshold) {
      const id = `low-perf-overall-${summary.student_id}`;
      warnings.push({
        id,
        student_id: summary.student_id,
        student_name: summary.student_name,
        class_name: summary.class_name,
        category: 'low_performance',
        severity: 'priority_review',
        title: 'Critical Academic Performance Alert',
        observation: `Overall average score of ${summary.overall_percentage}% is below the institutional passing threshold.`,
        evidence: `Cumulative average across ${summary.graded_assessments} graded assessment(s) is ${summary.overall_percentage}%, below pass standard of ${settings.pass_threshold}%.`,
        rule_description: `Rule: Average percentage < pass_threshold (${settings.pass_threshold}%).`,
        threshold_used: settings.pass_threshold,
        observed_value: `${summary.overall_percentage}%`,
        suggested_action: 'Initiate targeted diagnostic review and schedule academic support consultation.',
        is_reviewed: reviewedWarningIds.has(id),
      });
    } else if (summary.overall_percentage < settings.low_performance_threshold) {
      const id = `low-perf-borderline-${summary.student_id}`;
      warnings.push({
        id,
        student_id: summary.student_id,
        student_name: summary.student_name,
        class_name: summary.class_name,
        category: 'low_performance',
        severity: 'needs_review',
        title: 'Borderline Academic Performance',
        observation: `Overall average score of ${summary.overall_percentage}% is near passing threshold.`,
        evidence: `Student average is ${summary.overall_percentage}%, below the proactive review threshold of ${settings.low_performance_threshold}%.`,
        rule_description: `Rule: pass_threshold (${settings.pass_threshold}%) <= Average percentage < low_performance_threshold (${settings.low_performance_threshold}%).`,
        threshold_used: settings.low_performance_threshold,
        observed_value: `${summary.overall_percentage}%`,
        suggested_action: 'Review recent quizzes and assign structured formative practice before upcoming summative exams.',
        is_reviewed: reviewedWarningIds.has(id),
      });
    }
  }

  // 2. Declining Performance Warning
  // Strictly requires at least 2 comparable assessment periods
  if (
    summary.trend_direction === 'declining' &&
    summary.earlier_score !== null &&
    summary.later_score !== null &&
    summary.trend_delta !== null
  ) {
    const absDrop = Math.abs(summary.trend_delta);
    const severity: WarningSeverity = absDrop >= 20 ? 'priority_review' : 'needs_review';
    const id = `decline-${summary.student_id}`;

    warnings.push({
      id,
      student_id: summary.student_id,
      student_name: summary.student_name,
      class_name: summary.class_name,
      category: 'declining_performance',
      severity,
      title: 'Steep Performance Decline Detected',
      observation: `Student performance decreased by ${absDrop} percentage points between sequential assessment periods.`,
      evidence: `Initial assessment period score was ${summary.earlier_score}%, which declined to ${summary.later_score}% in the latest period (-${absDrop}% delta). Total evaluated assessments: ${summary.assessments_evaluated_count}.`,
      rule_description: `Rule: Sequential score drop >= decline_threshold (${settings.decline_threshold_delta}%) across comparable assessments.`,
      threshold_used: `-${settings.decline_threshold_delta}%`,
      observed_value: `-${absDrop}%`,
      suggested_action: 'Examine recent assessment topics to identify specific conceptual blockers or external transition factors.',
      is_reviewed: reviewedWarningIds.has(id),
    });
  }

  // 3. Subject-Level Learning Gap
  // Compare each subject average against the student's own overall average
  if (summary.overall_percentage !== null && Object.keys(summary.subject_averages).length >= 2) {
    Object.entries(summary.subject_averages).forEach(([subject, data]) => {
      const gap = Math.round((summary.overall_percentage! - data.avg_percentage) * 10) / 10;
      if (gap >= settings.subject_gap_threshold) {
        const id = `subject-gap-${summary.student_id}-${subject.replace(/\s+/g, '-').toLowerCase()}`;
        warnings.push({
          id,
          student_id: summary.student_id,
          student_name: summary.student_name,
          class_name: summary.class_name,
          category: 'subject_gap',
          severity: 'needs_review',
          title: `Isolated Subject Gap in ${subject}`,
          observation: `Score in ${subject} (${data.avg_percentage}%) is substantially lower than overall student profile (${summary.overall_percentage}%).`,
          evidence: `Discrepancy of ${gap} percentage points below general academic standing across ${data.count} assessment(s) in ${subject}.`,
          rule_description: `Rule: (Overall Average - Subject Average) >= subject_gap_threshold (${settings.subject_gap_threshold}%).`,
          threshold_used: `${settings.subject_gap_threshold}% gap`,
          observed_value: `${gap}% gap (${data.avg_percentage}% vs ${summary.overall_percentage}%)`,
          suggested_action: `Facilitate subject-specific office hours or provide supplemental practice modules in ${subject}.`,
          subject,
          is_reviewed: reviewedWarningIds.has(id),
        });
      }
    });
  }

  // 4. Attendance Review Warning
  if (
    summary.attendance_percentage !== null &&
    summary.attendance_percentage < settings.attendance_warning_threshold
  ) {
    const severity: WarningSeverity = summary.attendance_percentage < 65 ? 'priority_review' : 'needs_review';
    const id = `attendance-${summary.student_id}`;

    warnings.push({
      id,
      student_id: summary.student_id,
      student_name: summary.student_name,
      class_name: summary.class_name,
      category: 'attendance_review',
      severity,
      title: 'Low Attendance Rate Flag',
      observation: `Attendance rate of ${summary.attendance_percentage}% falls below expected presence threshold of ${settings.attendance_warning_threshold}%.`,
      evidence: `Recorded cumulative attendance is ${summary.attendance_percentage}%. Note: Statistical association does not demonstrate causation; absence reasons should be investigated pastorally.`,
      rule_description: `Rule: Attendance percentage < attendance_warning_threshold (${settings.attendance_warning_threshold}%).`,
      threshold_used: `${settings.attendance_warning_threshold}%`,
      observed_value: `${summary.attendance_percentage}%`,
      suggested_action: 'Conduct non-punitive attendance check-in to identify transportation, health, or scheduling impediments.',
      is_reviewed: reviewedWarningIds.has(id),
    });
  }

  // 5. Insufficient Data / Missing Assessment Records
  const missingOrAbsent = studentRecords.filter(
    (r) => r.result_status === 'absent' || r.result_status === 'missing' || r.result_status === 'not_submitted'
  );

  if (missingOrAbsent.length > 0) {
    const id = `data-completeness-${summary.student_id}`;
    const absentNames = missingOrAbsent.map((r) => `${r.subject} (${r.assessment_name})`).join(', ');
    
    warnings.push({
      id,
      student_id: summary.student_id,
      student_name: summary.student_name,
      class_name: summary.class_name,
      category: 'insufficient_data',
      severity: missingOrAbsent.length >= 2 ? 'needs_review' : 'informational',
      title: 'Incomplete Assessment Records',
      observation: `${missingOrAbsent.length} assessment record(s) lack valid graded submissions.`,
      evidence: `Affected entries: ${absentNames}. Missing entries are preserved as unscored and have not been distorted into zero scores.`,
      rule_description: 'Rule: Records flagged with status "absent", "missing", or "not_submitted".',
      threshold_used: '0 missing records',
      observed_value: `${missingOrAbsent.length} incomplete`,
      suggested_action: 'Verify whether makeup assessments are scheduled or if medical/excused absence notes are on file.',
      is_reviewed: reviewedWarningIds.has(id),
    });
  }

  return warnings;
}

/**
 * Enriches all student summaries with calculated warning items.
 */
export function enrichSummariesWithWarnings(
  summaries: Record<string, StudentSummary>,
  records: AssessmentRecord[],
  settings: SystemSettings,
  reviewedWarningIds: Set<string> = new Set()
): Record<string, StudentSummary> {
  const recordsByStudent: Record<string, AssessmentRecord[]> = {};
  records.forEach((r) => {
    if (!recordsByStudent[r.student_id]) {
      recordsByStudent[r.student_id] = [];
    }
    recordsByStudent[r.student_id].push(r);
  });

  const updated: Record<string, StudentSummary> = {};

  Object.entries(summaries).forEach(([studentId, summary]) => {
    const studentRecords = recordsByStudent[studentId] || [];
    const studentWarnings = evaluateStudentWarnings(
      summary,
      studentRecords,
      settings,
      reviewedWarningIds
    );

    updated[studentId] = {
      ...summary,
      warnings: studentWarnings,
    };
  });

  return updated;
}
