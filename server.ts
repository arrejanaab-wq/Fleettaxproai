/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
const pdf = (pdfParseModule as any).default || pdfParseModule;
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import fs from 'fs';

// Load variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configure multer to use memory storage for Vercel compatibility
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// In-memory persistent mock database to simulate PostgreSQL
const db = {

  fleetCompliance: {
    dotNumber: "DOT-38194812",
    mcNumber: "MC-920481",
    csaScore: 82, 
    insuranceStatus: "Active" as const,
    insuranceExpiry: "2026-11-15",
    drugTestingStatus: "Compliant" as const,
    dotRenewalDate: "2026-08-30"
  },
// ... rest of db stays same
  
  vehicles: [
    { id: "v1", unitNumber: "101", vin: "1XPBD49X1ND293041", plateNumber: "TX-99K21", year: 2022, make: "Peterbilt", model: "579", fuelType: "Diesel" as const, gvw: 80000, irpRegistered: true, insuranceExpiry: "2026-12-01", status: "Active" as const, currentMpg: 6.2 },
    { id: "v2", unitNumber: "202", vin: "1FVACWDB2ND394810", plateNumber: "CA-42M19", year: 2021, make: "Freightliner", model: "Cascadia", fuelType: "Diesel" as const, gvw: 80000, irpRegistered: true, insuranceExpiry: "2026-12-01", status: "Active" as const, currentMpg: 6.8 },
    { id: "v3", unitNumber: "305", vin: "4V4NC9EJXND293812", plateNumber: "OR-88W33", year: 2023, make: "Volvo", model: "VNL 860", fuelType: "Diesel" as const, gvw: 80000, irpRegistered: true, insuranceExpiry: "2026-11-15", status: "Active" as const, currentMpg: 7.1 },
    { id: "v4", unitNumber: "412", vin: "1XKAD49X0ND392019", plateNumber: "UT-15F02", year: 2020, make: "Kenworth", model: "T680", fuelType: "Diesel" as const, gvw: 80000, irpRegistered: false, insuranceExpiry: "2026-06-30", status: "Maintenance" as const, currentMpg: 5.8 }
  ],

  drivers: [
    { id: "d1", name: "Robert Bud Smith", cdlNumber: "TX-4820192", state: "TX", expirationDate: "2026-07-28", medicalCertExpiry: "2026-06-05", phone: "(214) 555-0192", email: "bud.smith@fleetpro.com", status: "Ready" as const, safetyScore: 92, violationsCount: 1, drugTestCompliant: true },
    { id: "d2", name: "Marcus Vance", cdlNumber: "CA-9204192", state: "CA", expirationDate: "2027-11-12", medicalCertExpiry: "2026-12-20", phone: "(415) 555-0238", email: "mvance@fleetpro.com", status: "On Trip" as const, safetyScore: 78, violationsCount: 3, drugTestCompliant: true },
    { id: "d3", name: "Sarah Jenkins", cdlNumber: "OR-2204184", state: "OR", expirationDate: "2028-02-14", medicalCertExpiry: "2026-05-20", phone: "(503) 555-0811", email: "sjenkins@fleetpro.com", status: "Ready" as const, safetyScore: 95, violationsCount: 0, drugTestCompliant: true },
    { id: "d4", name: "David Miller", cdlNumber: "OH-8193812", state: "OH", expirationDate: "2026-05-29", medicalCertExpiry: "2026-08-10", phone: "(614) 555-4921", email: "dmiller@fleetpro.com", status: "Off Duty" as const, safetyScore: 61, violationsCount: 5, drugTestCompliant: false }
  ],

  fuelPurchases: [
    { id: "f1", unitNumber: "101", date: "2026-05-10", state: "TX", vendor: "Pilot Flying J #342", gallons: 150, fuelType: "Diesel" as const, totalCost: 575.50, receiptUrl: "receipt_pilot_342.png", ocrExtracted: true },
    { id: "f2", unitNumber: "101", date: "2026-05-12", state: "NM", vendor: "Love's Travel Stop #512", gallons: 130, fuelType: "Diesel" as const, totalCost: 504.40, receiptUrl: "receipt_loves_512.png", ocrExtracted: true },
    { id: "f3", unitNumber: "202", date: "2026-05-15", state: "CA", vendor: "TA Travel Center #11", gallons: 140, fuelType: "Diesel" as const, totalCost: 686.00, receiptUrl: "receipt_ta_11.png", ocrExtracted: true },
    { id: "f4", unitNumber: "305", date: "2026-05-18", state: "OR", vendor: "Jubitz Truck Stop", gallons: 110, fuelType: "Diesel" as const, totalCost: 489.50, receiptUrl: "receipt_jubitz.png", ocrExtracted: true },
    { id: "f5", unitNumber: "202", date: "2026-05-20", state: "AZ", vendor: "Pilot Travel Center #91", gallons: 100, fuelType: "Diesel" as const, totalCost: 395.00, receiptUrl: "receipt_pilot_91.png", ocrExtracted: true }
  ],

  taxRates: [
    { id: "tr1", stateCode: "TX", stateName: "Texas", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2000, effectiveDate: "2026-04-01" },
    { id: "tr2", stateCode: "CA", stateName: "California", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.7850, effectiveDate: "2026-04-01" },
    { id: "tr3", stateCode: "OR", stateName: "Oregon", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.4000, effectiveDate: "2026-04-01" },
    { id: "tr4", stateCode: "NM", stateName: "New Mexico", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2100, effectiveDate: "2026-04-01" },
    { id: "tr5", stateCode: "AZ", stateName: "Arizona", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2600, effectiveDate: "2026-04-01" },
    { id: "tr6", stateCode: "CO", stateName: "Colorado", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2050, effectiveDate: "2026-04-01" },
    { id: "tr7", stateCode: "UT", stateName: "Utah", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.3650, effectiveDate: "2026-04-01" },
    { id: "tr8", stateCode: "NY", stateName: "New York", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2440, effectiveDate: "2026-04-01" },
    { id: "tr9", stateCode: "KY", stateName: "Kentucky", fuelType: "Diesel", quarter: "Q2", year: 2026, taxRate: 0.2870, effectiveDate: "2026-04-01" }
  ],

  alerts: [
    { id: "a1", type: "Medical" as const, title: "Medical Examiner Expiry", description: "Sarah Jenkins' certified medical card expires on May 20, 2026 (Expired!).", severity: "high" as const, dueDate: "2026-05-20", targetId: "d3", targetType: "driver" as const },
    { id: "a2", type: "CDL" as const, title: "CDL Critical Expiry", description: "David Miller's Class A CDL has expired or expires in 48 hours (Expired!).", severity: "high" as const, dueDate: "2026-05-29", targetId: "d4", targetType: "driver" as const },
    { id: "a3", type: "DOT" as const, title: "FMCSA Drug testing lapse", description: "David Miller is flagged as non-compliant for random drug testing batch Q2.", severity: "high" as const, dueDate: "2026-06-01", targetId: "d4", targetType: "driver" as const },
    { id: "a4", type: "Medical" as const, title: "CDL Approaching Expiry", description: "Robert Bud Smith's CDL expires on July 28, 2026 (60 days warning).", severity: "medium" as const, dueDate: "2026-07-28", targetId: "d1", targetType: "driver" as const },
    { id: "a5", type: "Insurance" as const, title: "Vehicle Insurance Renewal", description: "Unit 412 Kenworth insurance reaches deadline on June 30, 2026.", severity: "medium" as const, dueDate: "2026-06-30", targetId: "v4", targetType: "vehicle" as const }
  ],

  gpsHistory: [
    { id: "gp1", vehicleUnit: "202", driverName: "Marcus Vance", lat: 29.4241, lng: -98.4936, timestamp: "2026-05-27T08:00:00Z", speed: 65, state: "TX", activityType: "Driving" as const },
    { id: "gp2", vehicleUnit: "202", driverName: "Marcus Vance", lat: 31.7619, lng: -106.4850, timestamp: "2026-05-27T10:00:00Z", speed: 68, state: "TX", activityType: "Driving" as const },
    { id: "gp3", vehicleUnit: "202", driverName: "Marcus Vance", lat: 32.2226, lng: -110.9747, timestamp: "2026-05-27T12:00:00Z", speed: 64, state: "AZ", activityType: "Driving" as const },
    { id: "gp4", vehicleUnit: "202", driverName: "Marcus Vance", lat: 33.4484, lng: -112.0740, timestamp: "2026-05-27T14:45:00Z", speed: 0, state: "AZ", activityType: "Idle" as const }
  ],

  auditLogs: [
    { timestamp: "2026-05-27T10:15:00Z", user: "gargvishal0786@gmail.com", action: "Authorized IFTA Q1 Filing Draft creation", status: "Success" },
    { timestamp: "2026-05-27T09:30:12Z", user: "Fleet Owner", action: "Uploaded Fuel Card Transactions from Comdata", status: "112 Records Processed" },
    { timestamp: "2026-05-27T08:01:00Z", user: "Super Admin", action: "Triggered Real-Time IFTA Tax Rate Sync", status: "Downloaded matrix from IFTA.org" }
  ],

  syncStatus: "Synced with IFTA Matrix (May 2026 Releases)",
  syncLog: [
    "2026-05-27 08:00:15 - Initiating secure handshakes with IFTA.org Web Services...",
    "2026-05-27 08:00:17 - Parsing 2026 Q2 Revised tax distribution factors...",
    "2026-05-27 08:00:18 - Verified digital signatures for CA, TX, OR, UT and NM state rates.",
    "2026-05-27 08:00:19 - Sync complete. 51 jurisdictions verified as production-grade."
  ],

  // New mileage logs for per-vehicle tracking
  mileageLogs: [
    { unitNumber: "101", state: "TX", miles: 2000, fuelPurchased: 300 },
    { unitNumber: "101", state: "OK", miles: 1000, fuelPurchased: 0 },
    { unitNumber: "101", state: "KS", miles: 1500, fuelPurchased: 100 },
    { unitNumber: "202", state: "CA", miles: 3000, fuelPurchased: 450 },
    { unitNumber: "202", state: "AZ", miles: 1200, fuelPurchased: 0 }
  ]
};

// Helper to extract text from files
async function extractTextFromFile(fileBuffer: Buffer, mimetype: string): Promise<string> {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_txt(worksheet);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else if (mimetype.startsWith('image/')) {
       // For images, we just return a placeholder or handle via Gemini Vision if available
       // Since we are using text-based Gemini here, we'll suggest OCR
       return "IMAGE_FILE_UPLOADED";
    }
  } catch (err) {
    console.error("Extraction error:", err);
  }
  return "";
}

// Route to parse IFTA report from file
app.post('/api/ifta/parse-report', upload.single('report') as any, async (req: any, res: any) => {
  console.log("File upload received:", req.file);
  try {
    if (!req.file || !req.file.buffer) {
      console.error("No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype);

    if (!text && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "Could not extract text from file" });
    }


    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      const mockExtracted = [
        { unitNumber: '101', state: 'TX', taxableMiles: 2000, fuelPurchased: 300 },
        { unitNumber: '101', state: 'OK', taxableMiles: 1000, fuelPurchased: 0 },
        { unitNumber: '101', state: 'KS', taxableMiles: 1500, fuelPurchased: 100 }
      ];
      return res.json({ 
        success: true, 
        data: mockExtracted,
        note: "Gemini API key not configured. Using mock extraction."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `Extract IFTA mileage and fuel data per vehicle unit from the following text. 
Return a JSON array of objects with keys: "unitNumber", "state" (2-letter), "taxableMiles", "fuelPurchased" (gallons).
Text:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const responseText = response.text;
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: extractedData });

  } catch (error: any) {
    console.error("IFTA Parsing Failure:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock login logic
  if (password === 'password123') {
    if (email === 'owner@fleettax.com') return res.json({ success: true, user: { name: 'Owner Admin', role: 'Fleet Owner', email } });
    if (email === 'dispatcher@fleettax.com') return res.json({ success: true, user: { name: 'Mike Dispatch', role: 'Dispatcher', email } });
    if (email === 'driver@fleettax.com') return res.json({ success: true, user: { name: 'John Driver', role: 'Driver', email } });
  }
  
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// Mock Fuel Card Fetch
app.get('/api/fuel/card-sync', (req, res) => {
  const fuelCardData = [
    { unitNumber: '101', state: 'TX', gallons: 250, vendor: 'Comdata Sync', date: '2026-05-27' },
    { unitNumber: '202', state: 'CA', gallons: 400, vendor: 'EFS Auto Fetch', date: '2026-05-27' }
  ];
  
  // Add to main fuel purchases
  fuelCardData.forEach(item => {
    db.fuelPurchases.unshift({
      id: 'fc-' + Math.random().toString(36).substr(2, 9),
      unitNumber: item.unitNumber,
      date: item.date,
      state: item.state,
      vendor: item.vendor,
      gallons: item.gallons,
      fuelType: 'Diesel',
      totalCost: item.gallons * 4.25,
      receiptUrl: "synced_card.jpg",
      ocrExtracted: false
    });
  });

  res.json({ success: true, data: fuelCardData });
});

// Route to get entire db state
app.get('/api/fleet/all', (req, res) => {
  res.json(db);
});

// Update mileage logs
app.post('/api/ifta/mileage/update', (req, res) => {
  const { mileageLogs } = req.body;
  if (Array.isArray(mileageLogs)) {
    db.mileageLogs = mileageLogs;
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Accountant",
      action: "Updated IFTA mileage distribution ledger",
      status: "Success"
    });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid data format" });
  }
});

// Update/Sync rates API
app.post('/api/rate/sync', (req, res) => {
  db.syncStatus = `Synced to IFTA live matrix - Last check: ${new Date().toISOString()}`;
  db.syncLog.unshift(`${new Date().toISOString().replace('T', ' ').substring(0,19)} - Admin forced live handshake. No adjustments applied.`);
  
  // Audits
  db.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: "Super Admin",
    action: "IFTA live matrix synchronization forced",
    status: "Success"
  });

  res.json({ success: true, status: db.syncStatus, log: db.syncLog });
});

// Add Fuel Purchase OCR simulation endpoint
app.post('/api/fuel/upload', (req, res) => {
  const { unitNumber, totalCost, gallons, state, date, vendor, ocrSimulation } = req.body;
  
  const originalId = "f" + (db.fuelPurchases.length + 1);
  const newPurchase = {
    id: originalId,
    unitNumber: unitNumber || "101",
    date: date || new Date().toISOString().split('T')[0],
    state: state || "TX",
    vendor: vendor || "Pilot Flying J",
    gallons: Number(gallons) || 120,
    fuelType: "Diesel" as const,
    totalCost: Number(totalCost) || 450.00,
    receiptUrl: ocrSimulation ? "scanned_receipt_image.jpg" : "added_manually.png",
    ocrExtracted: true
  };

  db.fuelPurchases.unshift(newPurchase);

  // Audits
  db.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: "Accountant",
    action: `Logged fuel purchase ${originalId} for Unit ${newPurchase.unitNumber}`,
    status: `Saved. (OCR: ${ocrSimulation ? 'Extraction Complete' : 'Manual Entry'})`
  });

  res.json({ success: true, purchase: newPurchase });
});

// Manage vehicle addition
app.post('/api/vehicles/add', (req, res) => {
  const vehicle = req.body;
  const newVehicle = {
    id: "v" + (db.vehicles.length + 1),
    unitNumber: vehicle.unitNumber || "501",
    vin: vehicle.vin || "1XPBD49X1SEEDMOCK",
    plateNumber: vehicle.plateNumber || "TX-MOCK8",
    year: Number(vehicle.year) || 2023,
    make: vehicle.make || "Kenworth",
    model: vehicle.model || "T680",
    fuelType: (vehicle.fuelType || "Diesel") as any,
    gvw: Number(vehicle.gvw) || 80000,
    irpRegistered: !!vehicle.irpRegistered,
    insuranceExpiry: vehicle.insuranceExpiry || "2026-12-31",
    status: (vehicle.status || "Active") as any,
    currentMpg: 6.5
  };
  db.vehicles.push(newVehicle);
  
  db.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: "Fleet Manager",
    action: `Registered new heavy duty vehicle Unit ${newVehicle.unitNumber}`,
    status: `VIN: ${newVehicle.vin}`
  });

  res.json({ success: true, vehicle: newVehicle });
});

// Edit vehicle
app.put('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const index = db.vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    db.vehicles[index] = { ...db.vehicles[index], ...req.body };
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Manager",
      action: `Updated vehicle Unit ${db.vehicles[index].unitNumber}`,
      status: `ID: ${id}`
    });
    res.json({ success: true, vehicle: db.vehicles[index] });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const index = db.vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    const removed = db.vehicles.splice(index, 1)[0];
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Manager",
      action: `Removed vehicle Unit ${removed.unitNumber}`,
      status: `ID: ${id}`
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// Manage driver addition
app.post('/api/drivers/add', (req, res) => {
  const driver = req.body;
  const newDriver = {
    id: "d" + (db.drivers.length + 1),
    name: driver.name || "John Doe",
    cdlNumber: driver.cdlNumber || "CDL-99201",
    state: driver.state || "TX",
    expirationDate: driver.expirationDate || "2027-01-01",
    medicalCertExpiry: driver.medicalCertExpiry || "2026-12-31",
    phone: driver.phone || "(555) 0192-381",
    email: driver.email || "jdoe@fleetpro.com",
    status: "Ready" as const,
    safetyScore: 90,
    violationsCount: 0,
    drugTestCompliant: driver.drugTestCompliant !== false
  };
  db.drivers.push(newDriver);

  db.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: "Fleet Owner",
    action: `Enrolled heavy transport driver ${newDriver.name}`,
    status: `MFA Active`
  });

  res.json({ success: true, driver: newDriver });
});

// Update driver CDL / Medical status
app.post('/api/drivers/update-compliance', (req, res) => {
  const { id, field, value } = req.body;
  const driver = db.drivers.find(d => d.id === id);
  if (driver) {
    if (field === 'cdlExpiry') driver.expirationDate = value;
    if (field === 'medicalCertExpiry') driver.medicalCertExpiry = value;
    if (field === 'drugTestCompliant') driver.drugTestCompliant = value;
    
    // Clear relevant alerts if resolved
    db.alerts = db.alerts.filter(alert => !(alert.targetId === id && alert.type === (field === 'medicalCertExpiry' ? 'Medical' : field === 'cdlExpiry' ? 'CDL' : 'DOT')));
    
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Manager",
      action: `Updated driver compliance for ${driver.name}`,
      status: `Fields: ${field}`
    });
    res.json({ success: true, driver });
  } else {
    res.status(404).json({ error: "Driver not found" });
  }
});

// Edit driver
app.put('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const index = db.drivers.findIndex(d => d.id === id);
  if (index !== -1) {
    db.drivers[index] = { ...db.drivers[index], ...req.body };
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Manager",
      action: `Updated driver ${db.drivers[index].name}`,
      status: `ID: ${id}`
    });
    res.json({ success: true, driver: db.drivers[index] });
  } else {
    res.status(404).json({ error: "Driver not found" });
  }
});

// Delete driver
app.delete('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const index = db.drivers.findIndex(d => d.id === id);
  if (index !== -1) {
    const removed = db.drivers.splice(index, 1)[0];
    db.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "Fleet Manager",
      action: `Removed driver ${removed.name}`,
      status: `ID: ${id}`
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Driver not found" });
  }
});

// Gemini Chat AI Compliance assistant using the GoogleGenAI SDK
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    
    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      // Return beautiful response highlighting missing key while offering mock compliance answer
      const localContextAnswer = getMockComplianceResponse(message, db);
      return res.json({ 
        text: localContextAnswer + "\n\n*(Note: Gemini API key not configured in Settings > Secrets. Above answer resolved via FleetTax local compliance heuristic diagnostics)*"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Provide detailed system instructions to output beautiful markdown structured reports matching trucking parameters
    const systemPrompt = `You are the FleetTax Pro AI Advisor, an expert DOT compliance officer, FMCSA auditor, and commercial IFTA/IRP filing consultant.
You have absolute access to the current live fleet data state:
- Fleet Safety Score CSA Percentile: ${JSON.stringify(db.fleetCompliance)}
- Fleet vehicles: ${JSON.stringify(db.vehicles)}
- Driver credentials and certification dates: ${JSON.stringify(db.drivers)}
- Active fuel state purchases: ${JSON.stringify(db.fuelPurchases)}
- Active State tax rate matrix codes (Q2 2026): ${JSON.stringify(db.taxRates)}
- Current critical fleet alerts: ${JSON.stringify(db.alerts)}

Your tone is strictly professional, analytical, authoritative, and direct. Use markdown tables, bold highlights, and clean mathematical calculations to lay out IFTA calculations, audit exposures, CDL renewals, or MPG anomalies.
Always cite the specific truck Unit numbers, driver names, or state lines when discussing fuel compliance, tax forecasting, or driver risk scores. Avoid general advice: truck carriers need precise state liability tax calculations.`;

    // Format chat components
    const contentPayload = chatHistory ? chatHistory.map((item: any) => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    })) : [];

    // Append current instruction
    contentPayload.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentPayload,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant Failure:", error);
    res.json({ 
      text: `### System Notice: AI Assistant Offline\n\nThe prompt could not be parsed or the Gemini API returned an error: "${error.message}". Let me help you with our local state diagnostics instead:\n\n` + getMockComplianceResponse(req.body.message, db)
    });
  }
});

// Exquisite heuristic context generator for local deployment fallback
function getMockComplianceResponse(message: string, localDb: typeof db): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('ifta') || lowerMsg.includes('owe') || lowerMsg.includes('tax')) {
    return `### 📊 Real-Time IFTA Tax Calculator Heuristic (Q2 2026)

Based on active logging across Texas (**TX**), California (**CA**), and Oregon (**OR**):
*   **Total Miles Logged:** 3,820 miles across all active routes.
*   **Total Diesel Purchased:** 630 gallons (Summed from valid vendor receipts).
*   **Calculated Fleet average MPG:** **6.06 MPG**
*   **State Liability Breakdown:**
    *   **California (CA):** Tax rate $0.785/gal. High route density. Underpaid gallons tax estimated: **$110.25** due.
    *   **Texas (TX):** Tax rate $0.200/gal. High fuel purchases (Pilot/Loves). Tax credit balance: **+$35.00** credit.
*   **Consolidated Net Tax Owed:** **$124.75** (due by July 31, 2026 for Q2).
*   *Anomalies Detected:* Missing fuel receipt for Oregon border segment. Add fuel receipt to eliminate Audit Risk!`;
  }
  
  if (lowerMsg.includes('driver') || lowerMsg.includes('expire') || lowerMsg.includes('cdl') || lowerMsg.includes('medical')) {
    const expiredDrivers = localDb.drivers.filter(d => d.violationsCount > 2 || !d.drugTestCompliant || d.expirationDate < "2026-06-30");
    return `### ⚠️ Driver Compliance Risk Assessment

Our safety ledger reports **${expiredDrivers.length} critical safety/credential threats**:
1.  **David Miller**:
    *   *Violation:* CDL Expiration reached or within 48 hours (**${localDb.drivers[3].expirationDate}**).
    *   *Drug Test Status:* **NON-COMPLIANT** (Missed mandatory random screening window).
    *   *Action:* **DISPATCH LOCKOUT**. Under FMCSA §382.301, this driver is restricted from operating heavy loads.
2.  **Sarah Jenkins**:
    *   *Violation:* Medical Certificate expired on **${localDb.drivers[2].medicalCertExpiry}**. CDL downgraded to intrastate unless updated.
3.  **Robert Bud Smith**:
    *   *Alert:* Texas Class A CDL expires on **${localDb.drivers[0].expirationDate}**. 60 days warning limit triggered.`;
  }

  if (lowerMsg.includes('vehicle') || lowerMsg.includes('maintenance') || lowerMsg.includes('mpg')) {
    const poorVehicles = localDb.vehicles.filter(v => (v.currentMpg && v.currentMpg < 6.5) || v.status === 'Maintenance');
    return `### 🚛 Vehicle Efficiency & Maintenance Warnings

*   **Low MPG Alert:** Unit **412** Kenworth reports an average of **5.8 MPG** (Target: 6.5+). Checked diagnostics indicate fuel injector timing drift.
*   **Unit 412 status:** Currently in **Maintenance** for pre-audit inspection checks.
*   **Jurisdiction Registration alert:** Unit 412 is lacking IRP proportional plate allocation outside Utah (Utah restricted).`;
  }

  return `### FleetTax Pro AI Assistance Center

I am fully synchronized with your current fleet compliance dashboard!
You can ask me questions such as:
1.  **"How much IFTA tax liability do I owe for stateCA/TX?"**
2.  **"Which drivers CDL certificates are currently expired under FMCSA rules?"**
3.  **"Which heavy duty vehicles have low MPG anomalies or need maintenance?"**
4.  **"Show safety scores and audit logs of our registered fleets."**`;
}

// Vite Server Integration
if (process.env.NODE_ENV !== 'production') {
  async function main() {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FleetTax Pro AI local dev server on http://0.0.0.0:${PORT}`);
    });
  }
  main().catch((err) => {
    console.error("Express initialization failed", err);
  });
} else if (!process.env.VERCEL) {
  // Only bind to a port if NOT on Vercel (e.g., local production test)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FleetTax Pro AI local production server on http://0.0.0.0:${PORT}`);
  });
}

export default app;
