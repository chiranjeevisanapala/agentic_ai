import React from 'react';
import { CreditCard, Shield, Cpu, AlertTriangle, Zap, Sparkles } from 'lucide-react';

interface QuickScenariosProps {
  onSelectScenario: (query: string, customerTier?: string) => void;
  disabled?: boolean;
}

export const QuickScenarios: React.FC<QuickScenariosProps> = ({ onSelectScenario, disabled }) => {
  const scenarios = [
    {
      id: 'double-charge-pro',
      title: 'Double Charge ($49 Auto-Refund)',
      query: 'I was charged twice for my subscription this month. Please check the issue and tell me what I should do.',
      icon: CreditCard,
      badge: 'Auto-Resolved',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'high-refund-escalate',
      title: 'High Refund >$100 ($299 Escalation)',
      query: 'I was billed $299 for an Enterprise renewal by mistake. Please refund this immediately or I will contact my bank.',
      icon: AlertTriangle,
      badge: 'Escalation Trigger',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'mfa-reset',
      title: 'MFA / 2FA Device Lockout',
      query: 'I lost my phone and cannot generate 2FA authenticator codes to login. How can I reset my MFA?',
      icon: Shield,
      badge: 'Security Tool',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'rate-limit-429',
      title: 'API 429 Too Many Requests',
      query: 'Our backend is hitting HTTP 429 rate limit errors when calling the API endpoint. Can you check our quota?',
      icon: Cpu,
      badge: 'Tech Support',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    }
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Try One-Click Test Scenarios:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              disabled={disabled}
              onClick={() => onSelectScenario(s.query)}
              className="text-left p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/80 transition group flex items-start gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-brand-500/20 text-slate-400 group-hover:text-brand-300 transition shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {s.title}
                  </span>
                </div>
                <span className={`inline-block text-[10px] font-mono px-1.5 py-0.2 rounded border mt-1 ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
