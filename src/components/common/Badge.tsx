import React from 'react';
import { WarningSeverity, TrendDirection, ResultStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-800/60',
    info: 'bg-sky-950/80 text-sky-300 border border-sky-800/60',
    purple: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60',
  }[variant];

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: WarningSeverity }> = ({ severity }) => {
  if (severity === 'priority_review') {
    return <Badge variant="danger">Priority Review</Badge>;
  }
  if (severity === 'needs_review') {
    return <Badge variant="warning">Needs Review</Badge>;
  }
  return <Badge variant="info">Informational</Badge>;
};

export const TrendBadge: React.FC<{ direction: TrendDirection; delta?: number | null }> = ({ direction, delta }) => {
  if (direction === 'improving') {
    return (
      <Badge variant="success">
        ↑ Improving {delta !== null && delta !== undefined ? `(+${delta}%)` : ''}
      </Badge>
    );
  }
  if (direction === 'declining') {
    return (
      <Badge variant="danger">
        ↓ Declining {delta !== null && delta !== undefined ? `(${delta}%)` : ''}
      </Badge>
    );
  }
  if (direction === 'stable') {
    return <Badge variant="info">→ Stable</Badge>;
  }
  return <Badge variant="default">Insufficient History</Badge>;
};

export const ResultStatusBadge: React.FC<{ status: ResultStatus }> = ({ status }) => {
  if (status === 'graded') {
    return <Badge variant="success">Graded</Badge>;
  }
  if (status === 'absent') {
    return <Badge variant="danger">Absent</Badge>;
  }
  if (status === 'missing') {
    return <Badge variant="warning">Missing Mark</Badge>;
  }
  if (status === 'not_submitted') {
    return <Badge variant="warning">Unsubmitted</Badge>;
  }
  return <Badge variant="purple">Not Opted</Badge>;
};
