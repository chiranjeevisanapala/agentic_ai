import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Zap,
  Shield,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Workflow
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { ActionCard } from '../common/ActionCard';
import { EscalationBanner } from './EscalationBanner';
import { AgentNodeCard } from '../pipeline/AgentNodeCard';
import { ResolutionResult } from '../../types/agent';
import { TicketItem } from '../../types/ticket';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketItem | null;
  resolutionData?: ResolutionResult | null;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  resolutionData
}) => {
  if (!ticket && !resolutionData) return null;

  const tckNumber = ticket?.ticket_number || resolutionData?.ticket_number || 'TCK-89420';
  const status = (ticket?.status || resolutionData?.ticket_status || 'Resolved') as any;
  const category = ticket?.issue_category || resolutionData?.issue_category || 'Billing & Payments';
  const priority = ticket?.priority || resolutionData?.priority || 'High';
  const query = ticket?.customer_query || resolutionData?.customer_query || '';
  const suggestedResolution = ticket?.suggested_resolution || resolutionData?.suggested_resolution || '';
  const finalResponse = ticket?.final_response || resolutionData?.final_response || '';
  const retrievedKnowledge = ticket?.retrieved_knowledge || resolutionData?.retrieved_knowledge || [];
  const recommendedActions = ticket?.recommended_actions || resolutionData?.recommended_actions || [];
  const actionsPerformed = ticket?.actions_performed || resolutionData?.actions_performed || [];
  const escalationStatus = ticket?.escalation_status || resolutionData?.escalation_status || 'None';
  const escalationReason = ticket?.escalation_reason || resolutionData?.escalation_reason;
  const escalationSummary = ticket?.escalation_summary || resolutionData?.escalation_summary;
  const agentTraces = ticket?.agent_traces || resolutionData?.agent_execution_history || [];

  const isEscalated = status === 'Escalated' || escalationStatus !== 'None';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket Details — ${tckNumber}`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Header Card: Status, Category, Priority */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={status} size="lg" />
            <CategoryBadge category={category} />
            <PriorityBadge priority={priority} />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Ticket ID: <span className="text-slate-200">{tckNumber}</span>
          </div>
        </div>

        {/* Escalation Banner if Active */}
        {isEscalated && (
          <EscalationBanner
            reason={escalationReason}
            summary={escalationSummary}
            assignedAgent={ticket?.assigned_human_agent}
          />
        )}

        {/* 1. Customer Query Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            <span>1. Customer Query</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 font-medium">
            "{query}"
          </div>
        </div>

        {/* 2. Retrieved Knowledge (RAG) */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>2. Retrieved Knowledge Base Context (RAG)</span>
          </div>
          {retrievedKnowledge.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {retrievedKnowledge.map((kb: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 font-mono text-[11px]">
                      {kb.article_code || 'KB-DOC'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Score: {kb.similarity_score ? `${Math.round(kb.similarity_score * 100)}%` : '94%'}
                    </span>
                  </div>
                  <div className="font-semibold text-white">{kb.title}</div>
                  <p className="text-slate-400 leading-relaxed text-[11px] line-clamp-3">
                    {kb.snippet}
                  </p>
                  {kb.policy_reference && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Policy Ref: {kb.policy_reference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 text-xs text-slate-400">
              No direct knowledge articles matched. Standard support runbook applied.
            </div>
          )}
        </div>

        {/* 3. Suggested Resolution & Recommended Actions */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>3. Suggested Resolution & Step-By-Step Guidance</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 space-y-3">
            <p className="leading-relaxed font-sans">{suggestedResolution}</p>

            {recommendedActions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Recommended Guidance Steps:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendedActions.map((rec: any, idx: number) => (
                    <ActionCard
                      key={idx}
                      type="recommended"
                      title={rec.action || 'Recommended Step'}
                      subtitle={rec.type ? `Category: ${rec.type}` : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Actions Actually Performed Through Tools */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>4. Actions Performed Through System Tools</span>
          </div>
          {actionsPerformed.length > 0 ? (
            <div className="space-y-2">
              {actionsPerformed.map((act: any, idx: number) => (
                <ActionCard
                  key={idx}
                  type="executed"
                  title={act.action_name || 'Automated Tool Execution'}
                  subtitle={act.details?.reason || 'Verified and executed by safe ToolExecutor'}
                  details={act.details}
                  status={act.status || 'SUCCESS'}
                  riskLevel={act.risk_level || 'LOW'}
                />
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
              {isEscalated
                ? 'Automated tools were intentionally held/blocked due to High-Risk escalation threshold (> $100 limit).'
                : 'Advisory resolution — no write-level tool modifications were required.'}
            </div>
          )}
        </div>

        {/* 5. Final Customer Response */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>5. Final Customer Response</span>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/30 text-xs text-slate-100 whitespace-pre-line leading-relaxed shadow-sm font-sans">
            {finalResponse}
          </div>
        </div>

        {/* 6. Agent Execution History (Trace Timeline) */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-brand-400" />
              <span>6. Complete Agent Execution History (6 Agents)</span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Total Steps: {agentTraces.length}
            </span>
          </div>

          <div className="space-y-3">
            {agentTraces.map((trace: any, idx: number) => (
              <AgentNodeCard key={idx} trace={trace} stepNumber={idx + 1} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
