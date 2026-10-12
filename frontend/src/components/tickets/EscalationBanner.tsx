import React from 'react';
import { AlertTriangle, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

interface EscalationBannerProps {
  reason?: string | null;
  summary?: string | null;
  assignedAgent?: string | null;
}

export const EscalationBanner: React.FC<EscalationBannerProps> = ({
  reason,
  summary,
  assignedAgent
}) => {
  return (
    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-100 shadow-lg shadow-rose-950/40 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">Escalated for Human Specialist Review</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                Action Required
              </span>
            </div>
            <p className="text-xs text-rose-300">
              Assigned Routing: <span className="font-semibold text-white">{assignedAgent || 'Tier 2 Support Specialist'}</span>
            </p>
          </div>
        </div>
      </div>

      {reason && (
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-500/20 text-xs">
          <span className="font-semibold text-rose-400">Trigger Reason: </span>
          <span className="text-slate-200">{reason}</span>
        </div>
      )}

      {summary && (
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 whitespace-pre-line font-mono">
          {summary}
        </div>
      )}
    </div>
  );
};
