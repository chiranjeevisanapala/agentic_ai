import React, { useState } from 'react';
import {
  Search,
  Filter,
  Inbox,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useTicket } from '../../context/TicketContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { TicketDetailModal } from './TicketDetailModal';
import { TicketItem } from '../../types/ticket';

export const TicketList: React.FC = () => {
  const { tickets, activeResolution } = useTicket();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine fetched tickets + active resolution item for rich live view
  const allTickets: TicketItem[] = [
    ...(activeResolution
      ? [
          {
            id: activeResolution.ticket_id,
            ticket_number: activeResolution.ticket_number,
            customer_id: 'cust-1',
            customer_query: activeResolution.customer_query,
            issue_category: activeResolution.issue_category,
            priority: activeResolution.priority,
            status: activeResolution.ticket_status,
            suggested_resolution: activeResolution.suggested_resolution,
            final_response: activeResolution.final_response,
            retrieved_knowledge: activeResolution.retrieved_knowledge,
            recommended_actions: activeResolution.recommended_actions,
            actions_performed: activeResolution.actions_performed,
            escalation_status: activeResolution.escalation_status,
            escalation_reason: activeResolution.escalation_reason || undefined,
            escalation_summary: activeResolution.escalation_summary || undefined,
            agent_traces: activeResolution.agent_execution_history,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      : []),
    ...tickets
  ];

  // Filter out duplicates by ticket_number
  const uniqueTickets = Array.from(new Map(allTickets.map(item => [item.ticket_number, item])).values());

  const filteredTickets = uniqueTickets.filter(t => {
    const matchesSearch =
      t.customer_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue_category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (t: TicketItem) => {
    setSelectedTicket(t);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-brand-400" />
            <span>Ticket Resolution Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent resolution log, tool execution auditing, and escalation queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
            Total Tickets: <span className="font-bold text-white">{uniqueTickets.length}</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by query, category, or ID (e.g. TCK-89420, double charge)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Resolved">Resolved</option>
            <option value="Requires More Information">Requires More Information</option>
            <option value="Escalated">Escalated</option>
            <option value="Pending Review">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => handleOpenDetail(t)}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 transition cursor-pointer shadow-md group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-300">
                    {t.ticket_number}
                  </span>
                  <StatusBadge status={t.status} size="sm" />
                  <CategoryBadge category={t.issue_category} />
                  <PriorityBadge priority={t.priority} />
                  {t.actions_performed && t.actions_performed.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> {t.actions_performed.length} Tool Executed
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2">
                  "{t.customer_query}"
                </p>

                {t.suggested_resolution && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                    Resolution: {t.suggested_resolution}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Auto-Agent Trace: 6/6</div>
                  <div>Quality: 98%</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No tickets found matching current filters.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TicketDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
      />
    </div>
  );
};
