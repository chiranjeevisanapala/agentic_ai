import React from 'react';
import { Zap, CheckCircle, ShieldAlert, ArrowRight, Cog } from 'lucide-react';

interface ActionCardProps {
  type: 'executed' | 'recommended';
  title: string;
  subtitle?: string;
  details?: Record<string, any>;
  status?: string;
  riskLevel?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  type,
  title,
  subtitle,
  details,
  status = 'SUCCESS',
  riskLevel = 'LOW'
}) => {
  const isExecuted = type === 'executed';

  return (
    <div
      className={`p-3.5 rounded-lg border transition-all ${
        isExecuted
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100 shadow-sm'
          : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center ${
              isExecuted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'
            }`}
          >
            {isExecuted ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{title}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isExecuted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isExecuted ? 'Executed Tool Call' : 'Recommended Step'}
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {isExecuted && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              <CheckCircle className="w-3 h-3" />
              {status}
            </span>
          </div>
        )}
      </div>

      {details && Object.keys(details).length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-700/50 font-mono text-[11px] grid grid-cols-2 gap-2 text-slate-300 bg-slate-900/60 p-2 rounded">
          {Object.entries(details).map(([key, val]) => (
            <div key={key} className="truncate">
              <span className="text-slate-500">{key}: </span>
              <span className="text-slate-200 font-medium">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
