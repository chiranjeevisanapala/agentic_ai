import React from 'react';

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (priority) {
    case 'Urgent':
      color = 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold';
      break;
    case 'High':
      color = 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-medium';
      break;
    case 'Medium':
      color = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      break;
    case 'Low':
      color = 'bg-slate-700/50 text-slate-400 border-slate-600';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${color}`}>
      {priority}
    </span>
  );
};
