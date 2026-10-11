import React from 'react';
import { Filter, RotateCcw, Search, X } from 'lucide-react';
import { useAcademicData } from '../../context/AcademicDataContext';

export const FilterBar: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    availableClasses,
    availableSubjects,
    availableAssessments,
    availableTerms,
    filteredRecords,
    records,
  } = useAcademicData();

  const isFiltered =
    filters.class_name !== 'ALL' ||
    filters.subject !== 'ALL' ||
    filters.assessment_name !== 'ALL' ||
    filters.academic_term !== 'ALL' ||
    filters.search_query.trim() !== '';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Top / Left: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={filters.class_name}
              onChange={(e) => updateFilter('class_name', e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 pr-8 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by Class"
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <select
              value={filters.subject}
              onChange={(e) => updateFilter('subject', e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 pr-8 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by Subject"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Filter */}
          <div className="relative">
            <select
              value={filters.assessment_name}
              onChange={(e) => updateFilter('assessment_name', e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 pr-8 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by Assessment"
            >
              <option value="ALL">All Assessments</option>
              {availableAssessments.map((asm) => (
                <option key={asm} value={asm}>
                  {asm}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term Filter */}
          {availableTerms.length > 0 && (
            <div className="relative">
              <select
                value={filters.academic_term}
                onChange={(e) => updateFilter('academic_term', e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 pr-8 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                aria-label="Filter by Term"
              >
                <option value="ALL">All Terms</option>
                {availableTerms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Right: Search Input & Record Counter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student ID or name..."
              value={filters.search_query}
              onChange={(e) => updateFilter('search_query', e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {filters.search_query && (
              <button
                onClick={() => updateFilter('search_query', '')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="shrink-0 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400">
            <span className="font-semibold text-indigo-300">{filteredRecords.length}</span>
            <span className="text-slate-500"> / {records.length} records</span>
          </div>
        </div>
      </div>

      {/* Active Filter Pills if filtered */}
      {isFiltered && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
          <span className="text-slate-400">Active Scope:</span>
          {filters.class_name !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
              Class: {filters.class_name}
              <button onClick={() => updateFilter('class_name', 'ALL')}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          )}
          {filters.subject !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
              Subject: {filters.subject}
              <button onClick={() => updateFilter('subject', 'ALL')}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          )}
          {filters.assessment_name !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
              Assessment: {filters.assessment_name}
              <button onClick={() => updateFilter('assessment_name', 'ALL')}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          )}
          {filters.academic_term !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
              Term: {filters.academic_term}
              <button onClick={() => updateFilter('academic_term', 'ALL')}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          )}
          {filters.search_query && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
              Query: "{filters.search_query}"
              <button onClick={() => updateFilter('search_query', '')}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
