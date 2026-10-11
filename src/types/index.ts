/**
 * Student Performance Analytics & Early Intervention System
 * Core Data Models and Type Definitions
 */

export type ResultStatus = 'graded' | 'absent' | 'missing' | 'not_submitted' | 'not_opted';

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export type WarningCategory = 
  | 'low_performance' 
  | 'declining_performance' 
  | 'subject_gap' 
  | 'attendance_review' 
  | 'insufficient_data';

export type WarningSeverity = 'informational' | 'needs_review' | 'priority_review';

/**
 * Long-format assessment record.
 * Each record represents one student's result for one subject and one assessment.
 */
export interface AssessmentRecord {
  id?: string;
  student_id: string;
  student_name: string;
  class_name: string;
  subject: string;
  assessment_name: string;
  assessment_date: string | null; // ISO YYYY-MM-DD
  marks_obtained: number | null;
  max_marks: number;
  attendance_percentage: number | null; // 0 - 100
  result_status: ResultStatus;
  academic_term?: string;
  topic?: string;
  source_file?: string;
  imported_at?: string;
}

/**
 * Aggregated summary for an individual student.
 */
export interface StudentSummary {
  student_id: string;
  student_name: string;
  class_name: string;
  overall_percentage: number | null;
  attendance_percentage: number | null;
  total_assessments: number;
  graded_assessments: number;
  subject_averages: Record<string, {
    subject: string;
    avg_percentage: number;
    count: number;
    total_obtained: number;
    total_max: number;
  }>;
  trend_direction: TrendDirection;
  trend_delta: number | null; // earlier score vs later score percentage point delta
  earlier_score: number | null;
  later_score: number | null;
  assessments_evaluated_count: number;
  warnings: WarningItem[];
}

/**
 * Early Warning & Evidence object.
 * Fully transparent, rule-based, explainable.
 */
export interface WarningItem {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  category: WarningCategory;
  severity: WarningSeverity;
  title: string;
  observation: string;
  evidence: string;
  rule_description: string;
  threshold_used: number | string;
  observed_value: number | string;
  suggested_action: string;
  subject?: string;
  assessment_name?: string;
  is_reviewed: boolean;
  reviewed_at?: string;
}

/**
 * Actionable, pedagogical intervention recommendation.
 */
export interface InterventionRecommendation {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  type: 'academic_support' | 'pedagogical_review' | 'attendance_outreach' | 'data_verification';
  urgency: 'high' | 'medium' | 'low';
  summary: string;
  recommended_actions: string[];
  evidence_basis: string;
  caveat: string;
}

/**
 * Shared filter state across dashboard and views.
 */
export interface FilterState {
  class_name: string; // 'ALL' or specific
  subject: string; // 'ALL' or specific
  assessment_name: string; // 'ALL' or specific
  academic_term: string; // 'ALL' or specific
  search_query: string;
}

/**
 * Configurable system settings and academic thresholds.
 */
export interface SystemSettings {
  pass_threshold: number; // default: 40%
  low_performance_threshold: number; // default: 50%
  decline_threshold_delta: number; // default: 10% delta
  subject_gap_threshold: number; // default: 15% delta from student's own average
  attendance_warning_threshold: number; // default: 75%
  score_bins: ScoreBin[];
}

export interface ScoreBin {
  label: string;
  min: number;
  max: number;
  color: string;
}

/**
 * Calculated Dashboard KPIs and aggregated chart data.
 */
export interface MetricSummary {
  total_unique_students: number;
  overall_average_score: number | null;
  pass_rate: number | null;
  average_attendance: number | null;
  total_assessments: number;
  valid_graded_results: number;
  students_requiring_review: number;
  
  subject_performances: Array<{
    subject: string;
    average_percentage: number;
    student_count: number;
    pass_rate: number;
  }>;
  
  time_series: Array<{
    period: string;
    date: string;
    average_percentage: number;
    count: number;
  }>;
  
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  
  attendance_vs_score: Array<{
    student_id: string;
    student_name: string;
    score: number;
    attendance: number;
    class_name: string;
  }>;
  
  students_requiring_review_list: Array<{
    student_id: string;
    student_name: string;
    class_name: string;
    overall_percentage: number | null;
    attendance_percentage: number | null;
    trend_direction: TrendDirection;
    trend_delta: number | null;
    warnings: WarningItem[];
  }>;
}

/**
 * File import & validation structures.
 */
export interface ValidationError {
  row: number;
  field: string;
  message: string;
  raw_value: unknown;
}

export interface ValidationSummary {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  errors: ValidationError[];
  valid_records: AssessmentRecord[];
  detected_columns: string[];
}

export type PageId = 
  | 'overview' 
  | 'students' 
  | 'profile' 
  | 'insights' 
  | 'data-management' 
  | 'reports-settings';
