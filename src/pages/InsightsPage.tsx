import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  BookOpen,
  Calendar,
  AlertOctagon,
  Search,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { WarningCategory, WarningItem } from '../types';
import { SeverityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const InsightsPage: React.FC = () => {
  const {
    allWarnings,
    toggleReviewWarning,
    selectStudent,
    settings,
  } = useAcademicData();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Filtered Warnings
  const filteredWarnings = useMemo(() => {
    return allWarnings.filter((w: WarningItem) => {
      if (categoryFilter !== 'ALL' && w.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && w.severity !== severityFilter) return false;
      if (reviewFilter === 'UNREVIEWED' && w.is_reviewed) return false;
      if (reviewFilter === 'REVIEWED' && !w.is_reviewed) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = w.student_name.toLowerCase().includes(q);
        const matchId = w.student_id.toLowerCase().includes(q);
        const matchTitle = w.title.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchTitle) return false;
      }

      return true;
    });
  }, [allWarnings, categoryFilter, severityFilter, reviewFilter, searchQuery]);

  // Counts for KPI pills
  const counts = useMemo(() => {
    const priority = allWarnings.filter((w: WarningItem) => w.severity === 'priority_review').length;
    const needsReview = allWarnings.filter((w: WarningItem) => w.severity === 'needs_review').length;
    const unreviewed = allWarnings.filter((w: WarningItem) => !w.is_reviewed).length;
    const reviewed = allWarnings.filter((w: WarningItem) => w.is_reviewed).length;
    return { priority, needsReview, unreviewed, reviewed };
  }, [allWarnings]);

  const getCategoryIcon = (cat: WarningCategory) => {
    switch (cat) {
      case 'low_performance':
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
      case 'declining_performance':
        return <TrendingDown className="h-4 w-4 text-amber-400" />;
      case 'subject_gap':
        return <BookOpen className="h-4 w-4 text-indigo-400" />;
      case 'attendance_review':
        return <Calendar className="h-4 w-4 text-amber-400" />;
      case 'insufficient_data':
        return <Clock className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner & Rule Transparency Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Rule-Based Early Warning Dispatch</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Explainable indicators driven by empirical assessment triggers. Zero fabricated predictive probabilities.
          </p>
        </div>

        <button
          onClick={() => setShowRuleModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-700/60 bg-indigo-950/60 px-3.5 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Rule Transparency & Formulas</span>
        </button>
      </div>

      {/* KPI Severity Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">Priority Reviews</p>
          <p className="mt-1 text-2xl font-bold text-rose-200">{counts.priority}</p>
          <p className="mt-0.5 text-[10px] text-rose-400">Severe decline or failing score</p>
        </div>

        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Needs Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-200">{counts.needsReview}</p>
          <p className="mt-0.5 text-[10px] text-amber-400">Moderate drop or subject gap</p>
        </div>

        <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Pending Teacher Action</p>
          <p className="mt-1 text-2xl font-bold text-indigo-200">{counts.unreviewed}</p>
          <p className="mt-0.5 text-[10px] text-indigo-400">Unreviewed warnings</p>
        </div>

        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Acknowledged & Reviewed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-200">{counts.reviewed}</p>
          <p className="mt-0.5 text-[10px] text-emerald-400">Saved in browser state</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="low_performance">Low Performance</option>
              <option value="declining_performance">Declining Trajectory</option>
              <option value="subject_gap">Subject-Level Learning Gap</option>
              <option value="attendance_review">Attendance Review</option>
              <option value="insufficient_data">Incomplete / Missing Records</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="priority_review">Priority Review</option>
              <option value="needs_review">Needs Review</option>
              <option value="informational">Informational</option>
            </select>

            {/* Review Status Filter */}
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value as any)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREVIEWED">Unreviewed Only</option>
              <option value="REVIEWED">Reviewed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warning Cards Feed */}
      {filteredWarnings.length === 0 ? (
        <EmptyState
          title="No Warning Cards Match Current Filter"
          description="Adjust your filters or query to display active academic warnings."
          actionText="Reset Filters"
          onAction={() => {
            setCategoryFilter('ALL');
            setSeverityFilter('ALL');
            setReviewFilter('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredWarnings.map((warning: WarningItem) => {
            return (
              <div
                key={warning.id}
                className={`rounded-xl border p-5 shadow-lg backdrop-blur-md transition-all ${
                  warning.is_reviewed
                    ? 'border-slate-800 bg-slate-900/50 opacity-75'
                    : warning.severity === 'priority_review'
                    ? 'border-rose-900/60 bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900'
                    : 'border-slate-800 bg-slate-900/90'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-slate-800 p-2 text-slate-300">
                      {getCategoryIcon(warning.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={warning.severity} />
                        <span className="text-xs font-semibold text-slate-400">
                          {warning.class_name}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-white">{warning.title}</h4>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => toggleReviewWarning(warning.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        warning.is_reviewed
                          ? 'border border-emerald-800 bg-emerald-950 text-emerald-300'
                          : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{warning.is_reviewed ? 'Reviewed' : 'Acknowledge Review'}</span>
                    </button>

                    <button
                      onClick={() => selectStudent(warning.student_id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-900/50 bg-indigo-950/50 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/70 hover:text-white transition-colors"
                    >
                      <span>Student 360°</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Student Info */}
                <div className="mt-3 text-xs text-slate-400">
                  Target Student:{' '}
                  <strong className="text-white">{warning.student_name}</strong> ({warning.student_id})
                  {warning.subject && (
                    <span className="ml-2 rounded bg-slate-800 px-2 py-0.5 text-indigo-300">
                      Subject: {warning.subject}
                    </span>
                  )}
                </div>

                {/* Observation */}
                <p className="mt-2 text-xs text-slate-200 leading-relaxed">{warning.observation}</p>

                {/* Evidence & Rule Details */}
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 rounded-lg bg-slate-950/80 p-3 text-xs border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Evidence Recorded:
                    </span>
                    <p className="mt-0.5 text-slate-300">{warning.evidence}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Deterministic Rule:
                    </span>
                    <p className="mt-0.5 font-mono text-[11px] text-indigo-300">
                      {warning.rule_description}
                    </p>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="mt-3 flex items-start gap-2 text-xs text-indigo-300 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/30">
                  <span className="font-semibold text-indigo-200 shrink-0">Suggested Pedagogical Step:</span>
                  <span>{warning.suggested_action}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Transparency Modal */}
      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title="Transparent Early Warning Rule Specifications"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="rounded-lg bg-indigo-950/40 p-3 border border-indigo-800/40">
            <h4 className="font-bold text-white text-sm">Design Principle</h4>
            <p className="mt-1 text-slate-300">
              Every early warning in this system is computed using transparent, deterministic rules.
              The application explicitly distinguishes between observed academic data and human diagnostic
              judgment.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-slate-800/60 p-3">
              <h5 className="font-semibold text-rose-300">1. Low Performance Rule</h5>
              <p className="text-slate-400 mt-0.5">
                Triggers when a student's cumulative normalized percentage score falls below institutional standards.
              </p>
              <p className="font-mono text-indigo-300 mt-1">
                Trigger: overall_percentage &lt; {settings.low_performance_threshold}% (Priority if &lt; {settings.pass_threshold}%)
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/60 p-3">
              <h5 className="font-semibold text-amber-300">2. Declining Performance Rule</h5>
              <p className="text-slate-400 mt-0.5">
                Compares sequential assessments. Requires at least 2 distinct assessment rounds to prevent false alerts.
              </p>
              <p className="font-mono text-indigo-300 mt-1">
                Trigger: (later_score - earlier_score) &lt;= -{settings.decline_threshold_delta}% delta
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/60 p-3">
              <h5 className="font-semibold text-indigo-300">3. Subject-Level Learning Gap Rule</h5>
              <p className="text-slate-400 mt-0.5">
                Detects students who excel generally but exhibit isolated struggles in a specific discipline.
              </p>
              <p className="font-mono text-indigo-300 mt-1">
                Trigger: (overall_average - subject_average) &gt;= {settings.subject_gap_threshold}%
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/60 p-3">
              <h5 className="font-semibold text-amber-300">4. Attendance Review Rule</h5>
              <p className="text-slate-400 mt-0.5">
                Monitors instructional exposure without presuming absence caused poor marks.
              </p>
              <p className="font-mono text-indigo-300 mt-1">
                Trigger: attendance_percentage &lt; {settings.attendance_warning_threshold}%
              </p>
            </div>

            <div className="rounded-lg bg-slate-800/60 p-3">
              <h5 className="font-semibold text-sky-300">5. Incomplete / Missing Record Rule</h5>
              <p className="text-slate-400 mt-0.5">
                Flags unsubmitted, excused, or missing records separately without silently distorting them to 0%.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowRuleModal(false)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
