import React from 'react';
import { ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAcademicData } from '../../context/AcademicDataContext';
import { SeverityBadge, TrendBadge } from '../common/Badge';

export const AtRiskStudentsTable: React.FC = () => {
  const { metricSummary, selectStudent } = useAcademicData();
  const students = metricSummary.students_requiring_review_list;

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-white">No Students Currently Meet Alert Thresholds</h3>
        <p className="mt-1 text-xs text-slate-400">
          All students in this filtered scope currently maintain performance and attendance within configured standards.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Students Requiring Academic Review
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Students flagged by transparent, rule-based indicators ({students.length} student{students.length > 1 ? 's' : ''})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Average Score</th>
              <th className="px-4 py-3">Trajectory</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-5 py-3">Primary Alert Reason</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {students.map((student) => {
              const primaryWarning = student.warnings[0];
              const highestSeverity = student.warnings.some((w) => w.severity === 'priority_review')
                ? 'priority_review'
                : 'needs_review';

              return (
                <tr
                  key={student.student_id}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => selectStudent(student.student_id)}
                >
                  {/* Student ID & Name */}
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {student.student_name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{student.student_id}</p>
                  </td>

                  {/* Class */}
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      {student.class_name}
                    </span>
                  </td>

                  {/* Average Score */}
                  <td className="px-4 py-3.5 font-medium">
                    {student.overall_percentage !== null ? (
                      <span
                        className={
                          student.overall_percentage < 40
                            ? 'text-rose-400 font-bold'
                            : student.overall_percentage < 50
                            ? 'text-amber-400 font-semibold'
                            : 'text-slate-200'
                        }
                      >
                        {student.overall_percentage}%
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No Marks</span>
                    )}
                  </td>

                  {/* Trajectory */}
                  <td className="px-4 py-3.5">
                    <TrendBadge direction={student.trend_direction} delta={student.trend_delta} />
                  </td>

                  {/* Attendance */}
                  <td className="px-4 py-3.5">
                    {student.attendance_percentage !== null ? (
                      <span
                        className={
                          student.attendance_percentage < 70
                            ? 'text-rose-400 font-semibold'
                            : student.attendance_percentage < 75
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }
                      >
                        {student.attendance_percentage}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Warning Reason & Evidence */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={highestSeverity} />
                        <span className="font-medium text-slate-200 truncate" title={primaryWarning?.title}>
                          {primaryWarning?.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate" title={primaryWarning?.observation}>
                        {primaryWarning?.observation}
                      </p>
                    </div>
                  </td>

                  {/* Action link */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectStudent(student.student_id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-900/40 bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
                    >
                      <span>View 360°</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
