
# Plan: Add Execution Flow Translations and Room Management Feature

## Overview

This plan addresses two requests:
1. **Add translations** to ExecutionView and all execution step components for complete i18n coverage
2. **Add room management feature** to add/remove individual rooms with custom names and specifications

---

## Part 1: Execution Flow Translations

### Components Requiring Translation

| Component | Current Hard-coded Texts |
|-----------|-------------------------|
| ExecutionView.tsx | "Limpando Agora", "Sair do Trabalho?", "Seu progresso sera salvo...", "Continuar Trabalhando", "Sair" |
| ExecutionStepper.tsx | "Antes", "Tarefas", "Danos", "Estoque", "Depois", "Resumo" |
| PhotoCaptureStep.tsx | "Before Photos", "After Photos", "Capture the current state...", "Add Photo", "Continue", "Back" |
| ChecklistStep.tsx | "Cleaning Checklist", "tasks", "Continue", "Back", "remaining" |
| DamageReportStep.tsx | "Registro de Danos", "Registre problemas...", damage types, severity labels, "Novo Registro", etc. |
| InventoryCheckStep.tsx | "Inventario", "Estoque Baixo", "Disponivel", "usado", "Voltar", "Continuar" |
| SummaryStep.tsx | "Excelente Trabalho!", "Revise o resumo...", "Duracao", "Tarefas", stats labels, "Concluir", etc. |

### New Translation Keys Required

Add approximately 80 new translation keys covering:
- Execution step labels (6 keys)
- Photo capture step (10 keys)
- Checklist step (8 keys)
- Damage report step (20 keys including types and severities)
- Inventory check step (10 keys)
- Summary step (15 keys)
- Exit dialog (5 keys)
- Common execution actions (6 keys)

---

## Part 2: Room Management Feature

### Current State
- Properties have simple `bedrooms` and `bathrooms` number fields
- No way to track individual rooms with names, sizes, or cleaning requirements

### Proposed Solution

#### Data Model Changes

Add a new `Room` interface and update the `Property` type:

```text
+------------------+
|      Room        |
+------------------+
| id: string       |
| type: RoomType   |
| name: string     |
| size?: number    |
| notes?: string   |
+------------------+

RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'dining_room' | 'office' | 'laundry' | 'garage' | 'other'

Property.rooms: Room[]  (new optional field)
```

#### UI Changes in PropertyDetailsView

Add a new "Rooms" section after Property Stats:
- Display list of rooms grouped by type
- Each room shows: icon, name, size (if set), notes (if set)
- In edit mode: ability to add/remove rooms
- Room types will have predefined icons

#### Visual Design

```text
+------------------------------------------+
|  [Bed] Rooms                    + Add    |
+------------------------------------------+
|  Bedrooms (2)                            |
|  +--------------------------------------+|
|  | [Bed] Master Bedroom       350 sqft ||
|  +--------------------------------------+|
|  | [Bed] Guest Room           250 sqft ||
|  +--------------------------------------+|
|                                          |
|  Bathrooms (2)                           |
|  +--------------------------------------+|
|  | [Bath] Master Bath         [x]      ||
|  +--------------------------------------+|
|  | [Bath] Half Bath           [x]      ||
|  +--------------------------------------+|
|                                          |
|  Other Rooms (1)                         |
|  +--------------------------------------+|
|  | [Sofa] Living Room         [x]      ||
|  +--------------------------------------+|
+------------------------------------------+
```

---

## Implementation Steps

### Step 1: Add Translation Keys to LanguageContext (EN/PT)

Update `src/contexts/LanguageContext.tsx` with all execution-related translations.

**New keys include:**
- `exec.cleaningNow`, `exec.exitJob`, `exec.exitDescription`, `exec.keepWorking`, `exec.exit`
- `exec.step.beforePhotos`, `exec.step.checklist`, `exec.step.damages`, `exec.step.inventory`, `exec.step.afterPhotos`, `exec.step.summary`
- `exec.photo.beforeTitle`, `exec.photo.afterTitle`, `exec.photo.beforeDesc`, `exec.photo.afterDesc`, `exec.photo.addPhoto`, `exec.photo.photosCaptured`, `exec.photo.minimum`
- `exec.checklist.title`, `exec.checklist.tasks`, `exec.checklist.continue`, `exec.checklist.remaining`
- `exec.damage.title`, `exec.damage.subtitle`, `exec.damage.newRecord`, `exec.damage.problemType`, `exec.damage.severity`, `exec.damage.description`, `exec.damage.photo`, `exec.damage.add`, `exec.damage.cancel`, `exec.damage.register`, `exec.damage.noDamages`
- Damage types: `exec.damage.typeFurniture`, `exec.damage.typeElectronics`, `exec.damage.typeStain`, `exec.damage.typeOther`
- Severities: `exec.damage.severityLow`, `exec.damage.severityMedium`, `exec.damage.severityHigh`
- `exec.inventory.title`, `exec.inventory.subtitle`, `exec.inventory.lowStock`, `exec.inventory.available`, `exec.inventory.used`, `exec.inventory.noItems`
- `exec.summary.greatJob`, `exec.summary.reviewSummary`, `exec.summary.duration`, `exec.summary.tasks`, `exec.summary.before`, `exec.summary.after`, `exec.summary.photos`, `exec.summary.damagesRecorded`, `exec.summary.lowStock`, `exec.summary.photoDocumentation`, `exec.summary.addNote`, `exec.summary.notePlaceholder`, `exec.summary.serviceValue`, `exec.summary.downloadPdf`, `exec.summary.generatingPdf`, `exec.summary.complete`
- Room translations for new feature

### Step 2: Update Execution Components

**ExecutionView.tsx:**
- Import `useLanguage` hook
- Replace hard-coded strings with `t()` calls

**ExecutionStepper.tsx:**
- Import `useLanguage` hook
- Make STEPS labels dynamic using translations

**PhotoCaptureStep.tsx:**
- Import `useLanguage` hook
- Translate title, description, button labels

**ChecklistStep.tsx:**
- Import `useLanguage` hook
- Translate header, progress text, button labels

**DamageReportStep.tsx:**
- Import `useLanguage` hook
- Make DAMAGE_TYPES and SEVERITY_OPTIONS use translations
- Translate all form labels and buttons

**InventoryCheckStep.tsx:**
- Import `useLanguage` hook
- Translate header, labels, warning messages

**SummaryStep.tsx:**
- Import `useLanguage` hook
- Translate all stat labels, buttons, and messages

### Step 3: Add Room Type Definition

**src/types/index.ts:**
- Add `RoomType` type
- Add `Room` interface
- Add `rooms?: Room[]` to `Property` interface

### Step 4: Create RoomManagement Component

**src/components/RoomManagement.tsx:**
- New component for managing rooms
- Props: `rooms`, `onRoomsChange`, `isEditing`
- Features:
  - Display rooms grouped by type
  - Add new room dialog/inline form
  - Remove room button (in edit mode)
  - Room type icons mapping
  - Optional size and notes fields

### Step 5: Integrate Room Management into PropertyDetailsView

**src/views/PropertyDetailsView.tsx:**
- Import `RoomManagement` component
- Add rooms section after Property Stats
- Pass `editedProperty.rooms` and handler to component
- Display room summary in read-only mode

### Step 6: Add Room Translations

Add translation keys for room types and labels:
- `rooms.title`, `rooms.subtitle`, `rooms.add`, `rooms.empty`
- `rooms.type.bedroom`, `rooms.type.bathroom`, `rooms.type.kitchen`, etc.
- `rooms.name`, `rooms.size`, `rooms.notes`

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| src/components/RoomManagement.tsx | Room list and management UI |

### Files to Modify
| File | Changes |
|------|---------|
| src/contexts/LanguageContext.tsx | Add ~100 new translation keys for both languages |
| src/types/index.ts | Add Room interface and RoomType type |
| src/views/ExecutionView.tsx | Add useLanguage, replace 5 hard-coded strings |
| src/components/execution/ExecutionStepper.tsx | Add useLanguage, translate 6 step labels |
| src/components/execution/PhotoCaptureStep.tsx | Add useLanguage, translate ~8 strings |
| src/components/execution/ChecklistStep.tsx | Add useLanguage, translate ~6 strings |
| src/components/execution/DamageReportStep.tsx | Add useLanguage, translate ~20 strings |
| src/components/execution/InventoryCheckStep.tsx | Add useLanguage, translate ~8 strings |
| src/components/execution/SummaryStep.tsx | Add useLanguage, translate ~15 strings |
| src/views/PropertyDetailsView.tsx | Import and integrate RoomManagement component |

---

## Summary

This implementation provides:
1. Complete i18n coverage for the job execution flow
2. A flexible room management system allowing detailed property configuration
3. Full English/Portuguese translation support for all new features
4. Consistent UI patterns matching existing design language
