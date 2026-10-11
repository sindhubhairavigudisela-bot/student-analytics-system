/**
 * CSV Template Generator for Institution Uploads
 */

import Papa from 'papaparse';
import { AssessmentRecord } from '../types';

export const CSV_TEMPLATE_HEADERS = [
  'student_id',
  'student_name',
  'class_name',
  'subject',
  'assessment_name',
  'assessment_date',
  'marks_obtained',
  'max_marks',
  'attendance_percentage',
  'result_status',
  'academic_term',
];

export const CSV_TEMPLATE_SAMPLE_ROWS = [
  {
    student_id: 'STU-2001',
    student_name: 'Jordan Miller',
    class_name: 'Grade 10-A',
    subject: 'Mathematics',
    assessment_name: 'Midterm Exam',
    assessment_date: '2026-09-20',
    marks_obtained: '75',
    max_marks: '100',
    attendance_percentage: '88',
    result_status: 'graded',
    academic_term: 'Term 1',
  },
  {
    student_id: 'STU-2002',
    student_name: 'Chloe Bennett',
    class_name: 'Grade 10-A',
    subject: 'Physics',
    assessment_name: 'Midterm Exam',
    assessment_date: '2026-09-22',
    marks_obtained: '82',
    max_marks: '100',
    attendance_percentage: '92',
    result_status: 'graded',
    academic_term: 'Term 1',
  },
  {
    student_id: 'STU-2003',
    student_name: 'Samuel Kim',
    class_name: 'Grade 10-B',
    subject: 'Chemistry',
    assessment_name: 'Unit Test 1',
    assessment_date: '2026-08-16',
    marks_obtained: '',
    max_marks: '25',
    attendance_percentage: '74',
    result_status: 'absent',
    academic_term: 'Term 1',
  },
];

/**
 * Generates and triggers download of the standard CSV template.
 */
export function downloadCsvTemplate(): void {
  const csvContent = Papa.unparse({
    fields: CSV_TEMPLATE_HEADERS,
    data: CSV_TEMPLATE_SAMPLE_ROWS,
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'student_assessment_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads records as formatted CSV.
 */
export function exportRecordsToCsv(records: AssessmentRecord[], filename: string = 'student_records_export.csv'): void {
  const formatted = records.map((r) => ({
    student_id: r.student_id,
    student_name: r.student_name,
    class_name: r.class_name,
    subject: r.subject,
    assessment_name: r.assessment_name,
    assessment_date: r.assessment_date || '',
    marks_obtained: r.marks_obtained !== null ? r.marks_obtained : '',
    max_marks: r.max_marks,
    normalized_percentage: r.marks_obtained !== null && r.max_marks > 0
      ? `${Math.round((r.marks_obtained / r.max_marks) * 1000) / 10}%`
      : 'N/A',
    attendance_percentage: r.attendance_percentage !== null ? `${r.attendance_percentage}%` : 'N/A',
    result_status: r.result_status,
    academic_term: r.academic_term || '',
  }));

  const csv = Papa.unparse(formatted);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
