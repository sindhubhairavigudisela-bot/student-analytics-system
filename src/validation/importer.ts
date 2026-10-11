/**
 * Robust CSV & Excel Importer and Row-Level Validation Engine
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AssessmentRecord, ResultStatus, ValidationError, ValidationSummary } from '../types';
import { ColumnMapping, autoDetectColumnMappings } from './schema';

/**
 * Parses raw file content (CSV or XLSX) into raw object rows.
 */
export async function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, unknown>[];
          resolve({ headers, rows });
        },
        error: (err) => reject(new Error(`CSV Parse Error: ${err.message}`)),
      });
    });
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            reject(new Error('Excel file has no worksheets.'));
            return;
          }
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null });
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          resolve({ headers, rows });
        } catch (err: unknown) {
          reject(new Error(`Excel Parse Error: ${err instanceof Error ? err.message : String(err)}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error(`Unsupported file format .${extension}. Please provide a .csv, .xlsx, or .xls file.`);
}

/**
 * Validates and transforms raw rows based on selected column mappings.
 */
export function validateAndTransformRows(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  fileName: string = 'imported-file'
): ValidationSummary {
  const errors: ValidationError[] = [];
  const validRecords: AssessmentRecord[] = [];
  const seenRecordKeys = new Set<string>();
  let duplicateCount = 0;

  if (rows.length === 0) {
    return {
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
      duplicate_rows: 0,
      errors: [
        {
          row: 0,
          field: 'file',
          message: 'The uploaded file contains no data rows.',
          raw_value: null,
        },
      ],
      valid_records: [],
      detected_columns: [],
    };
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    let rowHasError = false;

    // Helper for extracting value
    const getVal = (col: string): unknown => (col ? row[col] : undefined);
    const getString = (col: string): string => {
      const val = getVal(col);
      if (val === undefined || val === null) return '';
      return String(val).trim();
    };

    // 1. Validate Student ID
    const studentId = getString(mapping.student_id);
    if (!studentId) {
      errors.push({
        row: rowNumber,
        field: 'student_id',
        message: 'Student ID is missing or empty.',
        raw_value: getVal(mapping.student_id),
      });
      rowHasError = true;
    }

    // 2. Validate Student Name
    const studentName = getString(mapping.student_name);
    if (!studentName) {
      errors.push({
        row: rowNumber,
        field: 'student_name',
        message: 'Student Name is missing or empty.',
        raw_value: getVal(mapping.student_name),
      });
      rowHasError = true;
    }

    // 3. Validate Class Name
    const className = getString(mapping.class_name) || 'Class General';

    // 4. Validate Subject
    const subject = getString(mapping.subject);
    if (!subject) {
      errors.push({
        row: rowNumber,
        field: 'subject',
        message: 'Subject is missing or empty.',
        raw_value: getVal(mapping.subject),
      });
      rowHasError = true;
    }

    // 5. Validate Assessment Name
    const assessmentName = getString(mapping.assessment_name);
    if (!assessmentName) {
      errors.push({
        row: rowNumber,
        field: 'assessment_name',
        message: 'Assessment Name is missing or empty.',
        raw_value: getVal(mapping.assessment_name),
      });
      rowHasError = true;
    }

    // 6. Validate Max Marks
    const rawMaxMarks = getVal(mapping.max_marks);
    let maxMarks = 100; // sensible default if not provided
    if (mapping.max_marks && rawMaxMarks !== undefined && rawMaxMarks !== null && String(rawMaxMarks).trim() !== '') {
      const parsedMax = Number(rawMaxMarks);
      if (isNaN(parsedMax) || parsedMax <= 0) {
        errors.push({
          row: rowNumber,
          field: 'max_marks',
          message: `Max Marks must be a strictly positive number (received: "${rawMaxMarks}").`,
          raw_value: rawMaxMarks,
        });
        rowHasError = true;
      } else {
        maxMarks = parsedMax;
      }
    }

    // 7. Validate Status & Marks Obtained
    const rawStatus = getString(mapping.result_status).toLowerCase();
    let resultStatus: ResultStatus = 'graded';

    if (rawStatus.includes('absent')) {
      resultStatus = 'absent';
    } else if (rawStatus.includes('opt') || rawStatus.includes('exempt')) {
      resultStatus = 'not_opted';
    } else if (rawStatus.includes('not_sub') || rawStatus.includes('unsub')) {
      resultStatus = 'not_submitted';
    } else if (rawStatus.includes('miss')) {
      resultStatus = 'missing';
    }

    const rawMarks = getVal(mapping.marks_obtained);
    let marksObtained: number | null = null;

    if (rawMarks !== undefined && rawMarks !== null && String(rawMarks).trim() !== '') {
      const parsedMarks = Number(rawMarks);
      if (isNaN(parsedMarks)) {
        errors.push({
          row: rowNumber,
          field: 'marks_obtained',
          message: `Marks Obtained must be numeric or empty (received: "${rawMarks}").`,
          raw_value: rawMarks,
        });
        rowHasError = true;
      } else if (parsedMarks < 0) {
        errors.push({
          row: rowNumber,
          field: 'marks_obtained',
          message: `Marks Obtained cannot be negative (received: ${parsedMarks}).`,
          raw_value: rawMarks,
        });
        rowHasError = true;
      } else if (parsedMarks > maxMarks) {
        errors.push({
          row: rowNumber,
          field: 'marks_obtained',
          message: `Marks Obtained (${parsedMarks}) exceeds Max Marks (${maxMarks}).`,
          raw_value: rawMarks,
        });
        rowHasError = true;
      } else {
        marksObtained = parsedMarks;
      }
    } else {
      // Mark is empty or blank
      if (resultStatus === 'graded') {
        resultStatus = 'missing';
      }
    }

    // 8. Validate Attendance Percentage (if provided)
    let attendancePercentage: number | null = null;
    const rawAtt = getVal(mapping.attendance_percentage);
    if (mapping.attendance_percentage && rawAtt !== undefined && rawAtt !== null && String(rawAtt).trim() !== '') {
      const parsedAtt = Number(rawAtt);
      if (isNaN(parsedAtt) || parsedAtt < 0 || parsedAtt > 100) {
        errors.push({
          row: rowNumber,
          field: 'attendance_percentage',
          message: `Attendance percentage must be between 0 and 100 (received: "${rawAtt}").`,
          raw_value: rawAtt,
        });
        rowHasError = true;
      } else {
        attendancePercentage = Math.round(parsedAtt * 10) / 10;
      }
    }

    // 9. Assessment Date (optional ISO check)
    let assessmentDate: string | null = null;
    const rawDate = getString(mapping.assessment_date);
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push({
          row: rowNumber,
          field: 'assessment_date',
          message: `Invalid date format (received: "${rawDate}"). Please use YYYY-MM-DD.`,
          raw_value: rawDate,
        });
        rowHasError = true;
      } else {
        assessmentDate = parsedDate.toISOString().split('T')[0];
      }
    }

    // 10. Duplicate Detection (student_id + subject + assessment_name)
    const recordKey = `${studentId}|${subject.toLowerCase()}|${assessmentName.toLowerCase()}`;
    if (seenRecordKeys.has(recordKey)) {
      duplicateCount += 1;
      errors.push({
        row: rowNumber,
        field: 'duplicate_record',
        message: `Duplicate assessment entry detected for student ${studentId} in ${subject} (${assessmentName}).`,
        raw_value: recordKey,
      });
      rowHasError = true;
    } else {
      seenRecordKeys.add(recordKey);
    }

    // If completely valid, push to valid records
    if (!rowHasError) {
      validRecords.push({
        id: `rec-${studentId}-${subject}-${assessmentName}-${index}`,
        student_id: studentId,
        student_name: studentName,
        class_name: className,
        subject,
        assessment_name: assessmentName,
        assessment_date: assessmentDate,
        marks_obtained: marksObtained,
        max_marks: maxMarks,
        attendance_percentage: attendancePercentage,
        result_status: resultStatus,
        source_file: fileName,
        imported_at: new Date().toISOString(),
      });
    }
  });

  const validRows = validRecords.length;
  const invalidRows = rows.length - validRows;

  return {
    total_rows: rows.length,
    valid_rows: validRows,
    invalid_rows: invalidRows,
    duplicate_rows: duplicateCount,
    errors,
    valid_records: validRecords,
    detected_columns: Object.keys(rows[0] || {}),
  };
}

export { autoDetectColumnMappings };
