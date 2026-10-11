/**
 * Automated Tests for File Validation & Duplicate Detection Engine
 */

import { describe, it, expect } from 'vitest';
import { validateAndTransformRows } from './importer';
import { ColumnMapping } from './schema';

describe('Data Import & Validation Engine', () => {
  const defaultMapping: ColumnMapping = {
    student_id: 'student_id',
    student_name: 'student_name',
    class_name: 'class_name',
    subject: 'subject',
    assessment_name: 'assessment_name',
    assessment_date: 'assessment_date',
    marks_obtained: 'marks_obtained',
    max_marks: 'max_marks',
    attendance_percentage: 'attendance_percentage',
    result_status: 'result_status',
  };

  it('validates and accepts correctly formatted rows', () => {
    const rawRows = [
      {
        student_id: 'STU-001',
        student_name: 'John Doe',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-10',
        marks_obtained: '85',
        max_marks: '100',
        attendance_percentage: '90',
        result_status: 'graded',
      },
    ];

    const result = validateAndTransformRows(rawRows, defaultMapping, 'test.csv');
    expect(result.valid_rows).toBe(1);
    expect(result.invalid_rows).toBe(0);
    expect(result.errors.length).toBe(0);
    expect(result.valid_records[0].marks_obtained).toBe(85);
  });

  it('rejects rows with marks exceeding maximum marks with clear error description', () => {
    const rawRows = [
      {
        student_id: 'STU-002',
        student_name: 'Jane Smith',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-10',
        marks_obtained: '110', // Exceeds max 100
        max_marks: '100',
        attendance_percentage: '90',
        result_status: 'graded',
      },
    ];

    const result = validateAndTransformRows(rawRows, defaultMapping, 'test.csv');
    expect(result.valid_rows).toBe(0);
    expect(result.invalid_rows).toBe(1);
    expect(result.errors.some((e) => e.message.includes('exceeds Max Marks'))).toBe(true);
  });

  it('rejects rows with negative marks or negative/zero max marks', () => {
    const rawRows = [
      {
        student_id: 'STU-003',
        student_name: 'Bob',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-10',
        marks_obtained: '-5',
        max_marks: '100',
        attendance_percentage: '90',
        result_status: 'graded',
      },
      {
        student_id: 'STU-004',
        student_name: 'Alice',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        assessment_date: '2026-09-10',
        marks_obtained: '20',
        max_marks: '0', // Invalid zero max marks
        attendance_percentage: '90',
        result_status: 'graded',
      },
    ];

    const result = validateAndTransformRows(rawRows, defaultMapping, 'test.csv');
    expect(result.valid_rows).toBe(0);
    expect(result.invalid_rows).toBe(2);
    expect(result.errors.some((e) => e.message.includes('cannot be negative'))).toBe(true);
    expect(result.errors.some((e) => e.message.includes('strictly positive number'))).toBe(true);
  });

  it('detects duplicate assessment records for the same student, subject, and assessment', () => {
    const rawRows = [
      {
        student_id: 'STU-005',
        student_name: 'David',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        marks_obtained: '40',
        max_marks: '50',
      },
      {
        student_id: 'STU-005', // Duplicate!
        student_name: 'David',
        class_name: '10-A',
        subject: 'Math',
        assessment_name: 'Quiz 1',
        marks_obtained: '45',
        max_marks: '50',
      },
    ];

    const result = validateAndTransformRows(rawRows, defaultMapping, 'test.csv');
    expect(result.duplicate_rows).toBe(1);
    expect(result.errors.some((e) => e.field === 'duplicate_record')).toBe(true);
  });
});
