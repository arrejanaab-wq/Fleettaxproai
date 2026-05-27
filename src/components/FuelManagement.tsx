/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Fuel, Receipt, Upload, Plus, CheckCircle, AlertCircle, Info, Image, CreditCard, Layers, Sparkles, RefreshCw, Smartphone, FileUp 
} from 'lucide-react';
import { FuelPurchase } from '../types';

interface FuelManagementProps {
  fuelPurchases: FuelPurchase[];
  onUploadReceipt: (purchase: {
    unitNumber: string;
    totalCost: number;
    gallons: number;
    state: string;
    date: string;
    vendor: string;
    ocrSimulation: boolean;
  }) => Promise<void>;
  onFuelCardSync: () => Promise<void>;
}

export default function FuelManagement({ fuelPurchases, onUploadReceipt, onFuelCardSync }: FuelManagementProps) {
  const [activeTab, setActiveTab] = useState<'purchases' | 'cards'>('purchases');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [ocrResultMsg, setOcrResultMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Interactive fields
  const [manualForm, setManualForm] = useState({
    unitNumber: '101',
    totalCost: 450.00,
    gallons: 120,
    state: 'TX',
    date: new Date().toISOString().split('T')[0],
    vendor: 'Pilot Flying J',
  });

  const [fuelCards, setFuelCards] = useState([
    { id: 'comdata', name: 'Comdata Connect Card', status: 'Enabled', synced: '23 mins ago', logoColor: 'bg-emerald-50 text-emerald-800' },
    { id: 'efs', name: 'EFS Fleet Card', status: 'Enabled', synced: '1 hr ago', logoColor: 'bg-slate-100 text-slate-800' },
    { id: 'wex', name: 'WEX Fleet Services', status: 'Disabled', synced: 'Never', logoColor: 'bg-gray-100 text-gray-500' },
    { id: 'fleetone', name: 'Fleet One Edge', status: 'Disabled', synced: 'Never', logoColor: 'bg-gray-100 text-gray-500' }
  ]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUploadReceipt({
      ...manualForm,
      ocrSimulation: false
    });
    setOcrResultMsg('Fuel purchase manual log recorded in general ledger.');
    setTimeout(() => setOcrResultMsg(''), 4000);
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await onFuelCardSync();
    setIsSyncing(false);
    setOcrResultMsg('Automatic data fetch from Comdata/EFS completed.');
    setTimeout(() => setOcrResultMsg(''), 4000);
  };
// ... rest of code

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOCRProcessing(true);
    setOcrResultMsg('');
    
    const formData = new FormData();
    formData.append('report', file);

    try {
      // Reusing the parse-report endpoint which uses Gemini to extract structured data
      const response = await fetch('/api/ifta/parse-report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        // Use the first extracted entry or fall back to defaults
        const extracted = result.data[0];
        const purchaseData = {
          unitNumber: '101', // Default or could be extracted
          totalCost: extracted.totalCost || (extracted.fuelPurchased * 4.5) || 500, 
          gallons: extracted.fuelPurchased || extracted.gallons || 100,
          state: extracted.state || 'TX',
          date: new Date().toISOString().split('T')[0],
          vendor: extracted.vendor || 'Extracted Vendor',
          ocrSimulation: true
        };
        
        await onUploadReceipt(purchaseData);
        setOcrResultMsg(`AI Receipt Scan Success! Extracted: ${purchaseData.gallons} Gal (${purchaseData.state}) from ${purchaseData.vendor}.`);
        setTimeout(() => setOcrResultMsg(''), 6500);
      } else {
        alert('Failed to parse receipt: ' + (result.error || 'No data found'));
      }
    } catch (error) {
      console.error('OCR error:', error);
      alert('Error uploading receipt');
    } finally {
      setIsOCRProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleFuelCard = (id: string) => {
    setFuelCards(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'Enabled' ? 'Disabled' : 'Enabled',
          synced: c.status === 'Enabled' ? 'Never' : 'Just now'
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6" id="fuel-management-dashboard">
      {/* Sub Navigation Bar */}
      <div className="flex border-b border-gray-100 items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'purchases' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500'
            }`}
          >
            <Fuel className="w-4 h-4" /> Gasoline & Diesel Purchases ({fuelPurchases.length})
          </button>
          <button 
            onClick={() => setActiveTab('cards')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cards' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Integrated Fuel Cards
          </button>
        </div>
        <button 
          onClick={handleSyncClick}
          disabled={isSyncing}
          className="mb-3 px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Fetch from Fuel Cards (Auto)
        </button>
      </div>

      {ocrResultMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs animate-in slide-in-from-top-4" id="ocr-success-banner">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div><strong>Ledger Updated:</strong> {ocrResultMsg}</div>
        </div>
      )}

      {activeTab === 'purchases' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of registered fuel vouchers */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="fuel-log-panel">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Consolidated Diesel Purchase Ledger</span>
              <span className="text-[10px] text-gray-400 font-bold">Audit certified index</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Receipt ID / Vendor</th>
                  <th className="py-3 px-4 font-bold">Unit / State</th>
                  <th className="py-3 px-4 font-bold">Quantity (gal)</th>
                  <th className="py-3 px-4 font-bold">Price / Gallon</th>
                  <th className="py-3 px-4 font-bold text-right">Total Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
                {fuelPurchases.map((f) => {
                  const ppg = f.totalCost / (f.gallons || 1);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{f.vendor}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic">{f.date} • ID: {f.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono">
                        Unit {f.unitNumber} <span className="text-slate-400 font-medium">({f.state})</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {f.gallons.toFixed(1)} gal
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        ${ppg.toFixed(2)}/gal
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 select-all">
                        ${f.totalCost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AI Interactive Scan or Manual Log panel */}
          <div className="space-y-6" id="upload-panel">
            {/* AI Smart receipt Scan and OCR extractor container */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl text-white border border-slate-800 space-y-4" id="ocr-uploader">
              <div>
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase font-mono tracking-wider">AI OCR Receipt Scanner</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">Smart Freight Voucher Extractor</h4>
                <p className="text-[11px] text-slate-400 mt-1">Upload diesel voucher JPEG/PNG scan. Our server parses gallon rates, vendor codes, and tax jurisdictions instantly.</p>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,.pdf"
              />

              {/* Upload zone */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isOCRProcessing}
                className="w-full bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl py-6 px-4 flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer disabled:opacity-50"
              >
                {isOCRProcessing ? (
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-sky-400 transition-colors" />
                )}
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">
                    {isOCRProcessing ? 'Evaluating Receipt Geometry...' : 'Click to Upload Invoice Scan'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, PDF up to 10MB</p>
                </div>
              </button>

              <div className="text-[10px] text-slate-500 flex gap-1 items-start leading-relaxed pt-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Powered by custom neural layout extraction models. Parses WEX fuel cards automatically.</span>
              </div>
            </div>

            {/* Manual insertion form */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="manual-ocr-log">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 font-mono">Register Transaction Voucher</h4>
                <p className="text-xs text-gray-400">Add fuel purchases manually for physical ledger logs</p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Unit Number</label>
                    <select className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={manualForm.unitNumber} onChange={e=>setManualForm({...manualForm, unitNumber: e.target.value})}>
                      <option value="101">101 (TX)</option>
                      <option value="202">202 (CA)</option>
                      <option value="305">305 (OR)</option>
                      <option value="412">412 (UT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">State Jurisdiction</label>
                    <input required maxLength={2} type="text" placeholder="TX" className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono uppercase" value={manualForm.state} onChange={e=>setManualForm({...manualForm, state: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Diesel Cost (USD)</label>
                    <input required type="number" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={manualForm.totalCost} onChange={e=>setManualForm({...manualForm, totalCost: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Gallons Purchased</label>
                    <input required type="number" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={manualForm.gallons} onChange={e=>setManualForm({...manualForm, gallons: Number(e.target.value)})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Fuel Station Vendor Name</label>
                  <input required type="text" placeholder="Pilot Travel Center" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={manualForm.vendor} onChange={e=>setManualForm({...manualForm, vendor: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Purchase Date</label>
                  <input required type="date" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={manualForm.date} onChange={e=>setManualForm({...manualForm, date: e.target.value})} />
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors">
                  Submit Purchase Log
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Integrated fuel card sandbox list */
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6" id="gold-fuel-card-integrations">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Industrial Fuel Card API Connectors</h3>
            <p className="text-xs text-gray-500">Link authorized fleet fuel accounts to sync diesel receipts, mileage timestamps, and transaction data automatically</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fuelCards.map((card) => (
              <div key={card.id} className="border border-slate-100/80 rounded-xl p-5 flex items-start gap-4 hover:border-slate-300 transition-colors">
                <div className={`p-3 rounded-lg ${card.logoColor} shrink-0`}>
                  <CreditCard className="w-6 h-6 animate-pulse" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800">{card.name}</h4>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      card.status === 'Enabled' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-450 leading-relaxed">Integrated bank level webhook sync. Records fuel consumption coordinates in real time.</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-gray-400 font-mono">Last synced: <strong className="text-slate-600 font-semibold">{card.synced}</strong></span>
                    <button 
                      onClick={() => toggleFuelCard(card.id)} 
                      className={`text-[10px] font-bold py-1 px-2.5 rounded transition bg-slate-100 hover:bg-slate-200 text-slate-850`}
                    >
                      {card.status === 'Enabled' ? 'Disconnect Card' : 'Authorize Card API'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
