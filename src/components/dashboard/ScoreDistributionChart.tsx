import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAcademicData } from '../../context/AcademicDataContext';

export const ScoreDistributionChart: React.FC = () => {
  const { metricSummary } = useAcademicData();
  const data = metricSummary.distribution;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{label}</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-slate-200">
              Students in Tier: <strong className="text-indigo-400">{item.count}</strong>
            </p>
            <p className="text-slate-400">
              Proportion of Cohort: <strong className="text-white">{item.percentage}%</strong>
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
          <h3 className="text-sm font-semibold text-white">Cohort Score Distribution</h3>
          <p className="text-xs text-slate-400">Student count across standardized competence thresholds</p>
        </div>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="range"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
        {data.map((bin) => (
          <div key={bin.range} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bin.color }} />
            <span>{bin.range.split(' ')[0]}:</span>
            <span className="font-semibold text-slate-200">{bin.count} ({bin.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
