/**
 * Core Academic Calculation Engine
 * 
 * Centralized, pure mathematical calculations adhering strictly to:
 * - Explicit denominators
 * - Safe numeric handling (zero max marks, null checks)
 * - Result status differentiation (graded vs absent vs missing vs opted-out)
 * - Non-duplicated attendance aggregation
 * - Chronological trend evaluation (requires >= 2 assessments)
 */

import {
  AssessmentRecord,
  MetricSummary,
  StudentSummary,
  SystemSettings,
  ScoreBin,
  TrendDirection,
} from '../types';

export const DEFAULT_SCORE_BINS: ScoreBin[] = [
  { label: '< 40% (Critical)', min: 0, max: 39.99, color: '#ef4444' },
  { label: '40% - 59% (Needs Improvement)', min: 40, max: 59.99, color: '#f59e0b' },
  { label: '60% - 74% (Competent)', min: 60, max: 74.99, color: '#3b82f6' },
  { label: '75% - 89% (Proficient)', min: 75, max: 89.99, color: '#8b5cf6' },
  { label: '90% - 100% (Exemplary)', min: 90, max: 100, color: '#10b981' },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  pass_threshold: 40,
  low_performance_threshold: 50,
  decline_threshold_delta: 10,
  subject_gap_threshold: 15,
  attendance_warning_threshold: 75,
  score_bins: DEFAULT_SCORE_BINS,
};

/**
 * Calculates normalized percentage for a single valid graded record.
 * Returns null if the record is missing, absent, opted-out, or has invalid max_marks.
 */
export function calculateRecordPercentage(record: AssessmentRecord): number | null {
  if (record.result_status !== 'graded') {
    return null;
  }
  if (record.marks_obtained === null || record.marks_obtained === undefined) {
    return null;
  }
  if (typeof record.max_marks !== 'number' || record.max_marks <= 0) {
    return null;
  }
  if (record.marks_obtained < 0 || record.marks_obtained > record.max_marks) {
    return null; // out of valid bounds
  }

  const pct = (record.marks_obtained / record.max_marks) * 100;
  return Math.round(pct * 100) / 100; // rounded to 2 decimal places
}

/**
 * Filters assessment records based on criteria.
 */
export function filterRecords(
  records: AssessmentRecord[],
  filters: {
    class_name?: string;
    subject?: string;
    assessment_name?: string;
    academic_term?: string;
    search_query?: string;
  }
): AssessmentRecord[] {
  return records.filter((r) => {
    if (filters.class_name && filters.class_name !== 'ALL' && r.class_name !== filters.class_name) {
      return false;
    }
    if (filters.subject && filters.subject !== 'ALL' && r.subject !== filters.subject) {
      return false;
    }
    if (filters.assessment_name && filters.assessment_name !== 'ALL' && r.assessment_name !== filters.assessment_name) {
      return false;
    }
    if (filters.academic_term && filters.academic_term !== 'ALL' && r.academic_term !== filters.academic_term) {
      return false;
    }
    if (filters.search_query && filters.search_query.trim() !== '') {
      const q = filters.search_query.toLowerCase().trim();
      const matchName = r.student_name.toLowerCase().includes(q);
      const matchId = r.student_id.toLowerCase().includes(q);
      if (!matchName && !matchId) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Derives unique student attendance within a subset of records.
 * Avoids duplicating attendance across multiple subjects and assessments.
 */
export function calculateUniqueStudentAttendance(records: AssessmentRecord[]): {
  average_attendance: number | null;
  student_attendance_map: Record<string, number>;
} {
  const studentAttendanceMap: Record<string, number> = {};

  records.forEach((r) => {
    if (r.attendance_percentage !== null && r.attendance_percentage !== undefined) {
      if (typeof r.attendance_percentage === 'number' && r.attendance_percentage >= 0 && r.attendance_percentage <= 100) {
        // Keep the latest or valid attendance recorded for this student ID
        studentAttendanceMap[r.student_id] = r.attendance_percentage;
      }
    }
  });

  const studentIds = Object.keys(studentAttendanceMap);
  if (studentIds.length === 0) {
    return { average_attendance: null, student_attendance_map: {} };
  }

  const sum = studentIds.reduce((acc, id) => acc + studentAttendanceMap[id], 0);
  const avg = Math.round((sum / studentIds.length) * 10) / 10;
  return { average_attendance: avg, student_attendance_map: studentAttendanceMap };
}

/**
 * Calculates individual student summaries including subject breakdowns and trend.
 */
export function calculateStudentSummaries(
  records: AssessmentRecord[],
  settings: SystemSettings = DEFAULT_SETTINGS
): Record<string, StudentSummary> {
  const studentMap: Record<string, AssessmentRecord[]> = {};

  records.forEach((r) => {
    if (!studentMap[r.student_id]) {
      studentMap[r.student_id] = [];
    }
    studentMap[r.student_id].push(r);
  });

  const summaries: Record<string, StudentSummary> = {};

  Object.entries(studentMap).forEach(([studentId, studentRecords]) => {
    const firstRec = studentRecords[0];
    const studentName = firstRec.student_name;
    const className = firstRec.class_name;

    // Collect valid attendance
    let latestAttendance: number | null = null;
    studentRecords.forEach((r) => {
      if (r.attendance_percentage !== null && r.attendance_percentage !== undefined) {
        if (r.attendance_percentage >= 0 && r.attendance_percentage <= 100) {
          latestAttendance = r.attendance_percentage;
        }
      }
    });

    // Group valid graded records by subject
    const subjectAverages: StudentSummary['subject_averages'] = {};
    const validGradedPercentages: number[] = [];

    studentRecords.forEach((r) => {
      const pct = calculateRecordPercentage(r);
      if (pct !== null) {
        validGradedPercentages.push(pct);
        if (!subjectAverages[r.subject]) {
          subjectAverages[r.subject] = {
            subject: r.subject,
            avg_percentage: 0,
            count: 0,
            total_obtained: 0,
            total_max: 0,
          };
        }
        subjectAverages[r.subject].count += 1;
        subjectAverages[r.subject].total_obtained += r.marks_obtained!;
        subjectAverages[r.subject].total_max += r.max_marks;
      }
    });

    // Compute subject average percentages
    Object.keys(subjectAverages).forEach((subj) => {
      const item = subjectAverages[subj];
      if (item.total_max > 0) {
        item.avg_percentage = Math.round((item.total_obtained / item.total_max) * 1000) / 10;
      }
    });

    // Overall student average
    let overallPercentage: number | null = null;
    if (validGradedPercentages.length > 0) {
      const sum = validGradedPercentages.reduce((a, b) => a + b, 0);
      overallPercentage = Math.round((sum / validGradedPercentages.length) * 10) / 10;
    }

    // Trend Evaluation: Chronologically sort valid graded records
    // Requires at least 2 comparable assessment dates or distinct assessment occurrences
    const datedGraded = studentRecords
      .map((r) => ({
        ...r,
        pct: calculateRecordPercentage(r),
      }))
      .filter((r) => r.pct !== null)
      .sort((a, b) => {
        const dateA = a.assessment_date ? new Date(a.assessment_date).getTime() : 0;
        const dateB = b.assessment_date ? new Date(b.assessment_date).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return a.assessment_name.localeCompare(b.assessment_name);
      });

    let trendDirection: TrendDirection = 'insufficient_data';
    let trendDelta: number | null = null;
    let earlierScore: number | null = null;
    let laterScore: number | null = null;

    if (datedGraded.length >= 2) {
      // Group by assessment name/date to get composite score across subjects in that assessment
      const assessmentGroups = new Map<string, number[]>();
      datedGraded.forEach((r) => {
        const key = r.assessment_name || r.assessment_date || 'period';
        if (!assessmentGroups.has(key)) {
          assessmentGroups.set(key, []);
        }
        assessmentGroups.get(key)!.push(r.pct!);
      });

      const groupAverages: number[] = [];
      assessmentGroups.forEach((scores) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        groupAverages.push(Math.round(avg * 10) / 10);
      });

      if (groupAverages.length >= 2) {
        earlierScore = groupAverages[0];
        laterScore = groupAverages[groupAverages.length - 1];
        trendDelta = Math.round((laterScore - earlierScore) * 10) / 10;

        if (trendDelta <= -settings.decline_threshold_delta) {
          trendDirection = 'declining';
        } else if (trendDelta >= settings.decline_threshold_delta) {
          trendDirection = 'improving';
        } else {
          trendDirection = 'stable';
        }
      }
    }

    summaries[studentId] = {
      student_id: studentId,
      student_name: studentName,
      class_name: className,
      overall_percentage: overallPercentage,
      attendance_percentage: latestAttendance,
      total_assessments: studentRecords.length,
      graded_assessments: validGradedPercentages.length,
      subject_averages: subjectAverages,
      trend_direction: trendDirection,
      trend_delta: trendDelta,
      earlier_score: earlierScore,
      later_score: laterScore,
      assessments_evaluated_count: datedGraded.length,
      warnings: [], // populated by warning detector
    };
  });

  return summaries;
}

/**
 * Calculates complete dashboard MetricSummary from a filtered set of records.
 */
export function calculateMetricSummary(
  records: AssessmentRecord[],
  studentSummaries: Record<string, StudentSummary>,
  settings: SystemSettings = DEFAULT_SETTINGS
): MetricSummary {
  const uniqueStudentIds = new Set(records.map((r) => r.student_id));
  const totalUniqueStudents = uniqueStudentIds.size;
  const totalAssessments = records.length;

  // Valid graded results
  const validGradedRecords = records.filter((r) => calculateRecordPercentage(r) !== null);
  const validGradedCount = validGradedRecords.length;

  // Overall average percentage
  let overallAverage: number | null = null;
  if (validGradedCount > 0) {
    const sum = validGradedRecords.reduce((acc, r) => acc + calculateRecordPercentage(r)!, 0);
    overallAverage = Math.round((sum / validGradedCount) * 10) / 10;
  }

  // Pass rate: percentage of valid graded results meeting pass threshold
  let passRate: number | null = null;
  if (validGradedCount > 0) {
    const passedCount = validGradedRecords.filter(
      (r) => calculateRecordPercentage(r)! >= settings.pass_threshold
    ).length;
    passRate = Math.round((passedCount / validGradedCount) * 1000) / 10;
  }

  // Average attendance (calculated cleanly per unique student)
  const { average_attendance, student_attendance_map } = calculateUniqueStudentAttendance(records);

  // Subject-wise performances
  const subjectMap = new Map<string, { totalPct: number; count: number; passCount: number; studentSet: Set<string> }>();
  validGradedRecords.forEach((r) => {
    const pct = calculateRecordPercentage(r)!;
    if (!subjectMap.has(r.subject)) {
      subjectMap.set(r.subject, { totalPct: 0, count: 0, passCount: 0, studentSet: new Set() });
    }
    const s = subjectMap.get(r.subject)!;
    s.totalPct += pct;
    s.count += 1;
    if (pct >= settings.pass_threshold) {
      s.passCount += 1;
    }
    s.studentSet.add(r.student_id);
  });

  const subjectPerformances = Array.from(subjectMap.entries())
    .map(([subject, s]) => ({
      subject,
      average_percentage: Math.round((s.totalPct / s.count) * 10) / 10,
      student_count: s.studentSet.size,
      pass_rate: Math.round((s.passCount / s.count) * 1000) / 10,
    }))
    .sort((a, b) => b.average_percentage - a.average_percentage);

  // Performance over time (grouped by assessment_name or date)
  const timeMap = new Map<string, { totalPct: number; count: number; date: string }>();
  validGradedRecords.forEach((r) => {
    const period = r.assessment_name || 'Assessment';
    const date = r.assessment_date || '';
    const key = `${period}|${date}`;
    const pct = calculateRecordPercentage(r)!;
    if (!timeMap.has(key)) {
      timeMap.set(key, { totalPct: 0, count: 0, date });
    }
    const t = timeMap.get(key)!;
    t.totalPct += pct;
    t.count += 1;
  });

  const timeSeries = Array.from(timeMap.entries())
    .map(([key, t]) => {
      const [period] = key.split('|');
      return {
        period,
        date: t.date,
        average_percentage: Math.round((t.totalPct / t.count) * 10) / 10,
        count: t.count,
      };
    })
    .sort((a, b) => {
      if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.period.localeCompare(b.period);
    });

  // Score distribution across configured score bins (based on student overall percentage)
  const activeStudentSummaries = Array.from(uniqueStudentIds)
    .map((id) => studentSummaries[id])
    .filter(Boolean);

  const distribution = settings.score_bins.map((bin) => {
    const studentsInBin = activeStudentSummaries.filter(
      (s) => s.overall_percentage !== null && s.overall_percentage >= bin.min && s.overall_percentage <= bin.max
    );
    const count = studentsInBin.length;
    const pct = activeStudentSummaries.length > 0
      ? Math.round((count / activeStudentSummaries.length) * 1000) / 10
      : 0;

    return {
      range: bin.label,
      count,
      percentage: pct,
      color: bin.color,
    };
  });

  // Attendance vs Score scatter pairs
  const attendanceVsScore: MetricSummary['attendance_vs_score'] = [];
  activeStudentSummaries.forEach((s) => {
    const att = student_attendance_map[s.student_id] ?? s.attendance_percentage;
    if (s.overall_percentage !== null && att !== null && att !== undefined) {
      attendanceVsScore.push({
        student_id: s.student_id,
        student_name: s.student_name,
        score: s.overall_percentage,
        attendance: att,
        class_name: s.class_name,
      });
    }
  });

  // Students requiring review (those with active warnings)
  const studentsWithWarnings = activeStudentSummaries
    .filter((s) => s.warnings && s.warnings.length > 0)
    .map((s) => ({
      student_id: s.student_id,
      student_name: s.student_name,
      class_name: s.class_name,
      overall_percentage: s.overall_percentage,
      attendance_percentage: s.attendance_percentage,
      trend_direction: s.trend_direction,
      trend_delta: s.trend_delta,
      warnings: s.warnings,
    }))
    .sort((a, b) => {
      // Prioritize priority_review over needs_review
      const getPriorityWeight = (wList: typeof a.warnings) => {
        if (wList.some((w) => w.severity === 'priority_review')) return 3;
        if (wList.some((w) => w.severity === 'needs_review')) return 2;
        return 1;
      };
      return getPriorityWeight(b.warnings) - getPriorityWeight(a.warnings);
    });

  return {
    total_unique_students: totalUniqueStudents,
    overall_average_score: overallAverage,
    pass_rate: passRate,
    average_attendance: average_attendance,
    total_assessments: totalAssessments,
    valid_graded_results: validGradedCount,
    students_requiring_review: studentsWithWarnings.length,
    subject_performances: subjectPerformances,
    time_series: timeSeries,
    distribution,
    attendance_vs_score: attendanceVsScore,
    students_requiring_review_list: studentsWithWarnings,
  };
}
