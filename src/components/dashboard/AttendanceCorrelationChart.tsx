import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import { Info } from 'lucide-react';
import { useAcademicData } from '../../context/AcademicDataContext';

export const AttendanceCorrelationChart: React.FC = () => {
  const { metricSummary, selectStudent, settings } = useAcademicData();
  const data = metricSummary.attendance_vs_score;

  if (data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-xs text-slate-400">
        Insufficient concurrent attendance and academic score records to render association map.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{item.student_name}</p>
          <p className="text-[10px] text-slate-400">
            ID: {item.student_id} • {item.class_name}
          </p>
          <div className="mt-1.5 space-y-1">
            <p className="text-indigo-300">
              Attendance: <strong className="text-white">{item.attendance}%</strong>
            </p>
            <p className="text-emerald-300">
              Academic Score: <strong className="text-white">{item.score}%</strong>
            </p>
          </div>
          <p className="mt-2 text-[10px] text-indigo-400 underline cursor-pointer">
            Click node to view student profile
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Attendance vs. Academic Performance</h3>
          <p className="text-xs text-slate-400">
            Cross-sectional association map ({data.length} students plotted)
          </p>
        </div>
        <div className="rounded bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 border border-slate-700">
          Attendance Min: {settings.attendance_warning_threshold}%
        </div>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="attendance"
              name="Attendance"
              unit="%"
              domain={[40, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              label={{ value: 'Attendance Rate (%)', position: 'bottom', offset: 5, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="Score"
              unit="%"
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              label={{ value: 'Academic Score (%)', angle: -90, position: 'insideLeft', offset: 25, fill: '#64748b', fontSize: 10 }}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={settings.attendance_warning_threshold}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: `Att. Threshold`, fill: '#fbbf24', fontSize: 9, position: 'top' }}
            />
            <ReferenceLine
              y={settings.pass_threshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: `Pass Mark`, fill: '#f87171', fontSize: 9, position: 'right' }}
            />
            <Scatter
              data={data}
              fill="#818cf8"
              cursor="pointer"
              onClick={(node: any) => {
                if (node && node.student_id) selectStudent(node.student_id);
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Critical Methodological Note as Required */}
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-800/60 p-2.5 text-[11px] text-slate-400 border border-slate-750">
        <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
        <p className="leading-tight">
          <strong className="text-slate-300">Methodological Note:</strong> Statistical correlation does not establish causation.
          Low attendance and lower scores may both stem from shared external factors (e.g. medical illness, transportation obstacles).
        </p>
      </div>
    </div>
  );
};
