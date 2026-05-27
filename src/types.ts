/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'Fleet Owner' | 'Fleet Manager' | 'Dispatcher' | 'Driver' | 'Accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface FleetCompliance {
  dotNumber: string;
  mcNumber: string;
  csaScore: number;
  insuranceStatus: 'Active' | 'Expiring' | 'Lapsed';
  insuranceExpiry: string;
  drugTestingStatus: 'Compliant' | 'Pending Records' | 'Warning';
  dotRenewalDate: string;
}

export interface Vehicle {
  id: string;
  unitNumber: string;
  vin: string;
  plateNumber: string;
  year: number;
  make: string;
  model: string;
  fuelType: 'Diesel' | 'Gasoline' | 'CNG';
  gvw: number; // Gross Vehicle Weight
  irpRegistered: boolean;
  insuranceExpiry: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  currentMpg?: number;
}

export interface Driver {
  id: string;
  name: string;
  cdlNumber: string;
  state: string;
  expirationDate: string;
  medicalCertExpiry: string;
  phone: string;
  email: string;
  status: 'Ready' | 'On Trip' | 'Off Duty';
  safetyScore: number; // 0-100
  violationsCount: number;
  drugTestCompliant: boolean;
}

export interface GpsLog {
  id: string;
  vehicleUnit: string;
  driverName: string;
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  state: string;
  activityType: 'Driving' | 'Idle' | 'HOS Rest';
}

export interface FuelPurchase {
  id: string;
  unitNumber: string;
  date: string;
  state: string;
  vendor: string;
  gallons: number;
  fuelType: 'Diesel' | 'Gasoline' | 'CNG';
  totalCost: number;
  receiptUrl?: string;
  ocrProcessing?: boolean;
  ocrExtracted?: boolean;
}

export interface TaxRate {
  id: string;
  stateCode: string;
  stateName: string;
  fuelType: string;
  quarter: string;
  year: number;
  taxRate: number; // tax rate per gallon (USD)
  effectiveDate: string;
}

export interface StateMileage {
  state: string;
  taxableMiles: number;
  tollMiles: number;
  nonTollMiles: number;
  fuelPurchased: number; // Gallons
}

export interface IftaFilingPeriod {
  id: string;
  year: number;
  quarter: number; // 1, 2, 3, 4
  dueDate: string;
  status: 'Draft' | 'Filed' | 'Overdue';
  totalMiles: number;
  totalGallons: number;
  mpg: number;
  netTaxDue: number;
}

export interface ComplianceAlert {
  id: string;
  type: 'CDL' | 'Medical' | 'Insurance' | 'DOT' | 'IFTA' | 'HOS';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  dueDate: string;
  targetId: string;
  targetType: 'vehicle' | 'driver' | 'fleet';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
