import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Shield,
  FileText,
  HelpCircle,
  Eye
} from 'lucide-react';
import { AgentStepTrace } from '../../types/agent';

interface AgentNodeCardProps {
  trace: AgentStepTrace;
  stepNumber: number;
}

export const AgentNodeCard: React.FC<AgentNodeCardProps> = ({ trace, stepNumber }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Pick agent icon
  const getIcon = () => {
    switch (trace.agent_name) {
      case 'Triage Agent':
        return <HelpCircle className="w-5 h-5 text-indigo-400" />;
      case 'Customer Context Agent':
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'Knowledge Retrieval Agent':
        return <Eye className="w-5 h-5 text-amber-400" />;
      case 'Resolution Agent':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Escalation Agent':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'Decision / Reviewer Agent':
        return <Shield className="w-5 h-5 text-purple-400" />;
      default:
        return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  const isEscalated = trace.status === 'ESCALATED';

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isEscalated
          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Node Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">0{stepNumber}.</span>
              <h3 className="text-sm font-bold text-white">{trace.agent_name}</h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isEscalated
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {trace.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{trace.agent_role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block font-mono text-xs">
            <span className="text-slate-400">Latency: </span>
            <span className="text-white font-semibold">{trace.latency_ms}ms</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-slate-400">Confidence: </span>
            <span className="text-emerald-400 font-semibold">{Math.round(trace.confidence * 100)}%</span>
          </div>

          <button className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/80 text-xs">
          {/* Agent Internal Thought Process */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono uppercase text-brand-400 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Internal Agent Reasoning & Scratchpad</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">{trace.thought_process}</p>
          </div>

          {/* Tool Calls If Present */}
          {trace.tool_calls && trace.tool_calls.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Tool Execution Invocations ({trace.tool_calls.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trace.tool_calls.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between font-mono text-[11px]"
                  >
                    <span className="text-emerald-300 font-bold">{tc.tool || tc.action_name || 'Tool'}</span>
                    <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                      {tc.status || 'SUCCESS'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input / Output JSON Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Input Data */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="font-mono text-[11px] text-slate-400 font-semibold">Input State:</span>
              <pre className="text-[11px] text-slate-300 overflow-x-auto font-mono bg-slate-900/60 p-2 rounded">
                {JSON.stringify(trace.input_data, null, 2)}
              </pre>
            </div>

            {/* Output Data */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">Output State:</span>
              <pre className="text-[11px] text-slate-300 overflow-x-auto font-mono bg-slate-900/60 p-2 rounded">
                {JSON.stringify(trace.output_data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
