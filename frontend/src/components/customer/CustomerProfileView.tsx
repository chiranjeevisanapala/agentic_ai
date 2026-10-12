import React from 'react';
import {
  Users,
  CreditCard,
  Shield,
  Clock,
  FileText,
  AlertCircle,
  Building,
  Mail,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useTicket } from '../../context/TicketContext';

export const CustomerProfileView: React.FC = () => {
  const { activeCustomer, customers, setActiveCustomer } = useTicket();

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Customer Switcher Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Customer 360 Explorer</h2>
            <p className="text-xs text-slate-400">
              Live customer ledger, subscription plan, and billing history retrieved by Customer Context Agent.
            </p>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {customers.map((c) => {
            const isSelected = activeCustomer.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCustomer(c)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.subscription_tier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer 360 Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Profile Overview</span>
          </div>
          <div>
            <div className="text-base font-bold text-white">{activeCustomer.name}</div>
            <div className="text-xs text-slate-400 font-mono">{activeCustomer.customer_code}</div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeCustomer.email}</span>
            </div>
            {activeCustomer.company && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeCustomer.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Subscription Tier</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              {activeCustomer.subscription_tier}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              ${activeCustomer.monthly_rate}/mo
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-400 font-semibold uppercase font-mono text-[11px]">
                {activeCustomer.subscription_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="text-slate-200">{activeCustomer.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Security & MFA Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Security & Authentication</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{activeCustomer.mfa_enabled}</div>
            <div className="text-xs text-slate-400">TOTP Authenticator & Email Challenge</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
            Security Status: Verified Active
          </div>
        </div>
      </div>

      {/* Invoices & Billing History Ledger */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Customer Billing Invoices ({activeCustomer.invoices?.length || 0})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Inspected by Context Agent</span>
        </div>

        <div className="space-y-2">
          {activeCustomer.invoices && activeCustomer.invoices.length > 0 ? (
            activeCustomer.invoices.map((inv) => {
              const isDuplicate = inv.status === 'duplicate_charge';
              return (
                <div
                  key={inv.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                    isDuplicate
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{inv.invoice_number}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          isDuplicate
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {inv.status === 'duplicate_charge' ? 'DUPLICATE CHARGE DETECTED' : 'PAID'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{inv.description}</p>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-white">
                      ${inv.amount.toFixed(2)} {inv.currency}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(inv.billing_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No invoices on file for Free Tier customer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
