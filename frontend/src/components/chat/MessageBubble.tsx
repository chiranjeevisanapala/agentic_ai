import React from 'react';
import { Bot, User, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ActionCard } from '../common/ActionCard';

interface MessageBubbleProps {
  role: 'customer' | 'assistant' | 'system';
  content: string;
  metadata?: {
    status?: string;
    category?: string;
    actions_performed?: Array<any>;
    recommended_actions?: Array<any>;
    escalation_status?: string;
    reviewer_notes?: string;
  };
  timestamp?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  metadata,
  timestamp
}) => {
  const isCustomer = role === 'customer';

  return (
    <div className={`flex gap-3.5 ${isCustomer ? 'flex-row-reverse' : 'flex-row'} items-start`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isCustomer
            ? 'bg-slate-700 text-slate-200'
            : 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white'
        }`}
      >
        {isCustomer ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content Body */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2.5 ${isCustomer ? 'items-end' : 'items-start'}`}>
        {/* Sender Name & Status Header */}
        <div className={`flex items-center gap-2 text-xs ${isCustomer ? 'justify-end' : 'justify-start'}`}>
          <span className="font-semibold text-slate-300">
            {isCustomer ? 'You (Customer)' : 'Autonomous Support Agent System'}
          </span>
          {timestamp && <span className="text-slate-500 font-mono text-[10px]">{timestamp}</span>}
          {!isCustomer && metadata?.status && (
            <StatusBadge status={metadata.status} size="sm" />
          )}
        </div>

        {/* Text Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
            isCustomer
              ? 'bg-brand-600 text-white rounded-tr-none'
              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
          }`}
        >
          {content}
        </div>

        {/* Executed Tools Breakdown */}
        {!isCustomer && metadata?.actions_performed && metadata.actions_performed.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Actions Performed Through System Tools:</span>
            </div>
            {metadata.actions_performed.map((act, idx) => (
              <ActionCard
                key={idx}
                type="executed"
                title={act.action_name || 'Automated Action'}
                subtitle={act.details?.reason || 'Executed via safe tool executor'}
                details={act.details}
                status={act.status || 'SUCCESS'}
                riskLevel={act.risk_level || 'LOW'}
              />
            ))}
          </div>
        )}

        {/* Escalation Alert Box */}
        {!isCustomer && metadata?.escalation_status && metadata.escalation_status !== 'None' && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Human Intervention Escalation Active</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Assigned Specialist: <span className="font-semibold text-white">{metadata.escalation_status}</span>
            </p>
          </div>
        )}

        {/* Reviewer Agent Sign-off stamp */}
        {!isCustomer && metadata?.reviewer_notes && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Decision / Reviewer Agent: {metadata.reviewer_notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};
