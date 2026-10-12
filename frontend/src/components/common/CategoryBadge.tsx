import React from 'react';
import { CreditCard, Cpu, Shield, Layers, MessageSquare } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  let Icon = MessageSquare;
  let color = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';

  if (category.includes('Billing') || category.includes('Payment')) {
    Icon = CreditCard;
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (category.includes('Technical')) {
    Icon = Cpu;
    color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (category.includes('Account') || category.includes('Security')) {
    Icon = Shield;
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (category.includes('Subscription')) {
    Icon = Layers;
    color = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
};
