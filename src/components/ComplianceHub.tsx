/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Scale, Award, HeartHandshake, FileBadge, CalendarCheck2 
} from 'lucide-react';
import { FleetCompliance, Driver, Vehicle } from '../types';

interface ComplianceHubProps {
  compliance: FleetCompliance;
  drivers: Driver[];
  vehicles: Vehicle[];
}

export default function ComplianceHub({ compliance, drivers, vehicles }: ComplianceHubProps) {
  // Stats
  const expiredCDLs = drivers.filter(d => d.expirationDate < "2026-05-31").length;
  const expiredMedCards = drivers.filter(d => d.medicalCertExpiry < "2026-05-31").length;
  const drugTestedCount = drivers.filter(d => d.drugTestCompliant).length;

  return (
    <div className="space-y-6" id="compliance-compliance-hub">
      {/* Enterprise DOT status */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800" id="safety-scorecard-banner">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-sky-500/10 text-sky-300 font-bold px-2 py-0.5 rounded uppercase tracking-widest font-mono">FMCSA Safety Rating Checklist</span>
            <h3 className="text-2xl font-bold font-sans">USDOT Certificate Compliant</h3>
            <p className="text-xs text-slate-400">Carrier registration: <strong className="font-mono text-white">{compliance.dotNumber}</strong> • MC Number: <strong className="font-mono text-white">{compliance.mcNumber}</strong></p>
          </div>

          <div className="flex gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center shrink-0">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">CSA Safety Score</span>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">{compliance.csaScore}%</p>
            </div>
            <div className="border-l border-slate-800 h-10 shrink-0"></div>
            <div className="text-slate-300 text-xs shrink-0 font-sans">
              <strong className="block text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> PASSING LEVEL
              </strong>
              <span>FMCSA threshold: <strong className="text-white">85.0% Risk Limit</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drug clear status panel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="drug-testing-panel">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">Section §382 Random Testing</h4>
          </div>

          <div className="space-y-4 pt-1.5">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <div>
                <strong className="block text-slate-800 font-sans">Active Consortium Pool:</strong>
                <span className="text-gray-500">4 active drivers enrolled</span>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Active Plan</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/60">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Clean Status</span>
                <strong className="text-slate-800 text-lg font-mono font-bold mt-1 block">{drugTestedCount} / {drivers.length}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/60">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Pending random batch</span>
                <strong className={`block text-lg font-mono font-bold mt-1 ${
                  drivers.length - drugTestedCount > 0 ? 'text-amber-600' : 'text-slate-500'
                }`}>{drivers.length - drugTestedCount} flagged</strong>
              </div>
            </div>

            <div className="bg-red-50 text-red-950 border border-red-100 p-3 rounded-lg text-xs space-y-1">
              <strong className="block text-red-800 flex items-center gap-1 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0" stroke="red" /> Drug Consortia Alert:
              </strong>
              <p>David Miller is marked as <strong>NON-COMPLIANT</strong>. Missed screening window for Q2 testing. Dispatch locks applied under FMCSA rules.</p>
            </div>
          </div>
        </div>

        {/* CDL and Credentials watchlist ledger */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 lg:col-span-2" id="expirations-list">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">Heavy Vehicle & CDL Expirations Checklist</h4>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {/* Metric 1 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <strong className="block text-slate-800 font-bold">Driver Medical Certificates</strong>
                <p className="text-gray-450 leading-relaxed">Required biennially under FMCSA Section 391.41. Expiring certificates downgrade commercial plates.</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  expiredMedCards > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {expiredMedCards > 0 ? `${expiredMedCards} Lapsed` : 'All Clean'}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono mt-1">Pending: Sarah Jenkins</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <strong className="block text-slate-800 font-bold">Class A CDL License Registry</strong>
                <p className="text-gray-450 leading-relaxed">Operator licenses verification. Interstate commercial operations require active matching state files.</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  expiredCDLs > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {expiredCDLs > 0 ? `${expiredCDLs} Lapsed` : 'All Clean'}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono mt-1">Pending: David Miller</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:border-slate-300 transition-colors">
              <div className="space-y-0.5">
                <strong className="block text-slate-800 font-bold">Fleet Insurance policies & MC clearance</strong>
                <p className="text-gray-450 leading-relaxed">Form BMC-91 filing requirement. Minimum $750,000 public coverage per heavy haul load.</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                  BMC-91 Active
                </span>
                <span className="text-[10px] text-gray-400 block font-mono mt-1">Next: Nov 15, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver safety scorecard statistics table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="safety-incidents-panel">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">FMCSA Safety & CDL Incident Ledger</span>
          <span className="text-[10px] text-gray-400 font-bold">FMCSA DataQs systems sync</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">Registered Driver</th>
              <th className="py-3 px-4 font-bold">CDL License & State</th>
              <th className="py-3 px-4 font-bold">HOS Logging Incidents</th>
              <th className="py-3 px-4 font-bold">CSA safety rating Score</th>
              <th className="py-3 px-4 font-bold text-right">Medical Cert Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-800">{d.name}</td>
                <td className="py-3 px-4 font-mono select-all text-slate-600">{d.cdlNumber} ({d.state})</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${
                    d.violationsCount > 2 ? 'text-red-650 font-bold' : 'text-slate-500'
                  }`}>
                    {d.violationsCount > 0 ? `${d.violationsCount} violations` : 'Clean Log Record'}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold">
                  <span className={d.safetyScore >= 80 ? 'text-emerald-600' : d.safetyScore >= 70 ? 'text-slate-700' : 'text-red-600 font-bold'}>
                    {d.safetyScore} / 100
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    d.medicalCertExpiry < '2026-05-31' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {d.medicalCertExpiry < '2026-05-31' ? 'Lapsed/Expired' : 'Verified OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
