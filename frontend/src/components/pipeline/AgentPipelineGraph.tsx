import React from 'react';
import {
  Workflow,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  HelpCircle,
  FileText,
  Eye,
  AlertTriangle,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useTicket } from '../../context/TicketContext';
import { AgentNodeCard } from './AgentNodeCard';
import { ReviewerVerdictCard } from './ReviewerVerdictCard';

export const AgentPipelineGraph: React.FC = () => {
  const { activeResolution, isLoading, activeAgentIndex, runResolution } = useTicket();

  const sampleAgents = [
    { name: 'Triage Agent', role: 'Intent & Priority', icon: HelpCircle, color: 'text-indigo-400' },
    { name: 'Customer Context Agent', role: 'Account & Ledger', icon: FileText, color: 'text-cyan-400' },
    { name: 'Knowledge Retrieval Agent', role: 'Vector RAG Search', icon: Eye, color: 'text-amber-400' },
    { name: 'Resolution Agent', role: 'Synthesis & Tools', icon: Zap, color: 'text-emerald-400' },
    { name: 'Escalation Agent', role: 'Risk & Escalation', icon: AlertTriangle, color: 'text-rose-400' },
    { name: 'Decision / Reviewer Agent', role: 'QA & Safety Check', icon: Shield, color: 'text-purple-400' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 border border-brand-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">Multi-Agent Workflow Orchestrator</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 font-mono">
              StateGraph Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time execution telemetry and state inspection across all 6 specialized AI agents.
          </p>
        </div>

        <button
          disabled={isLoading}
          onClick={() =>
            runResolution(
              'I was charged twice for my subscription this month. Please check the issue and tell me what I should do.'
            )
          }
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-brand-600/30 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Re-Run Pipeline (Sample Double Charge)</span>
        </button>
      </div>

      {/* Graphical Flow Visualizer Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400 font-bold">
            <Workflow className="w-4 h-4 text-brand-400" />
            Execution Graph Nodes (6 Stages)
          </span>
          <span className="font-mono text-emerald-400 text-xs">
            {isLoading ? `Stage ${activeAgentIndex + 1}/6 Running...` : 'Status: Pipeline Complete'}
          </span>
        </div>

        {/* Visual Graph Nodes in a Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sampleAgents.map((ag, idx) => {
            const Icon = ag.icon;
            const isCompleted = !isLoading || activeAgentIndex > idx;
            const isCurrent = isLoading && activeAgentIndex === idx;

            return (
              <div
                key={idx}
                className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/20 animate-pulse'
                    : isCompleted
                    ? 'bg-slate-950/80 border-slate-700/80 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Node {idx + 1}</span>
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <div className={`p-2 rounded-lg bg-slate-900 w-fit mb-2 ${ag.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs truncate text-slate-100">{ag.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{ag.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviewer Agent Sign-Off Verdict */}
      {activeResolution?.reviewer_verdict && (
        <ReviewerVerdictCard
          verdict={activeResolution.reviewer_verdict}
          confidenceScore={activeResolution.confidence_score || 0.98}
        />
      )}

      {/* Detailed Individual Agent Step Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Agent Step Execution Logs & Reasoning</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Steps: {activeResolution?.agent_execution_history?.length || 6}
          </span>
        </div>

        <div className="space-y-3.5">
          {activeResolution?.agent_execution_history?.map((trace, idx) => (
            <AgentNodeCard key={idx} trace={trace} stepNumber={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};
