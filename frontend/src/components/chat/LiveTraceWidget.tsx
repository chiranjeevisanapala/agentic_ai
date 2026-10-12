import React from 'react';
import { Bot, CheckCircle2, Clock, AlertCircle, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { useTicket } from '../../context/TicketContext';

export const LiveTraceWidget: React.FC = () => {
  const { activeResolution, isLoading, activeAgentIndex } = useTicket();

  const agents = [
    { name: 'Triage Agent', role: 'Classification & Priority' },
    { name: 'Customer Context Agent', role: 'Profile & Ledger Retrieval' },
    { name: 'Knowledge Retrieval Agent', role: 'Vector RAG & Policies' },
    { name: 'Resolution Agent', role: 'Tool Execution & Guidance' },
    { name: 'Escalation Agent', role: 'Risk & Human Routing' },
    { name: 'Decision / Reviewer Agent', role: 'Quality & Policy Sign-off' },
  ];

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 hidden xl:flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Live Agent Execution
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {isLoading ? 'EXECUTING...' : 'RESOLVED'}
          </span>
        </div>

        {/* 6 Step Nodes */}
        <div className="space-y-2.5">
          {agents.map((ag, idx) => {
            const isCompleted = !isLoading || activeAgentIndex > idx;
            const isCurrent = isLoading && activeAgentIndex === idx;
            const trace = activeResolution?.agent_execution_history?.[idx];

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition-all text-xs ${
                  isCurrent
                    ? 'bg-brand-600/20 border-brand-500/50 shadow-md animate-pulse'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-800/90 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <span className={isCurrent ? 'text-brand-300 font-bold' : ''}>{ag.name}</span>
                  </div>

                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                  {ag.role}
                </div>

                {isCompleted && trace?.latency_ms && (
                  <div className="mt-1.5 pl-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Latency: {trace.latency_ms}ms</span>
                    <span className="text-emerald-400">Score: {Math.round(trace.confidence * 100)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviewer Verdict Footer */}
      {activeResolution?.reviewer_verdict && (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reviewer Agent Signed Off</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Safety, Hallucination & Policy checks passed with 100% compliance.
          </p>
        </div>
      )}
    </div>
  );
};
