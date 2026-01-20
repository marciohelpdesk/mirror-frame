import { ChecklistSection } from '@/types';

export const STANDARD_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'kitchen',
    title: 'Kitchen',
    items: [
      { id: 'k1', label: 'Wipe down all countertops', completed: false, photoRequired: false },
      { id: 'k2', label: 'Clean stovetop and oven exterior', completed: false, photoRequired: false },
      { id: 'k3', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'k4', label: 'Wipe cabinet fronts', completed: false, photoRequired: false },
      { id: 'k5', label: 'Clean sink and faucet', completed: false, photoRequired: false },
      { id: 'k6', label: 'Empty and wipe trash can', completed: false, photoRequired: false },
      { id: 'k7', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'living',
    title: 'Living Room',
    items: [
      { id: 'l1', label: 'Dust all surfaces and shelves', completed: false, photoRequired: false },
      { id: 'l2', label: 'Vacuum carpet/mop floor', completed: false, photoRequired: false },
      { id: 'l3', label: 'Fluff and arrange pillows', completed: false, photoRequired: false },
      { id: 'l4', label: 'Wipe down TV screen and remotes', completed: false, photoRequired: false },
      { id: 'l5', label: 'Clean mirrors and glass', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    items: [
      { id: 'b1', label: 'Change bed sheets and pillowcases', completed: false, photoRequired: true },
      { id: 'b2', label: 'Make bed neatly', completed: false, photoRequired: false },
      { id: 'b3', label: 'Dust nightstands and dressers', completed: false, photoRequired: false },
      { id: 'b4', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'b5', label: 'Organize closet hangers', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    items: [
      { id: 'ba1', label: 'Scrub and sanitize toilet', completed: false, photoRequired: false },
      { id: 'ba2', label: 'Clean shower/tub and glass doors', completed: false, photoRequired: false },
      { id: 'ba3', label: 'Wipe down sink and vanity', completed: false, photoRequired: false },
      { id: 'ba4', label: 'Replace towels', completed: false, photoRequired: true },
      { id: 'ba5', label: 'Refill toiletries (soap, shampoo)', completed: false, photoRequired: false },
      { id: 'ba6', label: 'Clean mirror', completed: false, photoRequired: false },
      { id: 'ba7', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'outdoor',
    title: 'Outdoor',
    items: [
      { id: 'o1', label: 'Sweep patio/balcony floor', completed: false, photoRequired: false },
      { id: 'o2', label: 'Wipe outdoor furniture', completed: false, photoRequired: false },
      { id: 'o3', label: 'Check for cigarette butts/trash', completed: false, photoRequired: false },
    ]
  }
];
