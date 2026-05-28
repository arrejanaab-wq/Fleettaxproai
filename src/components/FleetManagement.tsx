/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Truck, Users, ShieldAlert, Plus, Edit, Trash2, CheckCircle, 
  X, Briefcase, FileText, Phone, Mail, FileCheck, CheckSquare, ShieldCheck, Scale 
} from 'lucide-react';
import { Vehicle, Driver } from '../types';

interface FleetManagementProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddVehicle: (v: Partial<Vehicle>) => Promise<void>;
  onEditVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onAddDriver: (d: Partial<Driver>) => Promise<void>;
  onEditDriver: (id: string, d: Partial<Driver>) => Promise<void>;
  onDeleteDriver: (id: string) => Promise<void>;
  onUpdateDriverCompliance: (driverId: string, field: string, value: string | boolean) => Promise<void>;
}

export default function FleetManagement({ 
  vehicles, 
  drivers, 
  onAddVehicle, 
  onEditVehicle,
  onDeleteVehicle,
  onAddDriver, 
  onEditDriver,
  onDeleteDriver,
  onUpdateDriverCompliance 
}: FleetManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // States for interactive new inputs
  const [newVehicle, setNewVehicle] = useState({
    unitNumber: '', vin: '', plateNumber: '', year: 2023, make: '', model: '',
    fuelType: 'Diesel' as 'Diesel' | 'Gasoline' | 'CNG', gvw: 80000, irpRegistered: true,
    insuranceExpiry: '2026-12-31'
  });

  const [newDriver, setNewDriver] = useState({
    name: '', cdlNumber: '', state: 'TX', expirationDate: '2027-12-31',
    medicalCertExpiry: '2026-12-31', phone: '', email: '', drugTestCompliant: true
  });

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddVehicle(newVehicle);
    setIsVehicleModalOpen(false);
    // Reset
    setNewVehicle({
      unitNumber: '', vin: '', plateNumber: '', year: 2023, make: '', model: '',
      fuelType: 'Diesel', gvw: 80000, irpRegistered: true, insuranceExpiry: '2026-12-31'
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      await onEditVehicle(editingVehicle.id, editingVehicle);
      setIsEditModalOpen(false);
      setEditingVehicle(null);
    }
  };

  const handleDeleteClick = async (id: string, unit: string) => {
    if (window.confirm(`Are you sure you want to remove Vehicle Unit ${unit}? This will purge all associated logs.`)) {
      await onDeleteVehicle(id);
    }
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setIsEditModalOpen(true);
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddDriver(newDriver);
    setIsDriverModalOpen(false);
    // Reset
    setNewDriver({
      name: '', cdlNumber: '', state: 'TX', expirationDate: '2027-12-31',
      medicalCertExpiry: '2026-12-31', phone: '', email: '', drugTestCompliant: true
    });
  };

  const handleEditDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      await onEditDriver(editingDriver.id, editingDriver);
      setIsEditDriverModalOpen(false);
      setEditingDriver(null);
    }
  };

  const handleDeleteDriverClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove Driver ${name}? This will purge all associated records.`)) {
      await onDeleteDriver(id);
    }
  };

  const openEditDriverModal = (d: Driver) => {
    setEditingDriver(d);
    setIsEditDriverModalOpen(true);
  };

  return (
    <div className="space-y-6" id="fleet-management-view">
      {/* Visual Sub Navigation Toggle bar */}
      <div className="flex border-b border-gray-100 items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSubTab('vehicles')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'vehicles' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500'
            }`}
            id="subtab-vehicles"
          >
            <Truck className="w-4 h-4" /> Heavy Vehicles ({vehicles.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('drivers')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'drivers' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500'
            }`}
            id="subtab-drivers"
          >
            <Users className="w-4 h-4" /> Driver Registry ({drivers.length})
          </button>
        </div>

        {/* Action Button */}
        {activeSubTab === 'vehicles' ? (
          <button 
            onClick={() => setIsVehicleModalOpen(true)}
            className="mb-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            id="btn-add-vehicle"
          >
            <Plus className="w-4 h-4" /> Register Vehicle
          </button>
        ) : (
          <button 
            onClick={() => setIsDriverModalOpen(true)}
            className="mb-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            id="btn-add-driver"
          >
            <Plus className="w-4 h-4" /> Enrol CDL Driver
          </button>
        )}
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeSubTab === 'vehicles' ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" id="vehicles-table-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Unit / Plate</th>
                <th className="py-3.5 px-4 font-bold">VIN Number</th>
                <th className="py-3.5 px-4 font-bold">Year Make Model</th>
                <th className="py-3.5 px-4 font-bold">GVW Rating</th>
                <th className="py-3.5 px-4 font-bold">IRP Registered</th>
                <th className="py-3.5 px-4 font-bold">Insurance Expiry</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-slate-900">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">Unit {v.unitNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono italic">{v.plateNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono select-all text-xs text-slate-600 font-medium">
                    {v.vin}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {v.year} {v.make} {v.model}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {v.gvw.toLocaleString()} lbs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.irpRegistered ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {v.irpRegistered ? <Scale className="w-3 h-3" /> : null}
                      {v.irpRegistered ? 'Apportioned' : 'Intrastate Only'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono ${
                      v.insuranceExpiry <= '2026-06-30' ? 'text-amber-600 font-bold' : 'text-slate-500'
                    }`}>
                      {v.insuranceExpiry}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                      v.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 
                      v.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(v)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-all"
                        title="Edit Vehicle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(v.id, v.unitNumber)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4" id="drivers-section-panel">
          {/* Driver List cards for easier CDL validation overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4 relative" id={`driver-card-${d.id}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold font-sans text-sm">
                      {d.name.split(' ').map(n=>n[0]).join('')}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{d.name}</h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5" /> {d.email} • <Phone className="w-3.5 h-3.5" /> {d.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wide px-2 py-0.5 rounded-md ${
                      d.status === 'On Trip' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      d.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {d.status}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditDriverModal(d)}
                        className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-all"
                        title="Edit Driver"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDriverClick(d.id, d.name)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Delete Driver"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CDL and compliance metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">CDL Number</span>
                    <strong className="text-slate-700 font-mono select-all font-bold">{d.cdlNumber} ({d.state})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Safety Performance</span>
                    <strong className={`block ${d.safetyScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {d.safetyScore}/100 Score ({d.violationsCount} violations)
                    </strong>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/50 pt-2 grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">CDL Expiry Date</span>
                      <strong className={`font-mono text-xs ${d.expirationDate <= '2026-07-31' ? 'text-red-600 font-extrabold' : 'text-slate-700'}`}>
                        {d.expirationDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Medical Examiner Card</span>
                      <strong className={`font-mono text-xs ${d.medicalCertExpiry <= '2026-05-31' ? 'text-red-600 font-extrabold' : 'text-slate-700'}`}>
                        {d.medicalCertExpiry}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Compliance actions */}
                <div className="flex gap-2 justify-end pt-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newExpiry = prompt("Enter new CDL Expiration Date (YYYY-MM-DD):", d.expirationDate);
                        if (newExpiry) onUpdateDriverCompliance(d.id, 'cdlExpiry', newExpiry);
                      }}
                      className="text-[10px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded"
                    >
                      Renew CDL
                    </button>
                    <button 
                      onClick={() => {
                        const newMedExpiry = prompt("Enter new Medical Card Expiry (YYYY-MM-DD):", d.medicalCertExpiry);
                        if (newMedExpiry) onUpdateDriverCompliance(d.id, 'medicalCertExpiry', newMedExpiry);
                      }}
                      className="text-[10px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded"
                    >
                      Renew Med List
                    </button>
                  </div>
                  
                  <div className="flex-1 flex justify-end">
                    <button 
                      onClick={() => onUpdateDriverCompliance(d.id, 'drugTestCompliant', !d.drugTestCompliant)}
                      className={`text-[10px] font-extrabold uppercase rounded px-3 py-1 flex items-center gap-1 ${
                        d.drugTestCompliant 
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {d.drugTestCompliant ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {d.drugTestCompliant ? 'Drug Clear' : 'Lapsed Test'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTER VEHICLE MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-slate-800 text-sm">Register Fleet Heavy Vehicle</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-gray-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleVehicleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Unit Number</label>
                  <input required type="text" placeholder="e.g. 101" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.unitNumber} onChange={e=>setNewVehicle({...newVehicle, unitNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Plate Number</label>
                  <input required type="text" placeholder="e.g. TX-48M9" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.plateNumber} onChange={e=>setNewVehicle({...newVehicle, plateNumber: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">VIN Number (17 digits)</label>
                <input required type="text" placeholder="e.g. 1XPBD49X1ND293..." className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono" value={newVehicle.vin} onChange={e=>setNewVehicle({...newVehicle, vin: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Year</label>
                  <input required type="number" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.year} onChange={e=>setNewVehicle({...newVehicle, year: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Make</label>
                  <input required type="text" placeholder="Peterbilt" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.make} onChange={e=>setNewVehicle({...newVehicle, make: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Model</label>
                  <input required type="text" placeholder="579" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.model} onChange={e=>setNewVehicle({...newVehicle, model: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Fuel Type</label>
                  <select className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.fuelType} onChange={e=>setNewVehicle({...newVehicle, fuelType: e.target.value as any})}>
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">GVW Weight (lbs)</label>
                  <input required type="number" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newVehicle.gvw} onChange={e=>setNewVehicle({...newVehicle, gvw: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input type="checkbox" checked={newVehicle.irpRegistered} onChange={e=>setNewVehicle({...newVehicle, irpRegistered: e.target.checked})} className="rounded text-slate-800" />
                  Apportioned IRP Registered Vehicle
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-4 py-2 border border-gray-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-lg font-bold">Register heavy vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE MODAL */}
      {isEditModalOpen && editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-slate-800 text-sm">Update Vehicle Unit {editingVehicle.unitNumber}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Unit Number</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.unitNumber} onChange={e=>setEditingVehicle({...editingVehicle, unitNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Plate Number</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.plateNumber} onChange={e=>setEditingVehicle({...editingVehicle, plateNumber: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">VIN Number</label>
                <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono" value={editingVehicle.vin} onChange={e=>setEditingVehicle({...editingVehicle, vin: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Year</label>
                  <input required type="number" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.year} onChange={e=>setEditingVehicle({...editingVehicle, year: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Make</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.make} onChange={e=>setEditingVehicle({...editingVehicle, make: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Model</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.model} onChange={e=>setEditingVehicle({...editingVehicle, model: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Fuel Type</label>
                  <select className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.fuelType} onChange={e=>setEditingVehicle({...editingVehicle, fuelType: e.target.value as any})}>
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Status</label>
                  <select className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingVehicle.status} onChange={e=>setEditingVehicle({...editingVehicle, status: e.target.value as any})}>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input type="checkbox" checked={editingVehicle.irpRegistered} onChange={e=>setEditingVehicle({...editingVehicle, irpRegistered: e.target.checked})} className="rounded text-slate-800" />
                  Apportioned IRP Registered Vehicle
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-lg font-bold">Update Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER DRIVER MODAL */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-slate-800 text-sm">Enrol CDL Operator</h3>
              <button onClick={() => setIsDriverModalOpen(false)} className="text-gray-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDriverSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Driver's Full Name</label>
                <input required type="text" placeholder="e.g. Johnathan Doe" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newDriver.name} onChange={e=>setNewDriver({...newDriver, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">CDL License Number</label>
                  <input required type="text" placeholder="License code..." className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono uppercase" value={newDriver.cdlNumber} onChange={e=>setNewDriver({...newDriver, cdlNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">State License</label>
                  <input required type="text" placeholder="TX" maxLength={2} className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono uppercase" value={newDriver.state} onChange={e=>setNewDriver({...newDriver, state: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Contact Phone</label>
                  <input required type="text" placeholder="(555) 0192-238" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newDriver.phone} onChange={e=>setNewDriver({...newDriver, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Driver Email Address</label>
                  <input required type="email" placeholder="jdoe@fleetpro.com" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newDriver.email} onChange={e=>setNewDriver({...newDriver, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">CDL Expiration Date</label>
                  <input required type="date" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newDriver.expirationDate} onChange={e=>setNewDriver({...newDriver, expirationDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Medical Cert Expiration</label>
                  <input required type="date" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={newDriver.medicalCertExpiry} onChange={e=>setNewDriver({...newDriver, medicalCertExpiry: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsDriverModalOpen(false)} className="px-4 py-2 border border-gray-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-lg font-bold">Enrol CDL Operator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {isEditDriverModalOpen && editingDriver && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-slate-800 text-sm">Update Driver: {editingDriver.name}</h3>
              <button onClick={() => setIsEditDriverModalOpen(false)} className="text-gray-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditDriverSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Driver's Full Name</label>
                <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.name} onChange={e=>setEditingDriver({...editingDriver, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">CDL License Number</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono uppercase" value={editingDriver.cdlNumber} onChange={e=>setEditingDriver({...editingDriver, cdlNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">State License</label>
                  <input required type="text" maxLength={2} className="w-full text-xs border border-gray-200 p-2 rounded-lg font-mono uppercase" value={editingDriver.state} onChange={e=>setEditingDriver({...editingDriver, state: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Contact Phone</label>
                  <input required type="text" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.phone} onChange={e=>setEditingDriver({...editingDriver, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Driver Email Address</label>
                  <input required type="email" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.email} onChange={e=>setEditingDriver({...editingDriver, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">CDL Expiration Date</label>
                  <input required type="date" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.expirationDate} onChange={e=>setEditingDriver({...editingDriver, expirationDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Medical Cert Expiration</label>
                  <input required type="date" className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.medicalCertExpiry} onChange={e=>setEditingDriver({...editingDriver, medicalCertExpiry: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Status</label>
                  <select className="w-full text-xs border border-gray-200 p-2 rounded-lg" value={editingDriver.status} onChange={e=>setEditingDriver({...editingDriver, status: e.target.value as any})}>
                    <option value="Ready">Ready</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditDriverModalOpen(false)} className="px-4 py-2 border border-gray-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-lg font-bold">Update Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
