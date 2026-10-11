/**
 * Schema and Column Detection Utilities
 */

export interface ColumnMapping {
  student_id: string;
  student_name: string;
  class_name: string;
  subject: string;
  assessment_name: string;
  assessment_date: string;
  marks_obtained: string;
  max_marks: string;
  attendance_percentage: string;
  result_status: string;
}

// Synonyms dictionary for intelligent fuzzy column auto-detection
export const COLUMN_SYNONYMS: Record<keyof ColumnMapping, string[]> = {
  student_id: ['student_id', 'studentid', 'roll_no', 'roll_number', 'rollno', 'id', 'student_code', 'adm_no', 'admission_no'],
  student_name: ['student_name', 'studentname', 'name', 'full_name', 'student', 'candidate_name'],
  class_name: ['class_name', 'classname', 'class', 'grade', 'section', 'batch', 'cohort', 'standard'],
  subject: ['subject', 'course', 'subject_name', 'discipline', 'subject_code'],
  assessment_name: ['assessment_name', 'assessment', 'exam', 'test_name', 'exam_name', 'test', 'assignment', 'evaluation'],
  assessment_date: ['assessment_date', 'date', 'exam_date', 'test_date', 'submitted_at', 'timestamp'],
  marks_obtained: ['marks_obtained', 'marksobtained', 'marks', 'score', 'score_obtained', 'points', 'achieved_marks'],
  max_marks: ['max_marks', 'maxmarks', 'maximum_marks', 'total_marks', 'out_of', 'max_score'],
  attendance_percentage: ['attendance_percentage', 'attendance', 'attendance_pct', 'attendance_rate', 'present_pct'],
  result_status: ['result_status', 'status', 'submission_status', 'grading_status'],
};

/**
 * Automatically detects the best matching column from raw headers.
 */
export function autoDetectColumnMappings(headers: string[]): ColumnMapping {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    clean: h.toLowerCase().trim().replace(/[\s\-_]+/g, '_'),
  }));

  const mapping: ColumnMapping = {
    student_id: '',
    student_name: '',
    class_name: '',
    subject: '',
    assessment_name: '',
    assessment_date: '',
    marks_obtained: '',
    max_marks: '',
    attendance_percentage: '',
    result_status: '',
  };

  (Object.keys(COLUMN_SYNONYMS) as Array<keyof ColumnMapping>).forEach((field) => {
    const synonyms = COLUMN_SYNONYMS[field];
    // Exact match or contains match
    for (const syn of synonyms) {
      const match = normalizedHeaders.find((h) => h.clean === syn || h.clean.includes(syn));
      if (match) {
        mapping[field] = match.original;
        break;
      }
    }
  });

  return mapping;
}
