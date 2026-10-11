import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  Trash2,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { parseFile, validateAndTransformRows } from '../validation/importer';
import { ColumnMapping, autoDetectColumnMappings } from '../validation/schema';
import { ValidationSummary, AssessmentRecord } from '../types';
import { downloadCsvTemplate } from '../data/templateData';
import { Modal } from '../components/common/Modal';

export const DataManagementPage: React.FC = () => {
  const {
    records,
    datasetInfo,
    importDataset,
    loadSampleDataset,
    clearDataset,
  } = useAcademicData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
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
  });

  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // File selection & parsing
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setValidationSummary(null);
    setImportSuccessMessage(null);

    try {
      const { headers, rows } = await parseFile(file);
      setRawHeaders(headers);
      setRawRows(rows);

      // Auto detect mappings
      const detected = autoDetectColumnMappings(headers);
      setColumnMapping(detected);

      // Run initial validation with detected mapping
      const summary = validateAndTransformRows(rows, detected, file.name);
      setValidationSummary(summary);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error reading file.');
    } finally {
      setIsParsing(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Re-run validation whenever mapping changes
  const handleMappingChange = (field: keyof ColumnMapping, column: string) => {
    const updated = { ...columnMapping, [field]: column };
    setColumnMapping(updated);
    if (rawRows.length > 0 && selectedFile) {
      const summary = validateAndTransformRows(rawRows, updated, selectedFile.name);
      setValidationSummary(summary);
    }
  };

  // Perform Final Import
  const handleExecuteImport = () => {
    if (!validationSummary || validationSummary.valid_records.length === 0) return;

    importDataset(
      validationSummary.valid_records,
      importMode,
      selectedFile?.name || 'Uploaded Dataset'
    );

    setShowConfirmModal(false);
    setImportSuccessMessage(
      `Successfully ${importMode === 'replace' ? 'loaded' : 'appended'} ${
        validationSummary.valid_records.length
      } valid records into the active analytics engine!`
    );

    // Reset staging
    setSelectedFile(null);
    setValidationSummary(null);
    setRawRows([]);
    setRawHeaders([]);
  };

  return (
    <div className="space-y-6">
      {/* Active Dataset Status Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Active Cohort Dataset</h3>
            {datasetInfo.isSample ? (
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-300 font-semibold border border-indigo-800">
                Fictional Cohort Active
              </span>
            ) : (
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs text-emerald-300 font-semibold border border-emerald-800">
                Custom Dataset Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Source: <strong className="text-slate-200">{datasetInfo.name}</strong> •{' '}
            <strong className="text-indigo-400">{records.length}</strong> total records on ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={loadSampleDataset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-900/60 bg-indigo-950/60 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-900 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Load Fictional Demo</span>
          </button>

          {records.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all active records?')) {
                  clearDataset();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Data</span>
            </button>
          )}
        </div>
      </div>

      {importSuccessMessage && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/60 p-4 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{importSuccessMessage}</span>
          </div>
          <button
            onClick={() => setImportSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Upload Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-8 text-center transition-colors hover:border-indigo-500/80 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h4 className="mt-4 text-sm font-bold text-white">
          Drop your Academic Assessment Spreadsheet here
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          Supports <strong className="text-slate-300">.CSV</strong>,{' '}
          <strong className="text-slate-300">.XLSX</strong>, or{' '}
          <strong className="text-slate-300">.XLS</strong> spreadsheets
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Browse File</span>
        </button>
      </div>

      {/* Validation & Preview Section if File Selected */}
      {validationSummary && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Rows</p>
              <p className="mt-1 text-2xl font-bold text-white">{validationSummary.total_rows}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">In file</p>
            </div>

            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Valid Records</p>
              <p className="mt-1 text-2xl font-bold text-emerald-200">{validationSummary.valid_rows}</p>
              <p className="mt-0.5 text-[10px] text-emerald-400">Ready to import</p>
            </div>

            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">Invalid Rows</p>
              <p className="mt-1 text-2xl font-bold text-rose-200">{validationSummary.invalid_rows}</p>
              <p className="mt-0.5 text-[10px] text-rose-400">Contains validation errors</p>
            </div>

            <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Duplicates Detected</p>
              <p className="mt-1 text-2xl font-bold text-amber-200">{validationSummary.duplicate_rows}</p>
              <p className="mt-0.5 text-[10px] text-amber-400">Student + Subject + Test</p>
            </div>
          </div>

          {/* Column Mapping Interface */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">Column Schema Mapping</h4>
                <p className="text-xs text-slate-400">
                  Ensure uploaded columns match the expected academic fields
                </p>
              </div>
              <span className="text-xs text-indigo-400">Auto-detected from file headers</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {(
                [
                  { field: 'student_id', label: 'Student ID *', required: true },
                  { field: 'student_name', label: 'Student Name *', required: true },
                  { field: 'class_name', label: 'Class / Cohort', required: false },
                  { field: 'subject', label: 'Subject *', required: true },
                  { field: 'assessment_name', label: 'Assessment Name *', required: true },
                  { field: 'assessment_date', label: 'Assessment Date', required: false },
                  { field: 'marks_obtained', label: 'Marks Obtained', required: false },
                  { field: 'max_marks', label: 'Maximum Marks', required: false },
                  { field: 'attendance_percentage', label: 'Attendance %', required: false },
                  { field: 'result_status', label: 'Status (Graded/Absent)', required: false },
                ] as Array<{ field: keyof ColumnMapping; label: string; required: boolean }>
              ).map(({ field, label, required }) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {label} {required && <span className="text-rose-400">*</span>}
                  </label>
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="h-8 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Unmapped --</option>
                    {rawHeaders.map((hdr) => (
                      <option key={hdr} value={hdr}>
                        {hdr}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Row-Level Errors Inspector (if errors exist) */}
          {validationSummary.errors.length > 0 && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-5 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-900/40">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h4 className="text-sm font-semibold text-rose-200">
                  Validation Error Details ({validationSummary.errors.length} issues)
                </h4>
              </div>
              <div className="max-h-48 overflow-y-auto pt-2">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase">
                      <th className="py-1 px-2">Row #</th>
                      <th className="py-1 px-2">Field</th>
                      <th className="py-1 px-2">Problem Description</th>
                      <th className="py-1 px-2">Raw Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-900/30">
                    {validationSummary.errors.slice(0, 50).map((err, idx) => (
                      <tr key={idx} className="hover:bg-rose-950/30">
                        <td className="py-1.5 px-2 font-mono text-rose-300">{err.row}</td>
                        <td className="py-1.5 px-2 font-medium text-slate-200">{err.field}</td>
                        <td className="py-1.5 px-2 text-rose-300">{err.message}</td>
                        <td className="py-1.5 px-2 font-mono text-[11px] text-slate-400">
                          {String(err.raw_value ?? 'empty')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valid Record Preview Table */}
          {validationSummary.valid_records.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Previewing Validated Records (First 5 shown)
                  </h4>
                </div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm & Import {validationSummary.valid_rows} Records</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">Student ID</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {validationSummary.valid_records.slice(0, 5).map((r: AssessmentRecord, i: number) => (
                      <tr key={i}>
                        <td className="px-5 py-3 font-mono text-indigo-300">{r.student_id}</td>
                        <td className="px-4 py-3 font-semibold text-white">{r.student_name}</td>
                        <td className="px-4 py-3 text-slate-300">{r.class_name}</td>
                        <td className="px-4 py-3 text-slate-300">{r.subject}</td>
                        <td className="px-4 py-3 text-slate-300">{r.assessment_name}</td>
                        <td className="px-4 py-3 font-bold text-slate-200">
                          {r.marks_obtained !== null ? `${r.marks_obtained}/${r.max_marks}` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {r.attendance_percentage !== null ? `${r.attendance_percentage}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">{r.result_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Dataset Import"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            You are about to load{' '}
            <strong className="text-white">{validationSummary?.valid_rows}</strong> valid assessment
            records into the analytics engine.
          </p>

          <div className="space-y-2 rounded-xl bg-slate-950 p-4 border border-slate-800">
            <p className="font-semibold text-slate-200">Choose Import Mode:</p>
            <label className="flex items-start gap-2.5 cursor-pointer text-slate-300">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="mt-0.5"
              />
              <div>
                <strong className="text-white">Replace Active Dataset</strong>
                <p className="text-[11px] text-slate-400">
                  Clears the existing records and replaces them with this newly imported file.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 pt-2 border-t border-slate-800/80">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="mt-0.5"
              />
              <div>
                <strong className="text-white">Append to Active Dataset</strong>
                <p className="text-[11px] text-slate-400">
                  Adds these records alongside existing records without deleting earlier data.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteImport}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md"
            >
              Confirm & Execute Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
