/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, CreditCard, Layers, Smartphone, RefreshCw, Check, Landmark, UserCheck, KeyRound, Sparkles, Server, CheckSquare 
} from 'lucide-react';
import { UserRole } from '../types';

interface SaaSAdminMobileBillingProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  auditLogs: { timestamp: string; user: string; action: string; status: string }[];
}

export default function SaaSAdminMobileBilling({ currentRole, onRoleChange, auditLogs }: SaaSAdminMobileBillingProps) {
  const [activeTab, setActiveTab] = useState<'billing' | 'accounting' | 'admin' | 'mobile'>('billing');
  const [stripeSuccessMsg, setStripeSuccessMsg] = useState('');
  const [stripePlan, setStripePlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  
  // QuickBooks auth simulation state
  const [qbSynced, setQbSynced] = useState(true);

  const triggerStripeMock = (plan: 'starter' | 'professional' | 'enterprise') => {
    setStripePlan(plan);
    setStripeSuccessMsg(`Stripe Webhook handshake success! FleetTax Pro updated subscription to standard ${plan.toUpperCase()} tier.`);
    setTimeout(() => setStripeSuccessMsg(''), 5000);
  };

  const rolesList: UserRole[] = ["Super Admin", "Fleet Owner", "Fleet Manager", "Dispatcher", "Driver", "Accountant"];

  const billingPlans = [
    { id: 'starter' as const, name: 'Starter Plan', price: '$49', desc: 'Up to 5 Vehicles, standard IFTA, and automated calculations' },
    { id: 'professional' as const, name: 'Professional Plan', price: '$129', desc: 'Unlimited vehicles, live GPS crossings, and automatic OCR scanner' },
    { id: 'enterprise' as const, name: 'Enterprise Pro', price: 'Custom Quote', desc: 'Full-stack integrations, AWS databases, dedicated compliance officer support' }
  ];

  return (
    <div className="space-y-6" id="saas-settings-view">
      {/* Settings Navigation switches */}
      <div className="bg-white rounded-xl border border-gray-150 p-2 flex gap-2 shadow-sm" id="settings-menu-tabs">
        <button 
          onClick={() => setActiveTab('billing')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'billing' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Stripe Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('accounting')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'accounting' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" /> Accounting Sync
        </button>
        <button 
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'mobile' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Driver Mobile HUD
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'admin' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> RBAC Admin Portal
        </button>
      </div>

      {stripeSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-950 text-xs animate-bounce" id="stripe-banner">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <div><strong>Stripe Billing:</strong> {stripeSuccessMsg}</div>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'billing' ? (
        <div className="space-y-6" id="billing-tab">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Industrial Stripe Subscriptions</h3>
            <p className="text-xs text-gray-500">Flexible monthly carrier pricing plans matched to your active commercial fleet requirements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {billingPlans.map((plan) => {
              const active = stripePlan === plan.id;
              return (
                <div key={plan.id} className={`bg-white rounded-xl border p-5 flex flex-col justify-between hover:shadow-md transition-all ${
                  active ? 'border-slate-900 ring-2 ring-slate-900/5' : 'border-gray-150'
                }`}>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-800 text-sm font-bold">{plan.name}</strong>
                      {active && <span className="bg-slate-900 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded">Active Plan</span>}
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-sans">{plan.price} <span className="text-xs font-medium text-gray-400">/ month</span></div>
                    <p className="text-gray-450 leading-relaxed text-[11px]">{plan.desc}</p>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => triggerStripeMock(plan.id)}
                    className={`w-full text-center text-xs py-2 mt-4 font-bold rounded-lg transition-all ${
                      active ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    {active ? 'Plan Approved' : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'accounting' ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4" id="accounting-tab">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Fintech Accounting Integrations</h3>
            <p className="text-xs text-gray-500">Synch daily fuel purchases, fuel card transactions, and quarterly tax liabilities into books</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* QuickBooks card */}
            <div className="border border-slate-150 rounded-xl p-5 flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg shrink-0">
                <Landmark className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-800">QuickBooks Online API</strong>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    qbSynced ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                  }`}>{qbSynced ? 'Configured OK' : 'Offline'}</span>
                </div>
                <p className="text-gray-450 leading-relaxed text-[11px]">Automatically streams IFTA quarterly liabilities as pending general accounts dues.</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-gray-400 font-mono">Last updated: <strong className="font-bold text-slate-600">3 hrs ago</strong></span>
                  <button onClick={()=>setQbSynced(!qbSynced)} className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">
                    {qbSynced ? 'Disconnect' : 'Connect API'}
                  </button>
                </div>
              </div>
            </div>

            {/* Xero card */}
            <div className="border border-slate-150 rounded-xl p-5 flex items-start gap-4">
              <div className="p-3 bg-sky-50 text-sky-800 rounded-lg shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-800">Xero Accounting Suite</strong>
                  <span className="bg-gray-100 text-gray-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Offline</span>
                </div>
                <p className="text-gray-450 leading-relaxed text-[11px]">Syncs gas voucher cost centers directly as business tax deductible expenditures.</p>
                <button className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded self-start mt-1">Connect API</button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'mobile' ? (
        /* React Native Driver sandbox */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="mobile-tab">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">React Native Driver HUD Sandboxing</h3>
              <p className="text-xs text-gray-550 leading-relaxed">Our unified React Native mobile app shares core logic with this platform, empowering truck drivers to log trips, submit fuel receipts via phone cameras, and complete FMCSA daily inspections offline.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 rounded-xl p-4 border border-slate-105">
              <div className="space-y-1">
                <strong className="block text-slate-800">Automatic Off-Line Sync:</strong>
                <p className="text-gray-450 text-[11px]">Driver fuel receipts save to local AsyncStorage when cell coverage reaches zero, pushing to the server once service restores.</p>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-800">Instant CDL updates:</strong>
                <p className="text-gray-450 text-[11px]">Drivers get immediate notifications when dispatch locks are placed or medical certification records reach critical limits.</p>
              </div>
            </div>
          </div>

          {/* Visual Smartphone simulation frame */}
          <div className="bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 text-slate-200 relative overflow-hidden" style={{ minHeight: '340px' }} id="mobile-viewport">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-slate-800 w-16 h-3.5 rounded-full z-10 text-[9px] text-center text-slate-300 font-mono">CAS-HD</div>
            
            <div className="space-y-4 text-xs pt-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 bg-slate-900/40 p-2 rounded-lg">
                <span className="font-bold text-sky-400">FleetTax mobile v1.5</span>
                <span className="font-mono text-[9px] text-emerald-400 font-bold">Online GPRS</span>
              </div>

              {/* Driver Welcome Card */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-800 text-slate-400 text-[10px] rounded-full flex items-center justify-center font-bold">M</span>
                  <div>
                    <h5 className="font-bold text-white text-[11px]">Marcus Vance</h5>
                    <p className="text-[10px] text-slate-400">Freightliner Cascadia • Plate TX-991</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded p-2 text-[10px] leading-snug">
                  <strong>Standard Trip Active (I-10 W):</strong> Logged 380 NM transit miles. FMCSA HOS clock compliant.
                </div>
              </div>

              {/* Mobile upload buttons */}
              <div className="space-y-2">
                <button className="w-full text-center text-[10px] bg-sky-600 py-1.5 rounded font-bold text-white flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Submit Camera Receipt Scan
                </button>
                <div className="text-[9px] text-slate-500 text-right italic font-mono">Assigned Dispatcher: bud.smith@fleetpro.com</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RBAC & Administration management tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-tab">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Role Based Access Controls (RBAC) Simulator</h3>
              <p className="text-xs text-gray-500">Test different user privilege states within the FleetTax Pro enterprise system</p>
            </div>

            {/* Privilege toggle buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {rolesList.map((role) => {
                const active = currentRole === role;
                return (
                  <button 
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={`p-3 text-xs text-left font-bold border rounded-xl flex items-center gap-1.5 transition-all ${
                      active ? 'border-slate-850 bg-slate-900 text-white font-black' : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" /> {role}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs space-y-1">
              <strong className="block text-slate-800 font-bold">Active Role Permission Check:</strong>
              <p className="text-gray-500">Currently logging actions under <strong className="text-slate-800">{currentRole}</strong> specifications. Super administrators hold authorization to force sync quarterly tax matrices, while drivers are restricted to mobile receipt uploads.</p>
            </div>
          </div>

          {/* Secure Audit Logs */}
          <div className="bg-slate-950 text-slate-350 border border-slate-900 p-5 rounded-xl space-y-4" id="audit-logs-sidebar">
            <div>
              <div className="flex items-center gap-1 text-white">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Enterprise Audit Logs</h4>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Strict database changes tracking</p>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 text-[10px] font-mono leading-relaxed">
              {auditLogs.map((log, index) => (
                <div key={index} className="border-b border-slate-900/40 pb-2 last:border-0 text-slate-300">
                  <div className="flex justify-between font-bold text-[9px] text-slate-400 mb-0.5">
                    <span>{log.user}</span>
                    <span>{log.timestamp.replace('T', ' ').substring(11, 19)}</span>
                  </div>
                  <p className="font-semibold text-slate-100">{log.action}</p>
                  <p className="text-[9px] text-slate-500 italic mt-0.5">Response: {log.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
