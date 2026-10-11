import React from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  CalendarCheck,
  FileCheck,
  AlertOctagon,
} from 'lucide-react';
import { useAcademicData } from '../context/AcademicDataContext';
import { KpiCard } from '../components/common/KpiCard';
import { FilterBar } from '../components/common/FilterBar';
import { SubjectPerformanceChart } from '../components/dashboard/SubjectPerformanceChart';
import { PerformanceOverTimeChart } from '../components/dashboard/PerformanceOverTimeChart';
import { ScoreDistributionChart } from '../components/dashboard/ScoreDistributionChart';
import { AttendanceCorrelationChart } from '../components/dashboard/AttendanceCorrelationChart';
import { AtRiskStudentsTable } from '../components/dashboard/AtRiskStudentsTable';
import { EmptyState } from '../components/common/EmptyState';

export const OverviewPage: React.FC = () => {
  const { metricSummary, filteredRecords, resetFilters, settings } = useAcademicData();

  if (filteredRecords.length === 0) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <EmptyState
          title="No Records Match the Selected Filters"
          description="Adjust your class, subject, or search filters to examine active student records."
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared Filter Bar */}
      <FilterBar />

      {/* 6 Key Academic Indicator Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* KPI 1: Total Students */}
        <KpiCard
          title="Total Students"
          value={metricSummary.total_unique_students}
          subtitle="Distinct active student IDs"
          icon={<Users className="h-5 w-5" />}
          trendText="Unique Cohort"
        />

        {/* KPI 2: Overall Average Score */}
        <KpiCard
          title="Cohort Average"
          value={metricSummary.overall_average_score}
          unit="%"
          subtitle={`Across ${metricSummary.valid_graded_results} valid results`}
          icon={<Award className="h-5 w-5" />}
          status={
            metricSummary.overall_average_score !== null && metricSummary.overall_average_score < settings.pass_threshold
              ? 'danger'
              : metricSummary.overall_average_score !== null && metricSummary.overall_average_score < settings.low_performance_threshold
              ? 'warning'
              : 'normal'
          }
        />

        {/* KPI 3: Pass Rate */}
        <KpiCard
          title="Pass Rate"
          value={metricSummary.pass_rate}
          unit="%"
          subtitle={`Scoring >= ${settings.pass_threshold}% pass benchmark`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          status={
            metricSummary.pass_rate !== null && metricSummary.pass_rate < 70
              ? 'warning'
              : 'success'
          }
        />

        {/* KPI 4: Average Attendance */}
        <KpiCard
          title="Avg Attendance"
          value={metricSummary.average_attendance}
          unit="%"
          subtitle="Calculated per unique student"
          icon={<CalendarCheck className="h-5 w-5" />}
          status={
            metricSummary.average_attendance !== null && metricSummary.average_attendance < settings.attendance_warning_threshold
              ? 'warning'
              : 'normal'
          }
        />

        {/* KPI 5: Graded Submissions */}
        <KpiCard
          title="Graded Submissions"
          value={metricSummary.valid_graded_results}
          subtitle={`Of ${metricSummary.total_assessments} total entries recorded`}
          icon={<FileCheck className="h-5 w-5" />}
        />

        {/* KPI 6: Students Requiring Review */}
        <KpiCard
          title="Needs Review"
          value={metricSummary.students_requiring_review}
          subtitle="Flagged by transparent rules"
          icon={<AlertOctagon className="h-5 w-5" />}
          status={metricSummary.students_requiring_review > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SubjectPerformanceChart />
        <PerformanceOverTimeChart />
        <ScoreDistributionChart />
        <AttendanceCorrelationChart />
      </div>

      {/* Roster of Students Requiring Review */}
      <AtRiskStudentsTable />
    </div>
  );
};
