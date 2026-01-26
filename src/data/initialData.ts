import { Job, JobStatus, Property, UserProfile, InventoryItem, Employee } from '@/types';
import { STANDARD_CHECKLIST_TEMPLATE } from './checklist';

export const INITIAL_PROFILE: UserProfile = {
  name: 'Maria Santos',
  email: 'maria@purclean.co',
  phone: '+1 (305) 555-0123',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  role: 'Lead Cleaner'
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: 'Ocean View Loft',
    address: '123 Beach Ave, Santa Monica',
    type: 'Loft',
    serviceType: 'Airbnb Cleaning',
    accessCode: '4920',
    wifiPassword: 'sunset_guest',
    status: 'READY',
    photo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    notes: 'Keys are in the black lockbox near the side door.',
    suppliesLocation: 'Cleaning closet in the hallway, code 0000.',
    basePrice: 150.00,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    clientEmail: 'cliente@oceanview.com'
  },
  { 
    id: 'p2',
    name: 'Downtown Studio',
    address: '456 Main St, Miami',
    type: 'Studio',
    serviceType: 'Airbnb Cleaning',
    accessCode: '1234',
    wifiPassword: 'downtown2024',
    status: 'NEEDS_CLEANING',
    photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    notes: 'Use the back entrance.',
    suppliesLocation: 'Under the kitchen sink.',
    basePrice: 85.00,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 450,
    clientEmail: 'cliente@downtown.com'
  },
  {
    id: 'p3',
    name: 'Coral Gables Villa',
    address: '789 Palms Rd, Coral Gables',
    type: 'Villa',
    serviceType: 'Deep Cleaning',
    accessCode: '9876',
    wifiPassword: 'villa_wifi_2024',
    status: 'OCCUPIED',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    notes: 'Pool area needs extra attention.',
    suppliesLocation: 'Garage, second shelf.',
    basePrice: 275.00,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    clientEmail: 'cliente@coralgables.com'
  }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    propertyId: 'p1',
    clientName: 'Ocean View Loft',
    address: '123 Beach Ave',
    date: today,
    time: '09:00',
    status: JobStatus.IN_PROGRESS,
    type: 'Standard',
    checklist: JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE)),
    startTime: Date.now() - 1800000,
    assignedTo: 'e1',
    checkInTime: '15:00',
    currentStep: 'CHECKLIST',
    photosBefore: [],
    photosAfter: [],
    price: 150,
    damages: [],
    inventoryUsed: [],
    lostAndFound: []
  },
  {
    id: 'j2',
    propertyId: 'p2',
    clientName: 'Downtown Studio',
    address: '456 Main St',
    date: today,
    time: '13:00',
    status: JobStatus.SCHEDULED,
    type: 'Standard',
    checklist: JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE)),
    photosBefore: [],
    photosAfter: [],
    price: 85,
    damages: [],
    inventoryUsed: [],
    lostAndFound: []
  },
  {
    id: 'j3',
    propertyId: 'p3',
    clientName: 'Coral Gables Villa',
    address: '789 Palms Rd',
    date: tomorrow,
    time: '10:00',
    status: JobStatus.SCHEDULED,
    type: 'Deep Clean',
    checklist: JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE)),
    photosBefore: [],
    photosAfter: [],
    price: 275,
    damages: [],
    inventoryUsed: [],
    lostAndFound: []
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'All-Purpose Cleaner', quantity: 5, unit: 'bottles', threshold: 2, category: 'Cleaning' },
  { id: 'i2', name: 'Glass Cleaner', quantity: 3, unit: 'bottles', threshold: 2, category: 'Cleaning' },
  { id: 'i3', name: 'Microfiber Cloths', quantity: 15, unit: 'pcs', threshold: 5, category: 'Supplies' },
  { id: 'i4', name: 'Toilet Brush', quantity: 4, unit: 'pcs', threshold: 2, category: 'Tools' },
  { id: 'i5', name: 'Trash Bags', quantity: 50, unit: 'pcs', threshold: 20, category: 'Supplies' },
  { id: 'i6', name: 'Hand Soap', quantity: 8, unit: 'bottles', threshold: 3, category: 'Amenities' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', 
    name: 'Maria Santos', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' 
  },
  { 
    id: 'e2', 
    name: 'Carlos Rivera', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' 
  },
  { 
    id: 'e3', 
    name: 'Ana Martinez', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' 
  }
];
