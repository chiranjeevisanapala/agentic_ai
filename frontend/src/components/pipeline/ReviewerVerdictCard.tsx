import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, Lock, Sparkles } from 'lucide-react';
import { ReviewerVerdict } from '../../types/agent';

interface ReviewerVerdictCardProps {
  verdict: ReviewerVerdict;
  confidenceScore: number;
}

export const ReviewerVerdictCard: React.FC<ReviewerVerdictCardProps> = ({
  verdict,
  confidenceScore
}) => {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Decision / Reviewer Agent Sign-Off</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED & APPROVED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Quality Assurance, Hallucination Prevention & Compliance Guard
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Overall Accuracy Score</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {Math.round(confidenceScore * 100)}%
          </div>
        </div>
      </div>

      {/* Checklist Checks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Policy Adherence</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
            {verdict.policy_check}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Hallucination Check</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
            {verdict.hallucination_check}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">Tool Safety Barrier</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
            {verdict.safety_check}
          </span>
        </div>
      </div>

      {/* Reviewer Note */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-mono">
        <span className="text-indigo-400 font-bold">Reviewer Log: </span>
        {verdict.notes}
      </div>
    </div>
  );
};
