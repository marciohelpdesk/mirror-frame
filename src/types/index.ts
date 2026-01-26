export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export type ExecutionStep = 'BEFORE_PHOTOS' | 'CHECKLIST' | 'DAMAGE_REPORT' | 'INVENTORY_CHECK' | 'AFTER_PHOTOS' | 'SUMMARY';

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

export interface InventoryUsage {
  itemId: string;
  quantityUsed: number;
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

export interface DamageReport {
  id: string;
  type: 'furniture' | 'electronics' | 'stain' | 'other';
  description: string;
  photoUrl?: string;
  severity: 'low' | 'medium' | 'high';
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
  
  damages: DamageReport[];
  inventoryUsed: InventoryUsage[];
}

export type RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'dining_room' | 'office' | 'laundry' | 'garage' | 'other';

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  size?: number;
  notes?: string;
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
  clientEmail?: string;
  
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  rooms?: Room[];
}

export interface Employee {
  id: string;
  name: string;
  avatar: string; 
}

export type ViewState = 'DASHBOARD' | 'AGENDA' | 'EXECUTION' | 'PROPERTIES' | 'SETTINGS' | 'JOB_DETAILS' | 'PROPERTY_DETAILS' | 'FINANCE';
