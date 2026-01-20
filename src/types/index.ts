export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export type ExecutionStep = 'BEFORE_PHOTOS' | 'CHECKLIST' | 'INVENTORY' | 'AFTER_PHOTOS' | 'SUMMARY';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
  reorderPhoto?: string; 
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  photoRequired: boolean;
  photoUrl?: string; 
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Job {
  id: string;
  propertyId?: string; 
  clientName: string;
  address: string;
  date: string;
  time: string;
  status: JobStatus;
  type: 'Standard' | 'Deep Clean' | 'Move-out';
  price?: number;
  checklist: ChecklistSection[];
  startTime?: number;
  endTime?: number;
  assignedTo?: string; 
  checkInTime?: string; 
  
  currentStep?: ExecutionStep;
  photosBefore: string[];
  photosAfter: string[];
  reportNote?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Apartment' | 'House' | 'Villa' | 'Loft' | 'Studio';
  serviceType: 'House Cleaning' | 'Deep Cleaning' | 'Airbnb Cleaning' | 'Move in/Out' | 'Recurring Cleaning' | 'Commercial Cleaning' | 'Office Cleaning' | 'Post Construction';
  accessCode?: string;
  wifiPassword?: string;
  notes?: string;
  suppliesLocation?: string;
  photo?: string; 
  lastCleaned?: string;
  basePrice?: number; 
  status: 'READY' | 'NEEDS_CLEANING' | 'OCCUPIED';
  manualUrl?: string; 
  
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string; 
}

export type ViewState = 'DASHBOARD' | 'AGENDA' | 'EXECUTION' | 'PROPERTIES' | 'SETTINGS' | 'JOB_DETAILS' | 'PROPERTY_DETAILS' | 'FINANCE';
