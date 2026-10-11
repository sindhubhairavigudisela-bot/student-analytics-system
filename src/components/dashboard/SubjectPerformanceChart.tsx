import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { useAcademicData } from '../../context/AcademicDataContext';

export const SubjectPerformanceChart: React.FC = () => {
  const { metricSummary, settings } = useAcademicData();
  const data = metricSummary.subject_performances;

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-xs text-slate-400">
        No graded subject assessment data available in current filter scope.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{label}</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-indigo-300">
              Average Score: <strong className="text-white">{item.average_percentage}%</strong>
            </p>
            <p className="text-slate-400">
              Pass Rate: <strong className="text-emerald-400">{item.pass_rate}%</strong>
            </p>
            <p className="text-slate-400">
              Students Evaluated: <strong className="text-slate-200">{item.student_count}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Subject-Wise Performance</h3>
          <p className="text-xs text-slate-400">Average percentage scores normalized across assessments</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Pass Mark: {settings.pass_threshold}%</span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="subject"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={settings.pass_threshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Pass (${settings.pass_threshold}%)`,
                fill: '#f87171',
                fontSize: 10,
                position: 'right',
              }}
            />
            <Bar dataKey="average_percentage" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                const isBelowPass = entry.average_percentage < settings.pass_threshold;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isBelowPass ? '#ef4444' : '#6366f1'}
                    className="transition-all hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
