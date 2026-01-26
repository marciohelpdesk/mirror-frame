
# Plan: Add Missing Edit Fields to PropertyDetailsView

## Problem Identified

The `PropertyDetailsView` component is missing editable fields for several property attributes when in edit mode:

Currently NOT editable:
- Bedrooms (quantity)
- Bathrooms (quantity)
- Square feet (sqft)
- Property type (Apartment, House, Villa, etc.)
- Status (Ready, Needs Cleaning, Occupied)
- Service type (House Cleaning, Deep Cleaning, etc.)
- Base price

These fields are only displayed as read-only, even when the user clicks the Edit button.

## Solution

Add editable inputs and selects for all missing fields in `PropertyDetailsView.tsx`, following the existing pattern used for other editable fields (name, address, notes, etc.).

## Changes Required

### File: src/views/PropertyDetailsView.tsx

#### 1. Add Property Stats Editing (lines ~198-217)

Replace the read-only Property Stats section with editable inputs when `isEditing` is true:

```tsx
{/* Property Stats */}
<div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
  {isEditing ? (
    <div className="grid grid-cols-3 gap-3 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Bed size={12} /> Beds
        </label>
        <input
          type="number"
          min="0"
          value={editedProperty.bedrooms || ''}
          onChange={(e) => setEditedProperty({...editedProperty, bedrooms: parseInt(e.target.value) || undefined})}
          className="bg-white/10 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Bath size={12} /> Baths
        </label>
        <input
          type="number"
          min="0"
          value={editedProperty.bathrooms || ''}
          onChange={(e) => setEditedProperty({...editedProperty, bathrooms: parseInt(e.target.value) || undefined})}
          className="bg-white/10 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Square size={12} /> Sqft
        </label>
        <input
          type="number"
          min="0"
          value={editedProperty.sqft || ''}
          onChange={(e) => setEditedProperty({...editedProperty, sqft: parseInt(e.target.value) || undefined})}
          className="bg-white/10 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        />
      </div>
    </div>
  ) : (
    <>
      {/* existing read-only display */}
    </>
  )}
</div>
```

#### 2. Add Type, Status, and Service Type Editing (lines ~185-195)

Add editable selects for property type, status, and service type when in edit mode:

```tsx
<div className="flex items-center gap-3 flex-wrap">
  {isEditing ? (
    <div className="w-full space-y-3">
      {/* Status Select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <select
          value={editedProperty.status}
          onChange={(e) => setEditedProperty({...editedProperty, status: e.target.value as Property['status']})}
          className="bg-white/10 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        >
          <option value="READY">Ready</option>
          <option value="NEEDS_CLEANING">Needs Cleaning</option>
          <option value="OCCUPIED">Occupied</option>
        </select>
      </div>
      {/* Property Type Select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Property Type</label>
        <select
          value={editedProperty.type}
          onChange={(e) => setEditedProperty({...editedProperty, type: e.target.value as Property['type']})}
          className="bg-white/10 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        >
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Villa">Villa</option>
          <option value="Loft">Loft</option>
          <option value="Studio">Studio</option>
        </select>
      </div>
      {/* Service Type Select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Service Type</label>
        <select
          value={editedProperty.serviceType}
          onChange={(e) => setEditedProperty({...editedProperty, serviceType: e.target.value as Property['serviceType']})}
          className="bg-white/10 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary"
        >
          <option value="House Cleaning">House Cleaning</option>
          <option value="Deep Cleaning">Deep Cleaning</option>
          <option value="Airbnb Cleaning">Airbnb Cleaning</option>
          <option value="Move in/Out">Move in/Out</option>
          <option value="Recurring Cleaning">Recurring Cleaning</option>
          <option value="Commercial Cleaning">Commercial Cleaning</option>
          <option value="Office Cleaning">Office Cleaning</option>
          <option value="Post Construction">Post Construction</option>
        </select>
      </div>
    </div>
  ) : (
    <>
      {/* existing badges display */}
    </>
  )}
</div>
```

#### 3. Add Base Price Editing Section

Add a new section for editing the base price (after supplies location or before notes):

```tsx
{/* Base Price */}
<motion.div className="glass-panel p-4">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
      <DollarSign size={20} className="text-green-400" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-foreground">Base Price</h3>
      <p className="text-xs text-muted-foreground">Standard cleaning rate</p>
    </div>
  </div>
  
  {isEditing ? (
    <div className="flex items-center gap-2">
      <span className="text-lg font-medium">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={editedProperty.basePrice || ''}
        onChange={(e) => setEditedProperty({...editedProperty, basePrice: parseFloat(e.target.value) || undefined})}
        placeholder="0.00"
        className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
      />
    </div>
  ) : property.basePrice ? (
    <p className="text-2xl font-bold text-green-400">${property.basePrice.toFixed(2)}</p>
  ) : (
    <p className="text-sm text-muted-foreground italic">No price set</p>
  )}
</motion.div>
```

#### 4. Import DollarSign Icon

Add `DollarSign` to the imports from lucide-react.

### File: src/contexts/LanguageContext.tsx

Add translation keys for the new editable sections:

```typescript
propertyDetails: {
  title: 'Property Details',
  beds: 'Beds',
  baths: 'Baths',
  sqft: 'Sqft',
  status: 'Status',
  propertyType: 'Property Type',
  serviceType: 'Service Type',
  basePrice: 'Base Price',
  standardRate: 'Standard cleaning rate',
  noPrice: 'No price set',
  // ... status values
}
```

## Summary of Changes

| File | Change |
|------|--------|
| src/views/PropertyDetailsView.tsx | Add editable inputs for bedrooms, bathrooms, sqft |
| src/views/PropertyDetailsView.tsx | Add editable selects for status, type, serviceType |
| src/views/PropertyDetailsView.tsx | Add new Base Price section with editable input |
| src/views/PropertyDetailsView.tsx | Import DollarSign icon |
| src/contexts/LanguageContext.tsx | Add translation keys for new fields |

## Visual Result

When user clicks Edit button:
- Property stats (beds/baths/sqft) become number inputs
- Status, Type, and Service Type badges become dropdown selects
- Base Price section shows editable input with $ prefix

When user clicks Save:
- All changes are saved via `onUpdate(editedProperty)`
- UI returns to read-only mode with updated values
