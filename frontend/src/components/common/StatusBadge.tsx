import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Resolved' | 'Requires More Information' | 'Escalated' | 'Pending Review' | 'Open' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = HelpCircle;

  switch (status) {
    case 'Resolved':
      color = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      Icon = CheckCircle2;
      break;
    case 'Requires More Information':
      color = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      Icon = AlertCircle;
      break;
    case 'Escalated':
      color = 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
      Icon = AlertTriangle;
      break;
    case 'Pending Review':
      color = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      Icon = Clock;
      break;
    case 'Open':
      color = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      Icon = Clock;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${color} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
