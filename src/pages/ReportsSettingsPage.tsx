import React, { useState } from 'react';
import {
  FileText,
  SlidersHorizontal,
  Printer,
  Download,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { exportRecordsToCsv } from '../data/templateData';
import { DEFAULT_SETTINGS } from '../analytics/calculations';
import { SystemSettings, AssessmentRecord } from '../types';

export const ReportsSettingsPage: React.FC = () => {
  const {
    metricSummary,
    filteredRecords,
    filters,
    settings,
    updateSettings,
    resetSettings,
    datasetInfo,
  } = useAcademicData();

  const [activeTab, setActiveTab] = useState<'reports' | 'settings'>('reports');
  const [reportType, setReportType] = useState<'overall' | 'at_risk' | 'subjects' | 'ledger'>('overall');

  // Local settings form state
  const [formSettings, setFormSettings] = useState<SystemSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleResetSettings = () => {
    resetSettings();
    setFormSettings(DEFAULT_SETTINGS);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleExportCsv = () => {
    const filename = `report_${reportType}_${filters.class_name}_${new Date().toISOString().split('T')[0]}.csv`;
    exportRecordsToCsv(filteredRecords, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Academic Reports & Printouts</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Academic Threshold Settings</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: REPORTS ===================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur-md print:hidden">
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-semibold text-slate-400">Report Focus:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="overall">Comprehensive Cohort Performance</option>
                <option value="at_risk">Students Requiring Early Intervention</option>
                <option value="subjects">Subject-Wise Analytics Summary</option>
                <option value="ledger">Complete Graded Assessment Ledger</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-400" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Report CSV</span>
              </button>
            </div>
          </div>

          {/* Formatted Report Document View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl print:border-none print:bg-white print:text-black print:p-0">
            {/* Report Header */}
            <div className="border-b border-slate-800 pb-6 print:border-slate-300">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
                    Academic Analytics & Early Intervention Report
                  </h1>
                  <p className="mt-1 text-xs text-slate-400 print:text-slate-600">
                    Generated on: {new Date().toLocaleDateString()} at{' '}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-indigo-950 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-800 print:bg-slate-100 print:text-black print:border-slate-300">
                    {datasetInfo.name}
                  </span>
                </div>
              </div>

              {/* Context & Filters Box */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-950/80 p-3 text-xs border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 print:text-slate-500">
                    Scope Class:
                  </span>
                  <p className="font-medium text-slate-200 print:text-black">{filters.class_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 print:text-slate-500">
                    Scope Subject:
                  </span>
                  <p className="font-medium text-slate-200 print:text-black">{filters.subject}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 print:text-slate-500">
                    Pass Benchmark:
                  </span>
                  <p className="font-medium text-slate-200 print:text-black">{settings.pass_threshold}%</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 print:text-slate-500">
                    Total Records:
                  </span>
                  <p className="font-medium text-slate-200 print:text-black">{filteredRecords.length}</p>
                </div>
              </div>
            </div>

            {/* KPI Summary Block */}
            <div className="py-6 border-b border-slate-800 print:border-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Key Performance Indicators
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800 print:border-slate-200 print:bg-white">
                  <p className="text-[10px] text-slate-400 print:text-slate-500">Unique Students</p>
                  <p className="text-xl font-bold text-white print:text-black">
                    {metricSummary.total_unique_students}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800 print:border-slate-200 print:bg-white">
                  <p className="text-[10px] text-slate-400 print:text-slate-500">Average Percentage</p>
                  <p className="text-xl font-bold text-white print:text-black">
                    {metricSummary.overall_average_score !== null
                      ? `${metricSummary.overall_average_score}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800 print:border-slate-200 print:bg-white">
                  <p className="text-[10px] text-slate-400 print:text-slate-500">Pass Rate</p>
                  <p className="text-xl font-bold text-emerald-400 print:text-emerald-700">
                    {metricSummary.pass_rate !== null ? `${metricSummary.pass_rate}%` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800 print:border-slate-200 print:bg-white">
                  <p className="text-[10px] text-slate-400 print:text-slate-500">Students Flagged</p>
                  <p className="text-xl font-bold text-amber-400 print:text-amber-700">
                    {metricSummary.students_requiring_review}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Report Content Based on Selection */}
            <div className="py-6">
              {reportType === 'overall' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                    Subject Performance Distribution
                  </h3>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 print:border-slate-300 print:text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2">Subject</th>
                        <th className="py-2">Average Score</th>
                        <th className="py-2">Pass Rate</th>
                        <th className="py-2">Students Enrolled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-black">
                      {metricSummary.subject_performances.map((s) => (
                        <tr key={s.subject}>
                          <td className="py-2.5 font-medium">{s.subject}</td>
                          <td className="py-2.5 font-bold">{s.average_percentage}%</td>
                          <td className="py-2.5">{s.pass_rate}%</td>
                          <td className="py-2.5">{s.student_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'at_risk' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 print:text-rose-700">
                    Students Requiring Academic Intervention Roster
                  </h3>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 print:border-slate-300 print:text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2">Student ID</th>
                        <th className="py-2">Name</th>
                        <th className="py-2">Class</th>
                        <th className="py-2">Average Score</th>
                        <th className="py-2">Attendance</th>
                        <th className="py-2">Primary Early Warning Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-black">
                      {metricSummary.students_requiring_review_list.map((s) => (
                        <tr key={s.student_id}>
                          <td className="py-2.5 font-mono">{s.student_id}</td>
                          <td className="py-2.5 font-semibold text-white print:text-black">{s.student_name}</td>
                          <td className="py-2.5">{s.class_name}</td>
                          <td className="py-2.5 font-bold">{s.overall_percentage}%</td>
                          <td className="py-2.5">{s.attendance_percentage ? `${s.attendance_percentage}%` : 'N/A'}</td>
                          <td className="py-2.5 text-slate-400 print:text-slate-700">
                            {s.warnings[0]?.title || 'Performance Check'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'subjects' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                    Subject Metrics Ledger
                  </h3>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 print:border-slate-300 print:text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2">Subject</th>
                        <th className="py-2">Average Percentage</th>
                        <th className="py-2">Pass Rate</th>
                        <th className="py-2">Evaluated Students</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-black">
                      {metricSummary.subject_performances.map((sub) => (
                        <tr key={sub.subject}>
                          <td className="py-2.5 font-semibold text-white print:text-black">{sub.subject}</td>
                          <td className="py-2.5 font-bold">{sub.average_percentage}%</td>
                          <td className="py-2.5">{sub.pass_rate}%</td>
                          <td className="py-2.5">{sub.student_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'ledger' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                    Assessment Submissions Ledger (First 25 displayed)
                  </h3>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 print:border-slate-300 print:text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2">ID</th>
                        <th className="py-2">Student</th>
                        <th className="py-2">Class</th>
                        <th className="py-2">Subject</th>
                        <th className="py-2">Assessment</th>
                        <th className="py-2">Score</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-black">
                      {filteredRecords.slice(0, 25).map((r: AssessmentRecord, i: number) => (
                        <tr key={i}>
                          <td className="py-2 font-mono text-[11px]">{r.student_id}</td>
                          <td className="py-2 font-medium">{r.student_name}</td>
                          <td className="py-2">{r.class_name}</td>
                          <td className="py-2">{r.subject}</td>
                          <td className="py-2">{r.assessment_name}</td>
                          <td className="py-2 font-bold">
                            {r.marks_obtained !== null ? `${r.marks_obtained}/${r.max_marks}` : 'N/A'}
                          </td>
                          <td className="py-2">{r.result_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Report Footer & Disclaimer */}
            <div className="mt-8 border-t border-slate-800/80 pt-4 text-[10px] text-slate-400 print:border-slate-300 print:text-slate-600">
              <p>
                <strong>Methodological Statement:</strong> This report is compiled using empirical,
                deterministic calculation rules to support teacher decision-making. No student is
                automatically categorized as incapable, and academic interventions are pedagogical
                guidance prompts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
            <div>
              <h3 className="text-sm font-bold text-white">Configurable Academic Benchmarks</h3>
              <p className="mt-1 text-xs text-slate-400">
                Updating these institutional thresholds dynamically recalibrates pass rates, score bins, and
                early warning triggers across the entire platform.
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="mt-4 rounded-lg bg-emerald-950/70 border border-emerald-800 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Threshold parameters successfully updated and saved to local state!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
                {/* 1. Pass Threshold */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Passing Threshold (%)</label>
                    <span className="font-mono text-indigo-400 font-bold">{formSettings.pass_threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="65"
                    step="1"
                    value={formSettings.pass_threshold}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, pass_threshold: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Minimum percentage required for a graded result to be counted as passing. Affects
                    cohort pass rate and triggers Priority Review alerts.
                  </p>
                </div>

                {/* 2. Low Performance Warning Threshold */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Low Performance Warning (%)</label>
                    <span className="font-mono text-amber-400 font-bold">{formSettings.low_performance_threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="75"
                    step="1"
                    value={formSettings.low_performance_threshold}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, low_performance_threshold: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Proactive review boundary. Students scoring between passing and this threshold trigger
                    a "Needs Review" performance warning.
                  </p>
                </div>

                {/* 3. Performance Decline Delta */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Significant Decline Delta (&Delta; %)</label>
                    <span className="font-mono text-rose-400 font-bold">-{formSettings.decline_threshold_delta}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={formSettings.decline_threshold_delta}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, decline_threshold_delta: Number(e.target.value) })
                    }
                    className="w-full accent-rose-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Percentage point decrease required between sequential assessments to trigger a
                    declining trajectory warning. Requires &gt;= 2 assessments.
                  </p>
                </div>

                {/* 4. Subject Learning Gap Threshold */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Subject Learning Gap (&Delta; %)</label>
                    <span className="font-mono text-indigo-400 font-bold">{formSettings.subject_gap_threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={formSettings.subject_gap_threshold}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, subject_gap_threshold: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Margin by which an individual subject score falls below the student's own general
                    academic standing to trigger an isolated concept gap warning.
                  </p>
                </div>

                {/* 5. Attendance Warning Threshold */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Attendance Warning Threshold (%)</label>
                    <span className="font-mono text-amber-400 font-bold">{formSettings.attendance_warning_threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="1"
                    value={formSettings.attendance_warning_threshold}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, attendance_warning_threshold: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Presence rate below which students are flagged for attendance follow-up.
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Save & Apply Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
