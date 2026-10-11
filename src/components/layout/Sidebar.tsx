import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  Database,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Cpu,
} from 'lucide-react';
import { useAcademicData } from '../../context/AcademicDataContext';
import { PageId } from '../../types';
import { Modal } from '../common/Modal';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    allWarnings,
    datasetInfo,
    selectedStudentId,
  } = useAcademicData();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showMlModal, setShowMlModal] = useState(false);

  const unreviewedWarningsCount = allWarnings.filter((w) => !w.is_reviewed).length;

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'profile',
      label: 'Student Profile',
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      id: 'insights',
      label: 'Insights & Warnings',
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: unreviewedWarningsCount > 0 ? unreviewedWarningsCount : undefined,
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: 'reports-settings',
      label: 'Reports & Settings',
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
  ];

  const handleNavClick = (id: PageId) => {
    setCurrentPage(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center justify-center rounded-lg bg-slate-900 border border-slate-750 p-2 text-slate-300 shadow-lg"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-950/95 p-4 transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Academix Pro
                <span className="rounded bg-indigo-950 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-400 border border-indigo-800/50">
                  v2.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Early Intervention Analytics</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-5 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Console
            </p>
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Dataset Info & ML Module Readiness */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          {/* Active Dataset Pill */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Active Cohort</span>
              {datasetInfo.isSample ? (
                <span className="rounded bg-indigo-950/80 px-1.5 py-0.5 text-[10px] text-indigo-300 font-semibold border border-indigo-800/40">
                  Fictional Demo
                </span>
              ) : (
                <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold border border-emerald-800/40">
                  Imported
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-200 truncate">{datasetInfo.name}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {datasetInfo.recordCount} records loaded
            </p>
          </div>

          {/* Machine Learning Pipeline Status */}
          <button
            onClick={() => setShowMlModal(true)}
            className="flex w-full items-center justify-between rounded-xl border border-indigo-900/40 bg-indigo-950/30 p-2.5 text-left text-xs transition-colors hover:bg-indigo-950/60"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <div>
                <p className="text-[11px] font-semibold text-indigo-200">ML Extension Service</p>
                <p className="text-[10px] text-indigo-400/80">Architecture & Status</p>
              </div>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          </button>
        </div>
      </aside>

      {/* Machine Learning Architecture & Status Modal */}
      <Modal
        isOpen={showMlModal}
        onClose={() => setShowMlModal(false)}
        title="Machine Learning Pipeline Architecture & Status"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-950/40 border border-indigo-800/40 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Rule-Based Engine Active (Decoupled ML Pipeline Ready)
              </h4>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              In accordance with strict production ethics, the active early-warning system uses
              transparent, rule-based analytics with zero black-box fabrications. An independent Python
              service architecture (`ml_service/`) with scikit-learn and pandas is configured to train
              and serve validated predictive models once longitudinal historical datasets are available.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h5 className="font-semibold text-white">Pipeline Components:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Prediction Target:</strong> Probability of academic
                difficulty in upcoming assessments (Binary Risk Classification) or Next-Exam Score
                Regression.
              </li>
              <li>
                <strong className="text-slate-200">Feature Engineering:</strong> Cumulative weighted average,
                historical attendance rate, prior sequential score trajectory (&Delta;), subject difficulty index.
              </li>
              <li>
                <strong className="text-slate-200">Leakage Prevention:</strong> Time-aware GroupKFold validation
                grouped by student ID to prevent temporal or student data contamination.
              </li>
              <li>
                <strong className="text-slate-200">Evaluation Metrics:</strong> Precision, Recall, F1-Score,
                and Confusion Matrix (for risk classes); MAE & RMSE (for score estimation).
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-800/70 p-3 text-[11px] text-slate-400">
            <p className="font-medium text-slate-300">Important Institutional Safeguard:</p>
            The system acts as a pedagogical decision-support tool. It never makes consequential decisions
            without teacher review and does not predict inherent personal capabilities.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowMlModal(false)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
