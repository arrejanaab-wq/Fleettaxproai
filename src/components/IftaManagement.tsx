/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scale, Calculator, CheckCircle2, ChevronRight, FileDown, AlertCircle, Info, Landmark, Edit, RefreshCw 
} from 'lucide-react';
import { Vehicle, FuelPurchase, StateMileage, TaxRate } from '../types';

interface IftaManagementProps {
  vehicles: Vehicle[];
  fuelPurchases: FuelPurchase[];
  taxRates: TaxRate[];
}

export default function IftaManagement({ vehicles, fuelPurchases, taxRates }: IftaManagementProps) {
  const [activeQuarter, setActiveQuarter] = useState<'Q2-2026' | 'Q1-2026'>('Q2-2026');
  const [isAmending, setIsAmending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Gather mileage metrics (Real telematics mock matching the dashboard)
  const stateMileages: StateMileage[] = [
    { state: 'TX', taxableMiles: 12500, tollMiles: 1800, nonTollMiles: 10700, fuelPurchased: 380 },
    { state: 'CA', taxableMiles: 6800, tollMiles: 1200, nonTollMiles: 5600, fuelPurchased: 140 },
    { state: 'OR', taxableMiles: 3200, tollMiles: 0, nonTollMiles: 3200, fuelPurchased: 110 },
    { state: 'NM', taxableMiles: 1150, tollMiles: 200, nonTollMiles: 950, fuelPurchased: 0 },
    { state: 'AZ', taxableMiles: 800, tollMiles: 150, nonTollMiles: 650, fuelPurchased: 100 }
  ];

  const totalMiles = stateMileages.reduce((acc, m) => acc + m.taxableMiles, 0);
  const totalFuelPurchased = stateMileages.reduce((acc, m) => acc + m.fuelPurchased, 0);
  
  // Fleet MPG = Total Miles / Total Fuel Purchased
  const fleetMpg = Number((totalMiles / (totalFuelPurchased || 1)).toFixed(2));

  // Calculate detailed state-by-state IFTA Tax Due
  const calculationData = stateMileages.map(m => {
    // Look up tax rate from database state
    const matchRate = taxRates.find(r => r.stateCode === m.state);
    const rate = matchRate ? matchRate.taxRate : 0.20; // default 20c if non specified

    // State Fuel Consumed = State Miles / Fleet MPG
    const fuelConsumed = Number((m.taxableMiles / fleetMpg).toFixed(2));
    
    // Taxable Gallons = Fuel Consumed - Fuel Purchased locally
    const taxableGallons = Number((fuelConsumed - m.fuelPurchased).toFixed(2));
    
    // Tax Due = Taxable Gallons * Tax Rate
    const taxDue = Number((taxableGallons * rate).toFixed(2));

    return {
      ...m,
      rate,
      fuelConsumed,
      taxableGallons,
      taxDue
    };
  });

  const netTaxDueSum = calculationData.reduce((acc, item) => acc + item.taxDue, 0);

  const triggerMockFiling = () => {
    setSuccessMsg('IFTA filing package successfully queued. Digital signatures matching FMCSA standard transmitted to State Portal.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6" id="ifta-reporting-view">
      {/* Visual head details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="ifta-heading">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">International Fuel Tax Agreement (IFTA) filing ledger</h3>
          <p className="text-xs text-gray-500">Automated carrier calculations matching live diesel transaction logs</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveQuarter('Q2-2026')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeQuarter === 'Q2-2026' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Q2 2026 (Active)
          </button>
          <button 
            onClick={() => setActiveQuarter('Q1-2026')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeQuarter === 'Q1-2026' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Q1 2026 (Filed)
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs animate-bounce" id="success-filing-msg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div><strong>Filing Success:</strong> {successMsg}</div>
        </div>
      )}

      {/* Equations layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ifta-formula-cards">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative space-y-1">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">Fleet Fuel Economy (MPG)</span>
          <div className="text-xl font-extrabold text-slate-900">{fleetMpg} MPG</div>
          <p className="text-[10px] text-slate-500 font-mono italic">Total Miles ({totalMiles.toLocaleString()}) / Total Fuel ({totalFuelPurchased} gal)</p>
          <Calculator className="absolute right-4 bottom-4 text-emerald-600/30 w-12 h-12" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative space-y-1">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">State Fuel Consumed</span>
          <div className="text-xl font-extrabold text-slate-900">Calculated Per State</div>
          <p className="text-[10px] text-slate-500 font-mono italic">Jurisdiction Miles / Fleet MPG ({fleetMpg} MPG)</p>
          <Calculator className="absolute right-4 bottom-4 text-sky-600/30 w-12 h-12" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative space-y-1">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">Net IFTA Settlement due</span>
          <div className="text-xl font-extrabold text-amber-600">${netTaxDueSum.toFixed(2)}</div>
          <p className="text-[10px] text-slate-500 font-mono italic">Sum of underpayments ({activeQuarter}) minus state fuel credits</p>
          <Landmark className="absolute right-4 bottom-4 text-slate-600/30 w-12 h-12" />
        </div>
      </div>

      {/* Main Breakdown matrix table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="ifta-density-table">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <strong className="text-xs text-slate-800 uppercase tracking-wider font-extrabold font-mono">Consolidated Q2 State Liability Matrix</strong>
          <span className="text-xs text-slate-400 font-semibold font-mono">5 active jurisdictions checked</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">State Jrs.</th>
              <th className="py-3 px-4 font-bold">Taxable Miles</th>
              <th className="py-3 px-4 font-bold">Toll / Non-Toll</th>
              <th className="py-3 px-4 font-bold">Local Fuel Purchases</th>
              <th className="py-3 px-4 font-bold text-slate-800">Diesel Fuel Consumed</th>
              <th className="py-3 px-4 font-bold">Tax Rate/gal</th>
              <th className="py-3 px-4 font-bold text-right">Tax Due (or Credit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
            {calculationData.map((item) => (
              <tr key={item.state} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-800 font-mono select-all">
                  {item.state}
                </td>
                <td className="py-3.5 px-4 font-mono font-medium">
                  {item.taxableMiles.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-gray-500">
                  {item.tollMiles} / {item.nonTollMiles}
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {item.fuelPurchased} gal
                </td>
                <td className="py-3.5 px-4 font-bold font-mono text-slate-700 bg-slate-50/50">
                  {item.fuelConsumed.toFixed(1)} gal
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                  ${item.rate.toFixed(4)}
                </td>
                <td className="py-3.5 px-4 text-right select-all">
                  <span className={`font-mono font-bold ${
                    item.taxDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {item.taxDue > 0 ? `+$${item.taxDue.toFixed(2)}` : `-$${Math.abs(item.taxDue).toFixed(2)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="bg-slate-50 border-t border-gray-100 p-4 flex justify-between text-xs font-bold text-slate-700" id="calculation-matrix-totals">
          <span>CONSOLIDATED TOTALS:</span>
          <div className="flex gap-6 font-mono">
            <span>Miles: <strong className="text-slate-900">{totalMiles.toLocaleString()} mi</strong></span>
            <span>Purchased: <strong className="text-slate-900">{totalFuelPurchased} gal</strong></span>
            <span>IFTA Liability: <strong className={netTaxDueSum > 0 ? 'text-amber-750' : 'text-emerald-700'}>${netTaxDueSum.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2" id="ifta-actions-row">
        {isAmending ? (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-2">
            <h4 className="font-bold mb-1">Amending Return for Q2 2026</h4>
            <p className="text-gray-500 mb-2">You are allowed to adjust manual mileage offsets below. Note: amending audit files flags credentials to FMCSA examiners.</p>
            <div className="flex gap-2">
              <button onClick={()=>setIsAmending(false)} className="text-[11px] bg-slate-800 text-white font-bold px-3 py-1 rounded">Save Amendment</button>
              <button onClick={()=>setIsAmending(false)} className="text-[11px] text-gray-500 px-3 py-1 border border-slate-300 rounded hover:bg-slate-100">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsAmending(true)} 
              className="text-xs text-slate-800 border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-all"
            >
              <Edit className="w-3.5 h-3.5" /> Amend Q2 Returns
            </button>
            <button 
              onClick={triggerMockFiling}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
              id="submit-state-filing-btn"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> E-File Completed Return
            </button>
          </>
        )}
      </div>

      {/* IFTA audit warnings callout */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-xs text-amber-900" id="ifta-alert-disclosure">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong>Strict Audit Warning (FMCSA Section 396):</strong> IFTA auditors can request trip log logs up to 4 historical years. Discrepancies between GPS track records and paper fuel invoice cards trigger standard $5,000 carrier penalties. Ensure all receipt image files are properly scanned on FleetTax.
        </div>
      </div>
    </div>
  );
}
