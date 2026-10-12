import React from 'react';
import { Bot, Sparkles, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTicket } from '../../context/TicketContext';

export const Navbar: React.FC = () => {
  const { user, setRole } = useAuth();
  const { activeCustomer, customers, setActiveCustomer, isLoading } = useTicket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">Agentic AI Support</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> 6 AGENTS LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Resolution, RAG & Escalation Engine</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Active Customer Persona Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400">Persona:</span>
          <select
            value={activeCustomer.id}
            onChange={(e) => {
              const selected = customers.find(c => c.id === e.target.value);
              if (selected) setActiveCustomer(selected);
            }}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.subscription_tier})
              </option>
            ))}
          </select>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setRole('customer')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              user.role === 'customer'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole('agent')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              user.role === 'agent'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Support Agent
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              user.role === 'admin'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supervisor
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white">{user.full_name}</div>
            <div className="text-[11px] text-emerald-400 font-mono">System Online</div>
          </div>
        </div>
      </div>
    </header>
  );
};
