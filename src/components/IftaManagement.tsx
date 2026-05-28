/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, Calculator, CheckCircle2, ChevronRight, FileDown, AlertCircle, Info, Landmark, Edit, RefreshCw, Upload, FileUp, Trash2, Plus, Truck, Save
} from 'lucide-react';
import { Vehicle, FuelPurchase, StateMileage, TaxRate } from '../types';

interface ExtendedStateMileage extends StateMileage {
  unitNumber: string;
}

interface IftaManagementProps {
  vehicles: Vehicle[];
  fuelPurchases: FuelPurchase[];
  taxRates: TaxRate[];
  mileageLogs: { unitNumber: string; state: string; miles: number; fuelPurchased: number }[];
  onUpdateMileageLogs: (logs: any[]) => Promise<void>;
  onFuelCardSync: () => Promise<void>;
}

export default function IftaManagement({ 
  vehicles, 
  fuelPurchases, 
  taxRates, 
  mileageLogs,
  onUpdateMileageLogs,
  onFuelCardSync 
}: IftaManagementProps) {
  const [activeQuarter, setActiveQuarter] = useState<'Q2-2026' | 'Q1-2026'>('Q2-2026');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('All Units');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. State for mileage data (initialized from props)
  const [stateMileages, setStateMileages] = useState<ExtendedStateMileage[]>([]);

  useEffect(() => {
    if (mileageLogs && mileageLogs.length > 0) {
      setStateMileages(mileageLogs.map(log => ({
        unitNumber: log.unitNumber,
        state: log.state,
        taxableMiles: log.miles,
        tollMiles: 0,
        nonTollMiles: log.miles,
        fuelPurchased: log.fuelPurchased
      })));
    }
  }, [mileageLogs]);

  const handleFuelSync = async () => {
    setIsSyncing(true);
    await onFuelCardSync();
    setIsSyncing(false);
    setSuccessMsg('Fuel card data synchronized for all units.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSaveMatrix = async () => {
    setIsSaving(true);
    const logsToSave = stateMileages.map(m => ({
      unitNumber: m.unitNumber,
      state: m.state,
      miles: Number(m.taxableMiles),
      fuelPurchased: Number(m.fuelPurchased)
    }));
    await onUpdateMileageLogs(logsToSave);
    setIsSaving(false);
    setSuccessMsg('IFTA mileage matrix saved to ledger.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Filter logic
  const filteredData = selectedUnit === 'All Units' 
    ? stateMileages 
    : stateMileages.filter(m => m.unitNumber === selectedUnit);

  const totalMiles = filteredData.reduce((acc, m) => acc + (Number(m.taxableMiles) || 0), 0);
  const totalFuelPurchased = filteredData.reduce((acc, m) => acc + (Number(m.fuelPurchased) || 0), 0);
  
  // Fleet/Unit MPG
  const fleetMpg = totalFuelPurchased > 0 ? Number((totalMiles / totalFuelPurchased).toFixed(2)) : 0;

  // Calculation data per state for the selected view
  const calculationData = filteredData.map(m => {
    const matchRate = taxRates.find(r => r.stateCode === m.state);
    const rate = matchRate ? matchRate.taxRate : 0.20;
    const fuelConsumed = fleetMpg > 0 ? Number((m.taxableMiles / fleetMpg).toFixed(2)) : 0;
    const taxableGallons = Number((fuelConsumed - m.fuelPurchased).toFixed(2));
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('report', file);

    try {
      const response = await fetch('/api/ifta/parse-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const result = await response.json();
      if (result.success && result.data) {
        const newMileages = result.data.map((item: any) => ({
          unitNumber: item.unitNumber || 'Unknown',
          state: item.state || 'XX',
          taxableMiles: Number(item.taxableMiles) || 0,
          tollMiles: 0,
          nonTollMiles: Number(item.taxableMiles) || 0,
          fuelPurchased: Number(item.fuelPurchased) || 0
        }));
        setStateMileages([...stateMileages, ...newMileages]);
        setSuccessMsg(`Extracted data for units: ${[...new Set(newMileages.map((m: any) => m.unitNumber))].join(', ')}`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Failed to parse report: ' + (result.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateStateValue = (index: number, field: keyof ExtendedStateMileage, value: string) => {
    const newList = [...stateMileages];
    const targetObj = filteredData[index];
    const actualIndex = stateMileages.indexOf(targetObj);

    if (actualIndex === -1) return;

    if (field === 'state' || field === 'unitNumber') {
      newList[actualIndex][field] = value.toUpperCase();
    } else {
      newList[actualIndex][field] = Number(value) as any;
    }
    setStateMileages(newList);
  };

  const addRow = () => {
    const newRow: ExtendedStateMileage = { 
      unitNumber: selectedUnit === 'All Units' ? '101' : selectedUnit, 
      state: '', 
      taxableMiles: 0, 
      tollMiles: 0, 
      nonTollMiles: 0, 
      fuelPurchased: 0 
    };
    setStateMileages([...stateMileages, newRow]);
  };

  const removeRow = (index: number) => {
    const targetObj = filteredData[index];
    const actualIndex = stateMileages.indexOf(targetObj);
    if (actualIndex !== -1) {
        setStateMileages(stateMileages.filter((_, i) => i !== actualIndex));
    }
  };

  const triggerMockFiling = () => {
    setSuccessMsg('IFTA filing package successfully queued for all units.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Get unique units for selector
  const uniqueUnits = ['All Units', ...new Set(stateMileages.map(m => m.unitNumber))];

  return (
    <div className="space-y-6" id="ifta-reporting-view">
      {/* Visual head details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm" id="ifta-heading">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Truck className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-sm">Unit-Specific IFTA Filing Odometer</h3>
                <p className="text-xs text-gray-500">Separated carrier liability matrices by vehicle unit</p>
            </div>
        </div>

        <div className="flex gap-2">
          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-1.5 focus:ring-0"
          >
            {uniqueUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.xlsx,.xls,.docx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all disabled:opacity-50"
          >
            {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
            Import Unit Log
          </button>

          <button 
            onClick={handleFuelSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync Fuel Card Data
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs animate-in fade-in slide-in-from-top-4 duration-300" id="success-filing-msg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div><strong>Success:</strong> {successMsg}</div>
        </div>
      )}

      {/* IFTA Formula Steps */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calculator className="w-32 h-32" />
        </div>
        
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500" /> {selectedUnit === 'All Units' ? 'Consolidated Fleet' : `Unit ${selectedUnit}`} Calculation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Unit Miles</span>
            <div className="text-xl font-extrabold">{totalMiles.toLocaleString()}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Fuel Purchased</span>
            <div className="text-xl font-extrabold">{totalFuelPurchased.toLocaleString()} Gal</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">{selectedUnit === 'All Units' ? 'Fleet Average MPG' : 'Unit MPG'}</span>
            <div className="text-2xl font-black text-emerald-400">{fleetMpg} <small className="text-xs font-normal text-slate-400">MPG</small></div>
          </div>

          <div className="space-y-1 border-l border-slate-800 pl-6">
            <span className="text-[10px] text-amber-500 font-bold uppercase block">Net Tax Settlement</span>
            <div className={`text-2xl font-black ${netTaxDueSum > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
              {netTaxDueSum > 0 ? `$${netTaxDueSum.toFixed(2)}` : `-$${Math.abs(netTaxDueSum).toFixed(2)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown matrix table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="ifta-density-table">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <strong className="text-xs text-slate-800 uppercase tracking-wider font-extrabold font-mono">
            {selectedUnit === 'All Units' ? 'Consolidated Fleet Matrix' : `State Liability for Unit ${selectedUnit}`}
          </strong>
          <div className="flex gap-2">
            <button 
              onClick={addRow}
              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center gap-1 font-bold hover:bg-slate-200 transition-all"
            >
              <Plus className="w-3 h-3" /> Add State Entry
            </button>
            <button 
              onClick={handleSaveMatrix}
              disabled={isSaving}
              className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded flex items-center gap-1 font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 
              Save Matrix
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Unit #</th>
                <th className="py-3 px-4 font-bold">State</th>
                <th className="py-3 px-4 font-bold">Taxable Miles</th>
                <th className="py-3 px-4 font-bold">Purchased Gal</th>
                <th className="py-3 px-4 font-bold text-slate-800">Consumed</th>
                <th className="py-3 px-4 font-bold">Taxable Gal</th>
                <th className="py-3 px-4 font-bold">Rate</th>
                <th className="py-3 px-4 font-bold text-right">Tax Due</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
              {calculationData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <input 
                      className="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none font-bold font-mono"
                      value={item.unitNumber}
                      onChange={(e) => updateStateValue(index, 'unitNumber', e.target.value)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      className="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none font-bold font-mono uppercase"
                      value={item.state}
                      onChange={(e) => updateStateValue(index, 'state', e.target.value)}
                      placeholder="XX"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="number"
                      className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none font-mono"
                      value={item.taxableMiles}
                      onChange={(e) => updateStateValue(index, 'taxableMiles', e.target.value)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="number"
                      className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none font-mono"
                      value={item.fuelPurchased}
                      onChange={(e) => updateStateValue(index, 'fuelPurchased', e.target.value)}
                    />
                  </td>
                  <td className="py-3 px-4 font-bold font-mono text-slate-700 bg-slate-50/50">
                    {item.fuelConsumed.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {item.taxableGallons.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-600">
                    ${item.rate.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-bold ${
                      item.taxDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {item.taxDue > 0 ? `+$${item.taxDue.toFixed(2)}` : `-$${Math.abs(item.taxDue).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => removeRow(index)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2" id="ifta-actions-row">
        <button 
          onClick={triggerMockFiling}
          className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-slate-200"
          id="submit-state-filing-btn"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Submit Quarterly Filing ({selectedUnit})
        </button>
      </div>
    </div>
  );
}
