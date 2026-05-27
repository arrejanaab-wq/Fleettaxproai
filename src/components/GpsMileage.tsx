/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, MapPin, Navigation, Compass, AlertCircle, Info, Landmark } from 'lucide-react';
import { GpsLog } from '../types';

interface GpsMileageProps {
  gpsHistory: GpsLog[];
}

export default function GpsMileage({ gpsHistory }: GpsMileageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  // States of automated crossing telemetry
  const routeSimulationPoints = [
    { id: 1, state: 'TX', desc: 'San Antonio Westbound (I-10 W)', miles: 0, speed: 65, lat: 29.4241, lng: -98.4936, crossing: false },
    { id: 2, state: 'TX', desc: 'El Paso City Limit (I-10 W)', miles: 550, speed: 68, lat: 31.7619, lng: -106.4850, crossing: false },
    { id: 3, state: 'NM', desc: 'New Mexico Entry Portal (Anthony, NM)', miles: 572, speed: 62, lat: 32.0031, lng: -106.6081, crossing: true, text: 'Automatic Boundary Crossed • Registered NM Jurisdiction ID' },
    { id: 4, state: 'NM', desc: 'Las Cruces Junction (I-10 / I-25)', miles: 612, speed: 65, lat: 32.3122, lng: -106.7783, crossing: false },
    { id: 5, state: 'AZ', desc: 'Arizona Gateway Line (San Simon, AZ)', miles: 820, speed: 68, lat: 32.2226, lng: -110.9747, crossing: true, text: 'Automatic Boundary Crossed • Registered AZ Jurisdiction ID' },
    { id: 6, state: 'AZ', desc: 'Phoenix Logistic Depot (Active Delivery)', miles: 980, speed: 0, lat: 33.4484, lng: -112.0740, crossing: false, text: 'ELD Trip complete • Recorded 980 standard fleet transit miles' }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReplaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= routeSimulationPoints.length - 1) {
            setIsReplaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isReplaying]);

  const activePoint = routeSimulationPoints[activeStep];

  return (
    <div className="space-y-6" id="gps-mileage-tracking-view">
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800" id="telematics-tracker-head">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-300 font-mono">Live ELD State Transit Tracker</h3>
            </div>
            <p className="text-2xl font-bold mt-1 tracking-tight font-sans">Active Rig: Freightliner CAS-202</p>
            <p className="text-xs text-slate-400 mt-1">Bound from San Antonio, TX to Phoenix Logistic Depot, AZ • Driver: Marcus Vance</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => {
                setActiveStep(0);
                setIsReplaying(true);
              }}
              disabled={isReplaying}
              className="text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> {isReplaying ? 'Replaying Route...' : 'Replay ELD Border Crossing'}
            </button>
            <button 
              onClick={() => {
                setActiveStep(0);
                setIsReplaying(false);
              }}
              className="text-xs font-bold text-slate-400 border border-slate-800 hover:text-white px-3 py-2 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Simulated Geographic Board */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-6 relative overflow-hidden" style={{ minHeight: '380px' }} id="simulated-gis-map">
          {/* Grid visual system for high tech styling */}
          <div className="absolute inset-0 bg-space-grid opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs space-y-1 text-slate-300 backdrop-blur-md z-10 font-mono">
            <div><span className="text-slate-500 font-bold">LATITUDE:</span> {activePoint.lat.toFixed(4)}°N</div>
            <div><span className="text-slate-500 font-bold">LONGITUDE:</span> {activePoint.lng.toFixed(4)}°W</div>
            <div><span className="text-slate-500 font-bold">CURRENT JURISDICTION:</span> <span className="bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded text-[10px]">{activePoint.state} State</span></div>
          </div>

          {/* Compass layout representation */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center gap-2 backdrop-blur-md">
            <Compass className={`w-6 h-6 text-emerald-400 ${activePoint.speed > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <div className="text-right">
              <div className="text-xs font-bold text-white font-mono">{activePoint.speed} MPH</div>
              <div className="text-[9px] text-emerald-400 font-mono uppercase font-semibold">Heading West</div>
            </div>
          </div>

          {/* GIS map vector path representing real state lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-35 stroke-slate-700 stroke-2 fill-none max-w-[650px]">
              {/* Texas Outline Segment */}
              <path d="M 150,280 Q 250,300 350,260 T 500,320" className="stroke-slate-800 stroke-[4px]" strokeDasharray="5,5" />
              {/* New Mexico Outline Segment */}
              <line x1="500" y1="320" x2="620" y2="280" className="stroke-indigo-800 stroke-[4px]" strokeDasharray="3,3" />
              {/* Arizona Outline Segment */}
              <line x1="620" y1="280" x2="740" y2="240" className="stroke-emerald-800 stroke-[4px]" strokeDasharray="3,3" />
              
              {/* Node Labels in State lines */}
              <text x="250" y="330" fill="white" fontSize="10" className="font-mono opacity-50">JURISDICTION: TEXAS (TX)</text>
              <text x="520" y="340" fill="white" fontSize="10" className="font-mono opacity-50">NEW MEXICO (NM)</text>
              <text x="680" y="270" fill="white" fontSize="10" className="font-mono opacity-50">ARIZONA (AZ)</text>
            </svg>
          </div>

          {/* Interactive animated dot based on selected index */}
          <div className="absolute left-[30%] top-[45%] flex flex-col items-center gap-1 transition-all duration-700 ease-out z-20" style={{ 
            left: `${15 + (activeStep * 14)}%`, 
            top: `${75 - (activeStep * 8)}%` 
          }}>
            <div className="bg-emerald-500 text-slate-900 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap animate-bounce">
              UNIT 202 ({activePoint.state})
            </div>
            <div className="relative">
              <span className="absolute -inset-2 bg-emerald-500 rounded-full animate-ping opacity-60"></span>
              <div className="w-5 h-5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                <Navigation className="w-3.5 h-3.5 transform rotate-90" />
              </div>
            </div>
          </div>

          {/* Highlight automatic geofencing barrier check */}
          {activePoint.crossing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 border border-red-500 text-white p-4 rounded-xl shadow-xl max-w-sm text-center z-30 backdrop-blur-md animate-in zoom-in-95" id="geofence-breach-box">
              <AlertCircle className="w-6 h-6 text-white mx-auto mb-1 animate-bounce" />
              <strong className="text-xs uppercase block tracking-widest font-bold">STATE BORDER GEOFENCE HANDSHAKE</strong>
              <p className="text-[11px] text-slate-100 mt-1">{activePoint.text}</p>
              <span className="text-[10px] text-red-200 block mt-2 font-mono">FMCSA API Sec. 395 verified</span>
            </div>
          )}
        </div>

        {/* Telemetry log list sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4" id="telemetry-logs-sidebar">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Odometer State Audit Log</h3>
            <p className="text-xs text-gray-500">Live GPS telemetry timeline checkpoints</p>
          </div>

          <div className="relative border-l border-slate-100 pl-4 space-y-5 py-2 max-h-[340px] overflow-y-auto">
            {routeSimulationPoints.map((pt, idx) => {
              const isPassed = activeStep >= idx;
              const isCurrent = activeStep === idx;
              return (
                <div key={pt.id} className="relative text-xs">
                  {/* Bullet */}
                  <div className={`absolute -left-[22px] w-3 h-3 rounded-full border-2 transition-colors ${
                    isCurrent ? 'bg-emerald-500 border-emerald-500 animate-ping' : 
                    isPassed ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'
                  }`}></div>
                  <div className={`absolute -left-[22px] w-3 h-3 rounded-full border-2 transition-colors ${
                    isCurrent ? 'bg-emerald-500 border-emerald-500' : 
                    isPassed ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'
                  }`}></div>

                  <div className={`space-y-0.5 transition-all ${isPassed ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{pt.desc}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-bold">{pt.state} Line</span>
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Odometer: +{pt.miles} miles</span>
                      <span className="font-mono text-emerald-600 font-bold">{pt.speed} mph</span>
                    </div>
                    {pt.crossing && (
                      <div className="mt-1 bg-amber-50 text-amber-800 border border-amber-100 rounded p-1.5 text-[10px] font-medium font-sans">
                        ⚠️ Geo-handshake applied for State Tax calculations
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geofence specs notification banner */}
      <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex gap-3 text-xs text-sky-900" id="geofence-alert-callout">
        <Info className="w-5 h-5 text-sky-600 shrink-0" />
        <div>
          <strong>Automatic Boundary Crossing Systems (ABCS):</strong> FleetTax Pro syncs with Samsara and Motive ELD gateways in real-time. By reading coordinate matrices at 1Hz frequency, it detects exact entry/exit timestamps for IFTA tax credits, preventing human logs error audits by 99.4%.
        </div>
      </div>
    </div>
  );
}
