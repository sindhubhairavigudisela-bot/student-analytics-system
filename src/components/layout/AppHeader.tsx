import React from 'react';
import { Download, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useAcademicData } from '../../context/AcademicDataContext';
import { exportRecordsToCsv } from '../../data/templateData';

export const AppHeader: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    datasetInfo,
    loadSampleDataset,
    filteredRecords,
    filters,
  } = useAcademicData();

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Academic Performance Overview',
      subtitle: 'Cohort-level indicators, subject breakdown, distributions, and review rosters.',
    },
    students: {
      title: 'Student Directory & Roster',
      subtitle: 'Searchable academic records, individual performance metrics, and trajectories.',
    },
    profile: {
      title: 'Individual Student Academic Profile',
      subtitle: 'Comprehensive 360° student history, trends, transparent warnings, and pedagogical interventions.',
    },
    insights: {
      title: 'Insights & Early Warning Hub',
      subtitle: 'Explainable rule-based triggers, empirical evidence, and teacher review workflows.',
    },
    'data-management': {
      title: 'Data Management & File Import',
      subtitle: 'Import CSV or Excel files, map columns, run row-by-row validation, and inspect datasets.',
    },
    'reports-settings': {
      title: 'Reports & System Settings',
      subtitle: 'Generate printable reports, export tabular records, and configure academic thresholds.',
    },
  };

  const { title, subtitle } = pageTitles[currentPage] || {
    title: 'Student Performance Analytics',
    subtitle: 'Academic Analytics & Early Intervention System',
  };

  const handleExportCurrent = () => {
    const filename = `student_analytics_${filters.class_name || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    exportRecordsToCsv(filteredRecords, filename);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Titles */}
        <div className="pl-10 lg:pl-0">
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Data Freshness Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Updated:</span>
            <span className="font-medium text-slate-300">
              {new Date(datasetInfo.lastImported).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Quick Export Button */}
          <button
            onClick={handleExportCurrent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            title="Export filtered records as CSV"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Reload Sample Data Button */}
          {!datasetInfo.isSample && (
            <button
              onClick={loadSampleDataset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              title="Reset to sample dataset"
            >
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sample Data</span>
            </button>
          )}

          {/* Settings Shortcut */}
          <button
            onClick={() => setCurrentPage('reports-settings')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              currentPage === 'reports-settings'
                ? 'border-indigo-500 bg-indigo-600/30 text-white'
                : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
            title="Configure Academic Thresholds"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
