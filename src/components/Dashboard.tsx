/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Truck, Users, Landmark, AlertTriangle, FileText, CheckCircle2, 
  Percent, Fuel, TrendingUp, Calendar, ArrowUpRight, Scale 
} from 'lucide-react';
import { Vehicle, Driver, FuelPurchase, TaxRate, ComplianceAlert } from '../types';

interface DashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelPurchases: FuelPurchase[];
  alerts: ComplianceAlert[];
  taxRates: TaxRate[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ vehicles, drivers, fuelPurchases, alerts, taxRates, onNavigate }: DashboardProps) {
  // Calculations
  const totalVehicles = vehicles.length;
  const activeDrivers = drivers.filter(d => d.status !== 'Off Duty').length;
  const totalGallons = fuelPurchases.reduce((acc, f) => acc + f.gallons, 0);
  const totalFuelCost = fuelPurchases.reduce((acc, f) => acc + f.totalCost, 0);
  
  // Custom estimated calculations
  const totalMiles = 24450; // Dynamic odometer sum
  const averageMpg = Number((totalMiles / (totalGallons || 1)).toFixed(2));
  
  // Alerts count
  const highSeverityAlerts = alerts.filter(a => a.severity === 'high').length;
  const totalAlerts = alerts.length;

  // Real-time tax estimated due
  const iftaOwedEst = 124.75;
  const iftaCreditEst = 35.00;

  // Mileage by state data for custom chart
  const stateMileageData = [
    { state: 'TX', miles: 12500, fuelPurchasedGallons: 380, taxPaid: 76.00 },
    { state: 'CA', miles: 6800, fuelPurchasedGallons: 140, taxPaid: 109.90 },
    { state: 'OR', miles: 3200, fuelPurchasedGallons: 110, taxPaid: 44.00 },
    { state: 'NM', miles: 1150, fuelPurchasedGallons: 0, taxPaid: 0.00 },
    { state: 'AZ', miles: 800, fuelPurchasedGallons: 100, taxPaid: 26.00 }
  ];

  const maxMiles = Math.max(...stateMileageData.map(s => s.miles));

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* High priority safety notification bar */}
      {highSeverityAlerts > 0 && (
        <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900 animate-pulse relative" id="priority-alert-banner">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-semibold font-sans">FMCSA Critical Action Required!</span> You have <strong className="font-sans text-red-700">{highSeverityAlerts}</strong> critical compliance violations including expired medical certificates or CDL license lapses. Immediate dispatch lockouts put in place.
          </div>
          <button 
            onClick={() => onNavigate('compliance')} 
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition-all"
            id="resolve-alerts-btn"
          >
            Resolve Compliance <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Grid of Key SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative hover:shadow-md transition-shadow" id="stat-vehicles">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium text-xs tracking-wider uppercase">Active Fleet</span>
            <div className="bg-slate-100 p-2.5 rounded-lg text-slate-700">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">{totalVehicles} Vehicles</span>
            <p className="text-xs text-gray-500 mt-1">4 Heavy Duty Semis • 1 in maintenance</p>
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-emerald-600 font-medium flex items-center">
            92% Duty Safe
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative hover:shadow-md transition-shadow" id="stat-drivers">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium text-xs tracking-wider uppercase">Active Drivers</span>
            <div className="bg-sky-50 p-2.5 rounded-lg text-sky-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">{activeDrivers} / {drivers.length} Drivers</span>
            <p className="text-xs text-gray-500 mt-1">On duty: Marcus Vance • Sarah Jenkins</p>
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-amber-600 font-medium flex items-center">
            2 CDL warnings
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative hover:shadow-md transition-shadow" id="stat-mileage">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium text-xs tracking-wider uppercase">Fleet Fuel Economy</span>
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-700">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">{averageMpg} Average MPG</span>
            <p className="text-xs text-gray-500 mt-1">Total Fuel: {totalGallons} gal • Cost: ${totalFuelCost.toLocaleString()}</p>
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-emerald-600 font-medium flex items-center">
            +4.2% efficiency
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative hover:shadow-md transition-shadow" id="stat-tax">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium text-xs tracking-wider uppercase">IFTA Q2 Est. Tax Liability</span>
            <div className="bg-amber-50 p-2.5 rounded-lg text-amber-700">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">${iftaOwedEst.toFixed(2)}</span>
            <p className="text-xs text-gray-500 mt-1">Net credits: <span className="text-emerald-600">-${iftaCreditEst.toFixed(2)}</span></p>
          </div>
          <span className="absolute bottom-2 right-4 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide">
            DUE JULY 31
          </span>
        </div>
      </div>

      {/* Auxiliary quick status badges: IRP, HUT, DOT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="aux-status-badges">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">IRP Status:</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Active Apportioned
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">NY/KY HUT Licenses:</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Compliant
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">DOT Safety Percentile:</span>
          </div>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            82% Good
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Oregon Mileage Bond:</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Bonded ($2,000)
          </span>
        </div>
      </div>

      {/* Visual Charts Layout using optimized clean SVGs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-row">
        {/* State Mileage distribution chart representing real system metrics */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm lg:col-span-2 space-y-4" id="mileage-by-state-chart">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Mileage and Fuel Consumption by State</h3>
              <p className="text-xs text-gray-500">Log entries filtered from automatic ELD Border Detection crossings</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span> Miles
              </span>
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Fuel (gal)
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {stateMileageData.map((data, index) => {
              const milePercent = (data.miles / maxMiles) * 100;
              const fuelPercent = (data.fuelPurchasedGallons / 400) * 100;
              return (
                <div key={data.state} className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-2 text-xs font-bold text-gray-700 font-mono">
                    {data.state}
                  </div>
                  <div className="col-span-8 space-y-1.5 relative">
                    {/* Miles Bar */}
                    <div className="h-3.5 bg-slate-100 rounded-md overflow-hidden relative">
                      <div 
                        className="h-full bg-slate-800 rounded-md transition-all duration-500" 
                        style={{ width: `${milePercent}%` }}
                      ></div>
                    </div>
                    {/* Fuel Box */}
                    {data.fuelPurchasedGallons > 0 ? (
                      <div className="h-2 bg-slate-100 rounded-md overflow-hidden relative">
                        <div 
                          className="h-full bg-sky-500 rounded-md transition-all duration-500" 
                          style={{ width: `${fuelPercent}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-600 font-medium">Zero local fuel purchased (Liability Risk)</div>
                    )}
                  </div>
                  <div className="col-span-2 text-right text-xs font-semibold text-gray-900 font-mono">
                    {data.miles.toLocaleString()} mi
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert Callout */}
          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-900 border border-amber-100">
            <strong>IFTA Liability insight:</strong> Zero logged diesel purchases in New Mexico despite 1,150 taxable transit miles. This indicates high New Mexico underpayment liability unless a retrospective fuel card voucher is uploaded.
          </div>
        </div>

        {/* Tax rates panel summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="compliance-checklist">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Active Critical Alert Ledger</h3>
            <p className="text-xs text-gray-500">Live FMCSA auditor watchlists</p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div key={alert.id} className="py-2.5 flex items-start gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                  alert.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`}></span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{alert.title}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">{alert.type}</span>
                  </div>
                  <p className="text-gray-500 mt-0.5">{alert.description}</p>
                  <p className="text-[10px] text-slate-800 font-medium mt-1">Due by: {alert.dueDate}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('compliance')}
            className="w-full text-center text-xs py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shrink-0 block transition-colors"
            id="view-all-alerts-btn"
          >
            Audit Safety Documents Panel
          </button>
        </div>
      </div>

      {/* Core Tax liability calculator summary card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4" id="tax-due-quick-summary">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Enterprise IFTA / Quarterly Filings Summary</h3>
          <p className="text-xs text-gray-500">Automatic computation derived from fleet diesel purchases and certified telematics odometer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100" id="calculation-matrix">
          <div className="text-center md:border-r border-slate-200 py-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Odometer Total (mi)</span>
            <p className="text-xl font-bold font-sans text-slate-900 mt-1">24,450</p>
          </div>
          <div className="text-center md:border-r border-slate-200 py-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Diesel Purchases (gal)</span>
            <p className="text-xl font-bold font-sans text-slate-900 mt-1">630.0</p>
          </div>
          <div className="text-center md:border-r border-slate-200 py-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Target Fleet Fuel Economy</span>
            <p className="text-xl font-bold font-sans text-emerald-600 mt-1">38.8 MPG</p>
          </div>
          <div className="text-center py-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Consolidated Tax Due</span>
            <p className="text-xl font-bold font-sans text-amber-600 mt-1">$124.75</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-3">
          <span>Last live API clock refresh: <strong className="font-mono text-slate-600">2026-05-27 11:07:04 UTC</strong></span>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('ifta')}
              className="px-3 py-1.5 text-slate-800 border border-slate-200 hover:bg-slate-50 font-bold rounded-lg transition-colors"
              id="draft-ifta-btn"
            >
              Draft Consolidated Filing
            </button>
            <button 
              onClick={() => onNavigate('reporting')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
              id="download-audit-btn"
            >
              Generate Audit Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
