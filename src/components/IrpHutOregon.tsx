/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Landmark, Calculator, Truck, ChevronRight, FileCheck, HelpCircle, ArrowUpRight, Scale, CheckSquare, Info 
} from 'lucide-react';

export default function IrpHutOregon() {
  const [activeTab, setActiveTab] = useState<'irp' | 'hut' | 'oregon'>('irp');

  // Multi-state weight calculators metrics standard models
  const [weightTier, setWeightTier] = useState<number>(80000); // GVW lbs
  const [nyHutMiles, setNyHutMiles] = useState<number>(1450);
  const [kyHutMiles, setKyHutMiles] = useState<number>(850);
  const [orMiles, setOrMiles] = useState<number>(3200);

  // Oregon Mileage Tax calculation engine based on weight scale tier
  // e.g., standard Oregon heavy load fee (80,000 lbs) is $0.1638 per mile
  const getOregonRate = (weight: number) => {
    if (weight <= 26000) return 0.0510;
    if (weight <= 50000) return 0.0980;
    if (weight <= 80000) return 0.1638;
    return 0.2240;
  };

  const orRate = getOregonRate(weightTier);
  const orTaxDue = orMiles * orRate;

  // New York HUT calculation engine
  // Standard NY HUT (80,000 lbs GVW) is $0.043 per mile
  const getNyHutRate = (weight: number) => {
    if (weight <= 50000) return 0.015;
    if (weight <= 80000) return 0.043;
    return 0.058;
  };
  const nyRate = getNyHutRate(weightTier);
  const nyTaxDue = nyHutMiles * nyRate;

  // Kentucky HUT (KIT / KYU weight-distance tax licensing)
  // Standard KYU rate (80,000 lbs+) is $0.0285 per mile
  const getKyHutRate = (weight: number) => {
    if (weight < 59999) return 0.0;
    return 0.0285;
  };
  const kyRate = getKyHutRate(weightTier);
  const kyTaxDue = kyHutMiles * kyRate;

  return (
    <div className="space-y-6" id="irp-hut-oregon-view">
      {/* Tab select bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-2 flex gap-2 shadow-sm" id="irp-modules-toggle">
        <button 
          onClick={() => setActiveTab('irp')}
          className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'irp' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Scale className="w-4 h-4" /> Apportioned IRP Registry
        </button>
        <button 
          onClick={() => setActiveTab('hut')}
          className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'hut' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Landmark className="w-4 h-4" /> NY & KY HUT Licenses
        </button>
        <button 
          onClick={() => setActiveTab('oregon')}
          className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'oregon' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Calculator className="w-4 h-4" /> Oregon Mileage Tax
        </button>
      </div>

      {/* RENDER CHOSEN COMPONENT PANEL */}
      {activeTab === 'irp' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="panel-irp">
          {/* IRP Registration Summary */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">International Registration Plan (IRP) Proportion Allocation</h3>
              <p className="text-xs text-gray-500">Distributes proportional registration plate fees across US jurisdictions based on regional travel density</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5">
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Account Status</span>
                <strong className="text-emerald-600 text-xs font-bold mt-1 block flex items-center gap-1">
                  <FileCheck className="w-4 h-4" /> Base Plate OK
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5">
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Registered Carrier Weight</span>
                <strong className="text-slate-700 text-xs font-mono font-bold mt-1 block">80,000 lbs (Heavy Semis)</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5">
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Authorized Jur. count</span>
                <strong className="text-slate-700 text-xs font-bold mt-1 block">48 States Apportioned</strong>
              </div>
            </div>

            {/* Jurisdiction density distribution */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider block">IRP Distance Percentages (Odometer audit sync)</span>
              
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-800 mb-1">
                    <span>Texas (Base State - TX)</span>
                    <span className="font-mono font-bold">51.1% (12,500 mi)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-950 rounded-full" style={{ width: '51.1%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-800 mb-1">
                    <span>California (CA)</span>
                    <span className="font-mono font-bold">27.8% (6,800 mi)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full" style={{ width: '27.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-800 mb-1">
                    <span>Oregon (OR)</span>
                    <span className="font-mono font-bold">13.1% (3,200 mi)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '13.1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Fee checklist alerts */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="irp-checklist">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">IRP Renewal & Decals</h4>
              <p className="text-xs text-gray-400">Carrier registration updates</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800 font-bold">Form IRP-100 Approved</strong>
                  <span className="text-gray-450">Transmitted apportioned ledger to TXDOT registry. Apportioned decals active.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800 font-bold">Cab Cards Download Ready</strong>
                  <span className="text-gray-450">Authorized credentials held online. Instantly syndicates across driver phones.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'hut' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="panel-hut">
          {/* NY and KY HUT detailed calculator */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">New York & Kentucky Weight Distance Tax (HUT)</h3>
              <p className="text-xs text-gray-500">Calculates county-level load taxes based on carrier empty-or-gross weight parameters</p>
            </div>

            <div className="space-y-4 pt-1.5">
              {/* Dynamic Weight controller */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-slate-800">Specify Gross Vehicle Weight Rating:</strong>
                  <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">{weightTier.toLocaleString()} lbs</span>
                </div>
                <input 
                  type="range" 
                  min={30000} 
                  max={85000} 
                  step={5000} 
                  value={weightTier} 
                  onChange={e=>setWeightTier(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
                  <span>30,000 lbs (Medium Haul)</span>
                  <span>80,000 lbs (Heavy Semi)</span>
                  <span>85,000 lbs (Oversized)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* NY HUT Module */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs text-slate-800 block">New York HUT Ledger (NYU)</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Rate/mi at GVW: ${nyRate.toFixed(3)}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">ACTIVE</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Logged NY transit miles:</span>
                      <input 
                        type="number" 
                        value={nyHutMiles} 
                        onChange={e=>setNyHutMiles(Number(e.target.value))}
                        className="w-20 border border-gray-200 text-right pr-2 rounded py-0.5 font-mono"
                      />
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                      <span>Estimated NY Tax Owed:</span>
                      <span className="font-mono text-slate-900">${nyTaxDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* KY HUT Module */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs text-slate-800 block">Kentucky HUT Register (KYU)</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Rate/mi at GVW: ${kyRate.toFixed(4)}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">ACTIVE</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Logged KY transit miles:</span>
                      <input 
                        type="number" 
                        value={kyHutMiles} 
                        onChange={e=>setKyHutMiles(Number(e.target.value))}
                        className="w-20 border border-gray-200 text-right pr-2 rounded py-0.5 font-mono"
                      />
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                      <span>Estimated KY Tax Owed:</span>
                      <span className="font-mono text-slate-900">${kyTaxDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Mexico checklist side */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="nm-wdt-panel">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">New Mexico WDT Registry</h4>
              <p className="text-xs text-gray-400">Weight-Distance registration checks</p>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-slate-800">State Account Code: <strong className="font-mono">NM-WDT-38192</strong></p>
              <p className="text-gray-450 leading-relaxed">New Mexico charges electronic quarterly distance fees for any operations exceeding 26,000 lbs. Current matching decals successfully filed.</p>
              <span className="text-[10px] text-emerald-800 font-bold block flex items-center gap-1">
                <FileCheck className="w-4 h-4Color shrink-0" /> Verified NM Decal status
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Oregon Mileage Tax detailed module */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="panel-oregon">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Oregon Highway Use Mileage Tax</h3>
              <p className="text-xs text-gray-500">Computes quarterly highway usage fees replacing standard state fuel taxes automatically</p>
            </div>

            <div className="space-y-4 pt-1.5">
              {/* Dynamic GVW info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-center md:border-r border-slate-200 py-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Oregon Rate Tiers</span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">${orRate.toFixed(4)} / mi</p>
                </div>
                <div className="text-center py-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Registered GVW Scale</span>
                  <p className="text-lg font-bold font-sans text-slate-900 mt-1">{weightTier.toLocaleString()} lbs</p>
                </div>
              </div>

              {/* Miles input and calculation results */}
              <div className="space-y-3.5 text-xs pt-1">
                <div className="flex justify-between items-center bg-white border border-slate-150 p-4 rounded-xl shadow-sm">
                  <div className="space-y-0.5">
                    <strong className="block text-slate-800">Calculated Oregon Miles</strong>
                    <span className="text-[11px] text-gray-400">Total transit miles recorded across Oregon state borders</span>
                  </div>
                  <input 
                    type="number" 
                    value={orMiles} 
                    onChange={e=>setOrMiles(Number(e.target.value))}
                    className="w-24 text-center border border-gray-200 font-bold font-mono text-xs rounded-lg py-1 px-2"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Consolidated Highway Tax due:</strong>
                  <span className="font-sans font-extrabold text-lg text-amber-700">${orTaxDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Oregon weight bonds details */}
          <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4" id="or-bond-card">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">Oregon Tax Exemption Rules</h4>
              <p className="text-xs text-gray-400">Compliance tax criteria</p>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-lg text-xs space-y-2">
              <p className="text-gray-450 leading-relaxed">Unlike IFTA members, Oregon utilizes a pure flat weight-distance fee structure. Commuting carriers must register a standard <strong>$2,000 security bond</strong> or run operations under single-visit temporary permits.</p>
              <div className="bg-emerald-100/30 text-emerald-800 border border-emerald-250 p-2.5 rounded-lg font-semibold block flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 shrink-0 text-emerald-600" /> Carrier Bond Verified Status
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
