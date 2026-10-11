import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { StudentSummary } from '../types';
import { TrendBadge, SeverityBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

type SortField = 'student_id' | 'student_name' | 'class_name' | 'overall_percentage' | 'attendance_percentage' | 'trend_delta';
type SortOrder = 'asc' | 'desc';

export const StudentsPage: React.FC = () => {
  const {
    filteredStudentSummaries,
    selectStudent,
    availableClasses,
    settings,
  } = useAcademicData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<'ALL' | 'CRITICAL' | 'NEEDS_REVIEW' | 'PASSING' | 'FLAGGED'>('ALL');
  const [sortField, setSortField] = useState<SortField>('overall_percentage');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtering
  const processedStudents = useMemo(() => {
    return filteredStudentSummaries.filter((student: StudentSummary) => {
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = student.student_name.toLowerCase().includes(q);
        const matchId = student.student_id.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }

      // Class
      if (selectedClass !== 'ALL' && student.class_name !== selectedClass) {
        return false;
      }

      // Performance Filter
      if (performanceFilter === 'CRITICAL') {
        if (student.overall_percentage === null || student.overall_percentage >= settings.pass_threshold) {
          return false;
        }
      } else if (performanceFilter === 'NEEDS_REVIEW') {
        if (
          student.overall_percentage === null ||
          student.overall_percentage < settings.pass_threshold ||
          student.overall_percentage >= settings.low_performance_threshold
        ) {
          return false;
        }
      } else if (performanceFilter === 'PASSING') {
        if (student.overall_percentage === null || student.overall_percentage < settings.low_performance_threshold) {
          return false;
        }
      } else if (performanceFilter === 'FLAGGED') {
        if (!student.warnings || student.warnings.length === 0) {
          return false;
        }
      }

      return true;
    });
  }, [filteredStudentSummaries, searchQuery, selectedClass, performanceFilter, settings]);

  // Sorting
  const sortedStudents = useMemo(() => {
    return [...processedStudents].sort((a: StudentSummary, b: StudentSummary) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = -9999;
      if (valB === null || valB === undefined) valB = -9999;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [processedStudents, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-500" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-indigo-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Directory Filter & Search Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Cohorts / Classes</option>
              {availableClasses.map((cls: string) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            {/* Performance Tier Filter */}
            <select
              value={performanceFilter}
              onChange={(e) => {
                setPerformanceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Academic Standings</option>
              <option value="FLAGGED">Alerted Students Only</option>
              <option value="CRITICAL">Critical &lt; {settings.pass_threshold}%</option>
              <option value="NEEDS_REVIEW">Review {settings.pass_threshold}% - {settings.low_performance_threshold}%</option>
              <option value="PASSING">Proficient &gt;= {settings.low_performance_threshold}%</option>
            </select>

            <span className="text-xs text-slate-400 pl-2">
              Showing <strong className="text-slate-200">{sortedStudents.length}</strong> students
            </span>
          </div>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {sortedStudents.length === 0 ? (
        <EmptyState
          title="No Students Matched Filter Criteria"
          description="Try broadening your search term or selecting 'All Academic Standings'."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedClass('ALL');
            setPerformanceFilter('ALL');
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    className="px-5 py-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('student_name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student</span>
                      {getSortIcon('student_name')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('class_name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Class</span>
                      {getSortIcon('class_name')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('overall_percentage')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Overall Score</span>
                      {getSortIcon('overall_percentage')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('attendance_percentage')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Attendance</span>
                      {getSortIcon('attendance_percentage')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('trend_delta')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Trajectory</span>
                      {getSortIcon('trend_delta')}
                    </div>
                  </th>
                  <th className="px-5 py-3">Active Early Warnings</th>
                  <th className="px-4 py-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paginatedStudents.map((student: StudentSummary) => {
                  return (
                    <tr
                      key={student.student_id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => selectStudent(student.student_id)}
                    >
                      {/* Name & ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 font-semibold text-xs">
                            {student.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {student.student_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{student.student_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                          {student.class_name}
                        </span>
                      </td>

                      {/* Overall Score */}
                      <td className="px-4 py-3.5 font-medium">
                        {student.overall_percentage !== null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                student.overall_percentage < settings.pass_threshold
                                  ? 'text-rose-400 font-bold'
                                  : student.overall_percentage < settings.low_performance_threshold
                                  ? 'text-amber-400 font-semibold'
                                  : 'text-slate-100 font-semibold'
                              }`}
                            >
                              {student.overall_percentage}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({student.graded_assessments} tests)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Graded Results</span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="px-4 py-3.5">
                        {student.attendance_percentage !== null ? (
                          <span
                            className={
                              student.attendance_percentage < 70
                                ? 'text-rose-400 font-semibold'
                                : student.attendance_percentage < settings.attendance_warning_threshold
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }
                          >
                            {student.attendance_percentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Trajectory */}
                      <td className="px-4 py-3.5">
                        <TrendBadge direction={student.trend_direction} delta={student.trend_delta} />
                      </td>

                      {/* Warnings */}
                      <td className="px-5 py-3.5">
                        {student.warnings.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Good Standing
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {student.warnings.map((w) => (
                              <SeverityBadge key={w.id} severity={w.severity} />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectStudent(student.student_id);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-900/40 bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
                        >
                          <span>Profile</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/40 px-6 py-3 text-xs text-slate-400">
              <p>
                Page <strong className="text-slate-200">{currentPage}</strong> of{' '}
                <strong className="text-slate-200">{totalPages}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
