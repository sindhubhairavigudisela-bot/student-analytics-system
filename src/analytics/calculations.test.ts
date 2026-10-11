/**
 * Automated Test Suite for Student Performance Analytics System
 * Tests core calculation accuracy, edge cases, deduplication, and warning rules.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRecordPercentage,
  calculateUniqueStudentAttendance,
  calculateStudentSummaries,
  calculateMetricSummary,
  filterRecords,
  DEFAULT_SETTINGS,
} from './calculations';
import { evaluateStudentWarnings } from './warnings';
import { AssessmentRecord } from '../types';

describe('Academic Calculation Engine', () => {
  it('calculates accurate normalized score percentage for valid graded records', () => {
    const record: AssessmentRecord = {
      student_id: 'S1',
      student_name: 'Alex',
      class_name: '10-A',
      subject: 'Math',
      assessment_name: 'Quiz 1',
      assessment_date: '2026-09-01',
      marks_obtained: 18,
      max_marks: 25,
      attendance_percentage: 90,
      result_status: 'graded',
    };

    const pct = calculateRecordPercentage(record);
    expect(pct).toBe(72); // 18 / 25 * 100 = 72%
  });

  it('correctly handles explicit zero marks as valid 0% and does not treat them as missing', () => {
    const record: AssessmentRecord = {
      student_id: 'S1',
      student_name: 'Alex',
      class_name: '10-A',
      subject: 'Math',
      assessment_name: 'Quiz 1',
      assessment_date: '2026-09-01',
      marks_obtained: 0,
      max_marks: 50,
      attendance_percentage: 90,
      result_status: 'graded',
    };

    const pct = calculateRecordPercentage(record);
    expect(pct).toBe(0);
  });

  it('excludes missing, absent, and opted-out records from score calculations without skewing to 0', () => {
    const absentRecord: AssessmentRecord = {
      student_id: 'S1',
      student_name: 'Alex',
      class_name: '10-A',
      subject: 'Math',
      assessment_name: 'Quiz 1',
      assessment_date: '2026-09-01',
      marks_obtained: null,
      max_marks: 100,
      attendance_percentage: 90,
      result_status: 'absent',
    };

    const optedOutRecord: AssessmentRecord = {
      student_id: 'S1',
      student_name: 'Alex',
      class_name: '10-A',
      subject: 'French',
      assessment_name: 'Quiz 1',
      assessment_date: '2026-09-01',
      marks_obtained: null,
      max_marks: 100,
      attendance_percentage: 90,
      result_status: 'not_opted',
    };

    expect(calculateRecordPercentage(absentRecord)).toBeNull();
    expect(calculateRecordPercentage(optedOutRecord)).toBeNull();
  });

  it('rejects invalid or zero max marks gracefully', () => {
    const invalidMaxRecord: AssessmentRecord = {
      student_id: 'S1',
      student_name: 'Alex',
      class_name: '10-A',
      subject: 'Math',
      assessment_name: 'Quiz 1',
      assessment_date: '2026-09-01',
      marks_obtained: 10,
      max_marks: 0, // invalid zero max marks
      attendance_percentage: 90,
      result_status: 'graded',
    };

    expect(calculateRecordPercentage(invalidMaxRecord)).toBeNull();
  });

  it('aggregates unique student attendance without duplicating repeated assessment rows', () => {
    // Student Alex appears in 3 assessments, all listing 80% attendance
    // Student Sam appears in 1 assessment with 90% attendance
    const records: AssessmentRecord[] = [
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 80,
        max_marks: 100,
        attendance_percentage: 80,
        result_status: 'graded',
      },
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Physics',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 85,
        max_marks: 100,
        attendance_percentage: 80,
        result_status: 'graded',
      },
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Chemistry',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 75,
        max_marks: 100,
        attendance_percentage: 80,
        result_status: 'graded',
      },
      {
        student_id: 'S2',
        student_name: 'Sam',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 90,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
    ];

    const { average_attendance } = calculateUniqueStudentAttendance(records);
    // Unique students: S1 (80%) and S2 (90%) => mean should be 85%, NOT (80+80+80+90)/4 = 82.5%!
    expect(average_attendance).toBe(85);
  });

  it('does not generate a performance decline warning if only one assessment exists', () => {
    const singleAssessmentRecords: AssessmentRecord[] = [
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Midterm',
        assessment_date: '2026-09-01',
        marks_obtained: 50,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
    ];

    const summaries = calculateStudentSummaries(singleAssessmentRecords, DEFAULT_SETTINGS);
    const alexSummary = summaries['S1'];
    expect(alexSummary.trend_direction).toBe('insufficient_data');
    expect(alexSummary.trend_delta).toBeNull();

    const warnings = evaluateStudentWarnings(alexSummary, singleAssessmentRecords, DEFAULT_SETTINGS);
    const declineWarning = warnings.find((w) => w.category === 'declining_performance');
    expect(declineWarning).toBeUndefined();
  });

  it('detects genuine performance decline with correct earlier and later scores and delta', () => {
    const multiAssessmentRecords: AssessmentRecord[] = [
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Assessment 1',
        assessment_date: '2026-08-01',
        marks_obtained: 85,
        max_marks: 100, // 85%
        attendance_percentage: 90,
        result_status: 'graded',
      },
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Assessment 2',
        assessment_date: '2026-09-01',
        marks_obtained: 60,
        max_marks: 100, // 60% (-25% drop)
        attendance_percentage: 90,
        result_status: 'graded',
      },
    ];

    const summaries = calculateStudentSummaries(multiAssessmentRecords, DEFAULT_SETTINGS);
    const alexSummary = summaries['S1'];
    expect(alexSummary.trend_direction).toBe('declining');
    expect(alexSummary.earlier_score).toBe(85);
    expect(alexSummary.later_score).toBe(60);
    expect(alexSummary.trend_delta).toBe(-25);

    const warnings = evaluateStudentWarnings(alexSummary, multiAssessmentRecords, DEFAULT_SETTINGS);
    const declineWarning = warnings.find((w) => w.category === 'declining_performance');
    expect(declineWarning).toBeDefined();
    expect(declineWarning?.severity).toBe('priority_review');
    expect(declineWarning?.evidence).toContain('85%');
    expect(declineWarning?.evidence).toContain('60%');
  });

  it('filters records by class and updates student totals and metrics accurately', () => {
    const mixedRecords: AssessmentRecord[] = [
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 80,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
      {
        student_id: 'S2',
        student_name: 'Bella',
        class_name: '10-B',
        subject: 'Math',
        assessment_name: 'A1',
        assessment_date: '2026-09-01',
        marks_obtained: 70,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
    ];

    const filtered = filterRecords(mixedRecords, { class_name: '10-A' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].student_name).toBe('Alex');

    const summaries = calculateStudentSummaries(filtered, DEFAULT_SETTINGS);
    const metrics = calculateMetricSummary(filtered, summaries, DEFAULT_SETTINGS);
    expect(metrics.total_unique_students).toBe(1);
    expect(metrics.overall_average_score).toBe(80);
  });

  it('handles empty datasets safely without throwing runtime errors', () => {
    const emptyRecords: AssessmentRecord[] = [];
    const summaries = calculateStudentSummaries(emptyRecords, DEFAULT_SETTINGS);
    const metrics = calculateMetricSummary(emptyRecords, summaries, DEFAULT_SETTINGS);

    expect(metrics.total_unique_students).toBe(0);
    expect(metrics.overall_average_score).toBeNull();
    expect(metrics.pass_rate).toBeNull();
    expect(metrics.average_attendance).toBeNull();
    expect(metrics.students_requiring_review).toBe(0);
  });

  it('counts a student appearing in multiple subjects only once in total unique students', () => {
    const multiSubjectStudentRecords: AssessmentRecord[] = [
      {
        student_id: 'STU-99',
        student_name: 'Jordan',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-01',
        marks_obtained: 85,
        max_marks: 100,
        attendance_percentage: 95,
        result_status: 'graded',
      },
      {
        student_id: 'STU-99', // same student
        student_name: 'Jordan',
        class_name: '10-A',
        subject: 'Physics',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-01',
        marks_obtained: 75,
        max_marks: 100,
        attendance_percentage: 95,
        result_status: 'graded',
      },
      {
        student_id: 'STU-99', // same student
        student_name: 'Jordan',
        class_name: '10-A',
        subject: 'English',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-01',
        marks_obtained: 90,
        max_marks: 100,
        attendance_percentage: 95,
        result_status: 'graded',
      },
    ];

    const summaries = calculateStudentSummaries(multiSubjectStudentRecords, DEFAULT_SETTINGS);
    const metrics = calculateMetricSummary(multiSubjectStudentRecords, summaries, DEFAULT_SETTINGS);

    expect(metrics.total_unique_students).toBe(1);
    expect(metrics.total_assessments).toBe(3);
  });

  it('filtering by subject updates dependent metrics and subject-wise averages consistently', () => {
    const mixedSubjectRecords: AssessmentRecord[] = [
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-01',
        marks_obtained: 90,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
      {
        student_id: 'S1',
        student_name: 'Alex',
        class_name: '10-A',
        subject: 'History',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-01',
        marks_obtained: 50,
        max_marks: 100,
        attendance_percentage: 90,
        result_status: 'graded',
      },
    ];

    const mathOnly = filterRecords(mixedSubjectRecords, { subject: 'Math' });
    expect(mathOnly.length).toBe(1);
    expect(mathOnly[0].subject).toBe('Math');

    const summaries = calculateStudentSummaries(mathOnly, DEFAULT_SETTINGS);
    const metrics = calculateMetricSummary(mathOnly, summaries, DEFAULT_SETTINGS);
    expect(metrics.overall_average_score).toBe(90);
  });
});
