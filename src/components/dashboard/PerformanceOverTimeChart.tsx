import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAcademicData } from '../../context/AcademicDataContext';

export const PerformanceOverTimeChart: React.FC = () => {
  const { metricSummary } = useAcademicData();
  const data = metricSummary.time_series;

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-xs text-slate-400">
        Insufficient sequential assessment records to display temporal trend.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{label}</p>
          {item.date && <p className="text-[10px] text-slate-400">Date: {item.date}</p>}
          <div className="mt-1.5 space-y-1">
            <p className="text-violet-300">
              Average Score: <strong className="text-white">{item.average_percentage}%</strong>
            </p>
            <p className="text-slate-400">
              Total Graded Submissions: <strong className="text-slate-200">{item.count}</strong>
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
          <h3 className="text-sm font-semibold text-white">Performance Trajectory Over Time</h3>
          <p className="text-xs text-slate-400">Cohort average score progression across sequential evaluations</p>
        </div>
        <div className="rounded bg-violet-950/60 px-2 py-0.5 text-xs text-violet-300 border border-violet-800/40">
          {data.length} periods evaluated
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <defs>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="average_percentage"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#timeGradient)"
              dot={{ r: 4, fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#8b5cf6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
