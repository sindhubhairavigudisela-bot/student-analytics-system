import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { calculateRecordPercentage } from '../analytics/calculations';
import { generateStudentInterventions } from '../analytics/interventions';
import { StudentSummary, AssessmentRecord } from '../types';
import { TrendBadge, SeverityBadge, ResultStatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const StudentProfilePage: React.FC = () => {
  const {
    selectedStudentId,
    selectStudent,
    allStudentSummaries,
    records,
    settings,
    setCurrentPage,
    toggleReviewWarning,
  } = useAcademicData();

  // If no student is explicitly selected, default to the first student
  const activeStudentId = selectedStudentId || Object.keys(allStudentSummaries)[0];
  const summary: StudentSummary | null = activeStudentId ? allStudentSummaries[activeStudentId] : null;

  // Underlying records for this student
  const studentRecords = useMemo(() => {
    if (!activeStudentId) return [];
    return records
      .filter((r: AssessmentRecord) => r.student_id === activeStudentId)
      .sort((a: AssessmentRecord, b: AssessmentRecord) => {
        const dateA = a.assessment_date ? new Date(a.assessment_date).getTime() : 0;
        const dateB = b.assessment_date ? new Date(b.assessment_date).getTime() : 0;
        return dateA - dateB;
      });
  }, [records, activeStudentId]);

  // Trend data points for this student
  const studentTrendData = useMemo(() => {
    if (!studentRecords.length) return [];
    const valid = studentRecords
      .map((r: AssessmentRecord) => ({
        name: `${r.assessment_name} (${r.subject})`,
        period: r.assessment_name,
        subject: r.subject,
        date: r.assessment_date,
        score: calculateRecordPercentage(r),
      }))
      .filter((r) => r.score !== null);
    return valid;
  }, [studentRecords]);

  // Interventions for this student
  const interventions = useMemo(() => {
    if (!summary) return [];
    return generateStudentInterventions(summary, settings);
  }, [summary, settings]);

  if (!summary) {
    return (
      <EmptyState
        title="No Student Selected"
        description="Select a student from the Student Directory to view their academic profile."
        actionText="Go to Directory"
        onAction={() => setCurrentPage('students')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Selector Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <button
          onClick={() => setCurrentPage('students')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Student Directory</span>
        </button>

        {/* Quick Switch Student Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Switch Student:</label>
          <select
            value={activeStudentId}
            onChange={(e) => selectStudent(e.target.value)}
            className="h-8 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
          >
            {Object.values(allStudentSummaries).map((s: StudentSummary) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name} ({s.student_id} - {s.class_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Profile Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-2xl font-bold shadow-lg shadow-indigo-600/20">
              {summary.student_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-white tracking-tight">{summary.student_name}</h2>
                <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                  {summary.class_name}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 font-mono">
                Student ID: <span className="text-slate-300">{summary.student_id}</span> • Cohort 2026-2027
              </p>
            </div>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Overall Score */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Overall Score</p>
              <p className="mt-1 text-xl font-bold text-white">
                {summary.overall_percentage !== null ? `${summary.overall_percentage}%` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">{summary.graded_assessments} graded</p>
            </div>

            {/* Attendance */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Attendance</p>
              <p className="mt-1 text-xl font-bold text-white">
                {summary.attendance_percentage !== null ? `${summary.attendance_percentage}%` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">Presence Rate</p>
            </div>

            {/* Trajectory */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Trajectory</p>
              <div className="mt-1">
                <TrendBadge direction={summary.trend_direction} delta={summary.trend_delta} />
              </div>
              <p className="text-[10px] text-slate-400">Chronological</p>
            </div>

            {/* Review Status */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Alerts</p>
              <p className="mt-1 text-xl font-bold text-indigo-300">
                {summary.warnings.length}
              </p>
              <p className="text-[10px] text-slate-400">Triggers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Trend Chart & Subject Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Trajectory Line Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Academic Score Trajectory</h3>
              <p className="text-xs text-slate-400">Sequential graded assessment progression</p>
            </div>
          </div>

          {studentTrendData.length >= 2 ? (
            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
                            <p className="font-semibold text-white">{d.name}</p>
                            <p className="text-[10px] text-slate-400">Date: {d.date || 'Undated'}</p>
                            <p className="mt-1 text-indigo-300">
                              Score: <strong className="text-white">{d.score}%</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              At least 2 sequential graded assessments are required to calculate trend slope.
            </div>
          )}
        </div>

        {/* Subject-Level Performance Cards */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Subject-Level Averages</h3>
              <p className="text-xs text-slate-400">Student standing relative to passing mark</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(summary.subject_averages).length === 0 ? (
              <p className="text-xs text-slate-400">No subject assessments recorded for this student.</p>
            ) : (
              Object.entries(summary.subject_averages).map(([subject, data]) => {
                const isBelowPass = data.avg_percentage < settings.pass_threshold;
                const isLow = data.avg_percentage < settings.low_performance_threshold;

                return (
                  <div
                    key={subject}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{subject}</span>
                      <span
                        className={`font-bold ${
                          isBelowPass ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-indigo-300'
                        }`}
                      >
                        {data.avg_percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isBelowPass ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(data.avg_percentage, 100)}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Evaluated over {data.count} assessment(s)</span>
                      <span>
                        {data.total_obtained} / {data.total_max} marks
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Warnings & Evidence Explanations */}
      {summary.warnings.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Active Early Warnings & Empirical Evidence</h3>
              <p className="text-xs text-slate-400">Transparent rule execution and observed values</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pt-2 md:grid-cols-2">
            {summary.warnings.map((w) => (
              <div
                key={w.id}
                className={`rounded-xl border p-4 text-xs transition-colors ${
                  w.is_reviewed
                    ? 'border-slate-800 bg-slate-950/40 opacity-70'
                    : 'border-slate-700/80 bg-slate-950/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={w.severity} />
                  <button
                    onClick={() => toggleReviewWarning(w.id)}
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      w.is_reviewed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>{w.is_reviewed ? 'Reviewed' : 'Mark Reviewed'}</span>
                  </button>
                </div>

                <h4 className="mt-2 font-semibold text-white">{w.title}</h4>
                <p className="mt-1 text-slate-300 leading-relaxed">{w.observation}</p>

                <div className="mt-3 rounded-lg bg-slate-900/90 p-2.5 text-[11px] text-slate-400 border border-slate-800/80">
                  <p className="font-mono text-indigo-300">
                    <strong>Rule:</strong> {w.rule_description}
                  </p>
                  <p className="mt-1 text-slate-400">
                    <strong>Evidence:</strong> {w.evidence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Academic Interventions */}
      {interventions.length > 0 && (
        <div className="rounded-xl border border-indigo-900/30 bg-gradient-to-br from-indigo-950/20 via-slate-900/80 to-slate-900/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 pb-3">
            <Lightbulb className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Suggested Academic Interventions</h3>
              <p className="text-xs text-slate-400">Evidence-based pedagogical action recommendations</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {interventions.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-indigo-200">{plan.title}</h4>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      plan.urgency === 'high'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                        : plan.urgency === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                    }`}
                  >
                    {plan.urgency} Urgency
                  </span>
                </div>

                <p className="mt-1.5 text-slate-300">{plan.summary}</p>

                <div className="mt-3 space-y-1.5 pl-3 border-l-2 border-indigo-600/40">
                  <p className="text-[11px] font-semibold text-slate-400">Recommended Steps:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {plan.recommended_actions.map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <p className="mt-3 text-[10px] italic text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                  Note: {plan.caveat}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Full Assessment Ledger</h3>
          </div>
          <span className="text-xs text-slate-400">{studentRecords.length} records on file</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Subject</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Marks Obtained</th>
                <th className="px-4 py-3">Max Marks</th>
                <th className="px-4 py-3">Normalized %</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {studentRecords.map((r: AssessmentRecord, idx: number) => {
                const pct = calculateRecordPercentage(r);
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white">{r.subject}</td>
                    <td className="px-4 py-3 text-slate-300">{r.assessment_name}</td>
                    <td className="px-4 py-3 text-slate-400">{r.assessment_date || 'Undated'}</td>
                    <td className="px-4 py-3 font-medium">
                      {r.marks_obtained !== null ? r.marks_obtained : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.max_marks}</td>
                    <td className="px-4 py-3 font-bold">
                      {pct !== null ? (
                        <span className={pct < 40 ? 'text-rose-400' : pct < 50 ? 'text-amber-400' : 'text-slate-100'}>
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unscored</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.attendance_percentage !== null ? `${r.attendance_percentage}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ResultStatusBadge status={r.result_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
