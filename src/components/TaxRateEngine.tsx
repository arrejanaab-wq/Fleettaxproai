/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  RefreshCw, CheckCircle, Database, AlertCircle, Info, Landmark, Calendar, Clock, Sparkles 
} from 'lucide-react';
import { TaxRate } from '../types';

interface TaxRateEngineProps {
  taxRates: TaxRate[];
  syncStatus: string;
  syncLog: string[];
  onTriggerSync: () => Promise<void>;
}

export default function TaxRateEngine({ taxRates, syncStatus, syncLog, onTriggerSync }: TaxRateEngineProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterFuel, setFilterFuel] = useState<'Diesel' | 'Gasoline' | 'CNG'>('Diesel');

  const handleSync = async () => {
    setIsSyncing(true);
    await onTriggerSync();
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="tax-rate-engine-view">
      {/* Visual Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="tax-rate-header">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Real-Time IFTA Tax Rate Sync Engine</h3>
          <p className="text-xs text-gray-500">Retrieves verified interstate quarterly tax matrix factors from live authority databases</p>
        </div>

        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          id="btn-trigger-sync"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing Live Rates...' : 'Sync Live IFTA Matrix'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Rates Grid list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="rates-table-panel">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Q2 2026 Active Jurisdiction Database</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterFuel('Diesel')} 
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  filterFuel === 'Diesel' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Diesel
              </button>
              <button 
                onClick={() => setFilterFuel('Gasoline')} 
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  filterFuel === 'Gasoline' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Gasoline
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">State Code</th>
                <th className="py-3 px-4 font-bold">Jurisdiction Name</th>
                <th className="py-3 px-4 font-bold">Fuel Type</th>
                <th className="py-3 px-4 font-bold">Effective Period</th>
                <th className="py-3 px-4 font-bold text-right">Tax Rate / Gallon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
              {taxRates.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 font-mono select-all">
                    {tr.stateCode}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {tr.stateName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{tr.fuelType}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">
                    {tr.quarter} {tr.year}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 select-all">
                    ${tr.taxRate.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sync logs and engine architecture details */}
        <div className="bg-slate-950 text-slate-400 rounded-xl p-5 border border-slate-900 space-y-4" id="sync-console-log">
          <div>
            <div className="flex items-center gap-1.5 text-white">
              <Database className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider">Secure Handshake Sync Log</h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Live telemetry communication status with state registries</p>
          </div>

          <div className="bg-black/40 border border-slate-900 rounded-lg p-3 space-y-3 font-mono text-[10px] max-h-[220px] overflow-y-auto text-slate-300">
            {syncLog.map((log, index) => (
              <div key={index} className="leading-relaxed border-b border-slate-900/30 pb-1.5 last:border-0">
                {log}
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Last synchronization state:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">{syncStatus}</p>
          </div>

          <div className="text-[10px] text-slate-500 flex gap-1 items-start leading-relaxed pt-2">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>IFTA matrices are revised quarterly on Jan 1st, Apr 1st, Jul 1st, and Oct 1st. FleetTax Pro automatically holds historical and future rates to ensure zero tax calculations gaps.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
