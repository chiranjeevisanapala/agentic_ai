import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RefreshCw, Paperclip, CheckCircle } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QuickScenarios } from './QuickScenarios';
import { LiveTraceWidget } from './LiveTraceWidget';
import { useTicket } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'customer' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export const ChatInterface: React.FC = () => {
  const { activeResolution, runResolution, isLoading, activeCustomer } = useTicket();
  const { user } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'customer',
      content: 'I was charged twice for my subscription this month. Please check the issue and tell me what I should do.',
      timestamp: 'Just now'
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: activeResolution?.final_response || 'Checking your account and invoices...',
      timestamp: 'Just now',
      metadata: {
        status: activeResolution?.ticket_status || 'Resolved',
        category: activeResolution?.issue_category || 'Billing & Payments',
        actions_performed: activeResolution?.actions_performed || [],
        escalation_status: activeResolution?.escalation_status || 'None',
        reviewer_notes: activeResolution?.reviewer_verdict?.notes || 'Solution verified against policy.'
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'customer',
      content: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    try {
      const res = await runResolution(query);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.final_response,
        timestamp: 'Just now',
        metadata: {
          status: res.ticket_status,
          category: res.issue_category,
          actions_performed: res.actions_performed,
          escalation_status: res.escalation_status,
          reviewer_notes: res.reviewer_verdict?.notes
        }
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Error resolving:', err);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Main Chat Stream Column */}
      <div className="flex-1 flex flex-col justify-between bg-[#0B0F19] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Customer Support AI Agent
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Session: #{activeCustomer.customer_code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="text-slate-200">{activeCustomer.name}</span> ({activeCustomer.subscription_tier} Tier)
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0], messages[1]])}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chat
          </button>
        </div>

        {/* Message History Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              metadata={msg.metadata}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Typing / Agent Workflow Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-brand-500/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-brand-400 font-semibold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Multi-Agent Workflow Orchestration in progress...</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                  Running Triage → Context Lookup → Knowledge RAG → Safe Tool Execution → Reviewer Sign-off
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input & Quick Scenarios Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-3">
          <QuickScenarios onSelectScenario={(q) => handleSend(q)} disabled={isLoading} />

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Describe your issue or question (e.g. I was charged twice for my subscription this month...)"
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/30"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Real-time Agent Trace Inspector Side Panel */}
      <LiveTraceWidget />
    </div>
  );
};
