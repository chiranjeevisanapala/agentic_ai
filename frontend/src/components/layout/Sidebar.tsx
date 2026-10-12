import React from 'react';
import {
  MessageSquare,
  Workflow,
  Inbox,
  BookOpen,
  Users,
  BarChart3,
  Wrench,
  ChevronRight
} from 'lucide-react';

export type NavTab = 'chat' | 'pipeline' | 'tickets' | 'knowledge' | 'customers' | 'analytics';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  ticketCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, ticketCount }) => {
  const navItems = [
    { id: 'chat', label: 'Support Live Chat', icon: MessageSquare, badge: 'Live AI' },
    { id: 'pipeline', label: 'Multi-Agent Pipeline', icon: Workflow, badge: '6 Agents' },
    { id: 'tickets', label: 'Resolution Tickets', icon: Inbox, count: ticketCount },
    { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: BookOpen },
    { id: 'customers', label: 'Customer 360', icon: Users },
    { id: 'analytics', label: 'KPI Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F19] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Resolution System
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Architecture Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Agent Orchestrator
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Sequential State Graph running Triage, Context, RAG, Tool Execution, Risk Escalation, and Reviewer sign-off.
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-2">
        <span>FastAPI + LangGraph</span>
        <span className="font-mono text-emerald-400">v1.0.0</span>
      </div>
    </aside>
  );
};
