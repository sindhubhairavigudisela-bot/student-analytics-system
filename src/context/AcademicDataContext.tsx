/**
 * Academic Data Context & State Provider
 * 
 * Provides centralized state for:
 * - Active assessment records (sample dataset or user-uploaded)
 * - Persistent custom thresholds & system settings
 * - Shared filter parameters
 * - Warning review acknowledgments
 * - Navigation and active student selection
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  AssessmentRecord,
  FilterState,
  MetricSummary,
  PageId,
  StudentSummary,
  SystemSettings,
  WarningItem,
} from '../types';
import {
  DEFAULT_SETTINGS,
  calculateMetricSummary,
  calculateStudentSummaries,
  filterRecords,
} from '../analytics/calculations';
import { enrichSummariesWithWarnings } from '../analytics/warnings';
import { SAMPLE_DATASET } from '../data/sampleDataset';

interface AcademicDataContextType {
  // Navigation & Page State
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedStudentId: string | null;
  selectStudent: (studentId: string | null) => void;

  // Dataset State
  records: AssessmentRecord[];
  datasetInfo: {
    name: string;
    recordCount: number;
    lastImported: string;
    isSample: boolean;
  };
  importDataset: (newRecords: AssessmentRecord[], mode: 'replace' | 'append', sourceName: string) => void;
  loadSampleDataset: () => void;
  clearDataset: () => void;

  // Filter State
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;

  // Filter Dropdown Options
  availableClasses: string[];
  availableSubjects: string[];
  availableAssessments: string[];
  availableTerms: string[];

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: SystemSettings) => void;
  resetSettings: () => void;

  // Warnings & Reviews
  reviewedWarningIds: Set<string>;
  toggleReviewWarning: (warningId: string) => void;
  allWarnings: WarningItem[];

  // Computed Derived Data
  filteredRecords: AssessmentRecord[];
  allStudentSummaries: Record<string, StudentSummary>;
  filteredStudentSummaries: StudentSummary[];
  metricSummary: MetricSummary;
}

const AcademicDataContext = createContext<AcademicDataContextType | undefined>(undefined);

const INITIAL_FILTERS: FilterState = {
  class_name: 'ALL',
  subject: 'ALL',
  assessment_name: 'ALL',
  academic_term: 'ALL',
  search_query: '',
};

const SETTINGS_STORAGE_KEY = 'spa-system-settings-v1';
const REVIEWS_STORAGE_KEY = 'spa-reviewed-warnings-v1';

export const AcademicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Settings with LocalStorage persistence
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Reviewed Warning IDs with LocalStorage
  const [reviewedWarningIds, setReviewedWarningIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set<string>();
  });

  const toggleReviewWarning = (warningId: string) => {
    setReviewedWarningIds((prev) => {
      const next = new Set(prev);
      if (next.has(warningId)) {
        next.delete(warningId);
      } else {
        next.add(warningId);
      }
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Dataset Records
  const [records, setRecords] = useState<AssessmentRecord[]>(SAMPLE_DATASET);
  const [datasetInfo, setDatasetInfo] = useState({
    name: 'Fictional Academic Cohort',
    recordCount: SAMPLE_DATASET.length,
    lastImported: new Date().toISOString(),
    isSample: true,
  });

  // Filters
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Import Actions
  const importDataset = (newRecords: AssessmentRecord[], mode: 'replace' | 'append', sourceName: string) => {
    if (mode === 'replace') {
      setRecords(newRecords);
      setDatasetInfo({
        name: sourceName,
        recordCount: newRecords.length,
        lastImported: new Date().toISOString(),
        isSample: false,
      });
    } else {
      const combined = [...records, ...newRecords];
      setRecords(combined);
      setDatasetInfo({
        name: `${datasetInfo.name} + ${sourceName}`,
        recordCount: combined.length,
        lastImported: new Date().toISOString(),
        isSample: false,
      });
    }
    resetFilters();
  };

  const loadSampleDataset = () => {
    setRecords(SAMPLE_DATASET);
    setDatasetInfo({
      name: 'Fictional Academic Cohort',
      recordCount: SAMPLE_DATASET.length,
      lastImported: new Date().toISOString(),
      isSample: true,
    });
    resetFilters();
  };

  const clearDataset = () => {
    setRecords([]);
    setDatasetInfo({
      name: 'Empty Dataset',
      recordCount: 0,
      lastImported: new Date().toISOString(),
      isSample: false,
    });
    resetFilters();
  };

  // Helper for navigating directly to student profile
  const selectStudent = (studentId: string | null) => {
    setSelectedStudentId(studentId);
    if (studentId) {
      setCurrentPage('profile');
    }
  };

  // Available Filter Options
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.class_name) set.add(r.class_name);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableAssessments = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.assessment_name) set.add(r.assessment_name);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableTerms = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.academic_term) set.add(r.academic_term);
    });
    return Array.from(set).sort();
  }, [records]);

  // Derived filtered records
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  // Summaries across ALL records with warnings evaluated
  const allStudentSummaries = useMemo(() => {
    const rawSummaries = calculateStudentSummaries(records, settings);
    return enrichSummariesWithWarnings(rawSummaries, records, settings, reviewedWarningIds);
  }, [records, settings, reviewedWarningIds]);

  // Filtered student summaries
  const filteredStudentSummaries = useMemo(() => {
    const activeStudentIds = new Set(filteredRecords.map((r) => r.student_id));
    return Object.values(allStudentSummaries).filter((s) => activeStudentIds.has(s.student_id));
  }, [allStudentSummaries, filteredRecords]);

  // All warnings across the system
  const allWarnings = useMemo(() => {
    const list: WarningItem[] = [];
    Object.values(allStudentSummaries).forEach((s) => {
      if (s.warnings) {
        list.push(...s.warnings);
      }
    });
    return list;
  }, [allStudentSummaries]);

  // Metric Summary based on filtered records
  const metricSummary = useMemo(() => {
    return calculateMetricSummary(filteredRecords, allStudentSummaries, settings);
  }, [filteredRecords, allStudentSummaries, settings]);

  return (
    <AcademicDataContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedStudentId,
        selectStudent,
        records,
        datasetInfo,
        importDataset,
        loadSampleDataset,
        clearDataset,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        availableClasses,
        availableSubjects,
        availableAssessments,
        availableTerms,
        settings,
        updateSettings,
        resetSettings,
        reviewedWarningIds,
        toggleReviewWarning,
        allWarnings,
        filteredRecords,
        allStudentSummaries,
        filteredStudentSummaries,
        metricSummary,
      }}
    >
      {children}
    </AcademicDataContext.Provider>
  );
};

export function useAcademicData(): AcademicDataContextType {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error('useAcademicData must be used within an AcademicDataProvider');
  }
  return context;
}
