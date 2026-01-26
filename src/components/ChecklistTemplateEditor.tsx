import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Camera,
  GripVertical,
  RotateCcw,
  Sparkles,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { ChecklistSection, ChecklistItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STANDARD_CHECKLIST_TEMPLATE, CHECKLIST_PRESETS, ChecklistPresetKey } from '@/data/checklist';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ChecklistTemplateEditorProps {
  template: ChecklistSection[];
  onTemplateChange: (template: ChecklistSection[]) => void;
  isEditing: boolean;
}

interface SortableItemProps {
  item: ChecklistItem;
  sectionId: string;
  isEditing: boolean;
  editingItemId: string | null;
  editingLabel: string;
  onStartEdit: (itemId: string, label: string) => void;
  onSaveEdit: (sectionId: string, itemId: string) => void;
  onCancelEdit: () => void;
  onEditingLabelChange: (value: string) => void;
  onTogglePhotoRequired: (sectionId: string, itemId: string) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
  t: (key: string) => string;
}

const SortableItem = ({
  item,
  sectionId,
  isEditing,
  editingItemId,
  editingLabel,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingLabelChange,
  onTogglePhotoRequired,
  onRemoveItem,
  t,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const isCurrentlyEditing = editingItemId === item.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-card/50 rounded-lg ${isDragging ? 'shadow-lg' : ''}`}
    >
      {isEditing && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors touch-none"
        >
          <GripVertical size={14} className="text-muted-foreground" />
        </button>
      )}
      
      {isCurrentlyEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editingLabel}
            onChange={(e) => onEditingLabelChange(e.target.value)}
            className="flex-1 h-8 text-sm bg-background border-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveEdit(sectionId, item.id);
              } else if (e.key === 'Escape') {
                onCancelEdit();
              }
            }}
          />
          <button
            onClick={() => onSaveEdit(sectionId, item.id)}
            className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span 
            className={`flex-1 text-sm text-foreground ${isEditing ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
            onDoubleClick={() => isEditing && onStartEdit(item.id, item.label)}
          >
            {item.label}
          </span>
          
          {isEditing ? (
            <>
              <button
                onClick={() => onStartEdit(item.id, item.label)}
                className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                title={t('checklist.editTask')}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onTogglePhotoRequired(sectionId, item.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.photoRequired 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                title={item.photoRequired ? t('checklist.photoRequired') : t('checklist.noPhoto')}
              >
                <Camera size={14} />
              </button>
              <button
                onClick={() => onRemoveItem(sectionId, item.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={14} className="text-destructive" />
              </button>
            </>
          ) : (
            item.photoRequired && (
              <Camera size={14} className="text-amber-400" />
            )
          )}
        </>
      )}
    </div>
  );
};

export const ChecklistTemplateEditor = ({ 
  template, 
  onTemplateChange, 
  isEditing 
}: ChecklistTemplateEditorProps) => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    
    const newSection: ChecklistSection = {
      id: `section-${Date.now()}`,
      title: newSectionName.trim(),
      items: [],
    };
    
    onTemplateChange([...template, newSection]);
    setNewSectionName('');
    setExpandedSections(prev => [...prev, newSection.id]);
  };

  const handleRemoveSection = (sectionId: string) => {
    onTemplateChange(template.filter(s => s.id !== sectionId));
  };

  const handleAddItem = (sectionId: string) => {
    const itemText = newItemInputs[sectionId]?.trim();
    if (!itemText) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: itemText,
      completed: false,
      photoRequired: false,
    };

    onTemplateChange(template.map(section => {
      if (section.id === sectionId) {
        return { ...section, items: [...section.items, newItem] };
      }
      return section;
    }));
    
    setNewItemInputs(prev => ({ ...prev, [sectionId]: '' }));
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    onTemplateChange(template.map(section => {
      if (section.id === sectionId) {
        return { ...section, items: section.items.filter(i => i.id !== itemId) };
      }
      return section;
    }));
  };

  const handleTogglePhotoRequired = (sectionId: string, itemId: string) => {
    onTemplateChange(template.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, photoRequired: !item.photoRequired };
            }
            return item;
          }),
        };
      }
      return section;
    }));
  };

  const handleStartEdit = (itemId: string, label: string) => {
    setEditingItemId(itemId);
    setEditingLabel(label);
  };

  const handleSaveEdit = (sectionId: string, itemId: string) => {
    if (!editingLabel.trim()) {
      setEditingItemId(null);
      return;
    }

    onTemplateChange(template.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, label: editingLabel.trim() };
            }
            return item;
          }),
        };
      }
      return section;
    }));
    
    setEditingItemId(null);
    setEditingLabel('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingLabel('');
  };

  const handleDragEnd = (sectionId: string) => (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onTemplateChange(template.map(section => {
        if (section.id === sectionId) {
          const oldIndex = section.items.findIndex(item => item.id === active.id);
          const newIndex = section.items.findIndex(item => item.id === over.id);
          return {
            ...section,
            items: arrayMove(section.items, oldIndex, newIndex),
          };
        }
        return section;
      }));
    }
  };

  const handleResetToDefault = () => {
    onTemplateChange(JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE)));
  };

  const handleApplyPreset = (presetKey: ChecklistPresetKey) => {
    const preset = CHECKLIST_PRESETS[presetKey];
    if (preset) {
      const newTemplate = JSON.parse(JSON.stringify(preset.template)).map((section: ChecklistSection) => ({
        ...section,
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: section.items.map((item: ChecklistItem) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      }));
      onTemplateChange(newTemplate);
    }
  };

  const totalTasks = template.reduce((acc, section) => acc + section.items.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <ClipboardList size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('checklist.title')}</h3>
            <p className="text-xs text-muted-foreground">
              {totalTasks} {t('checklist.tasks')}
            </p>
          </div>
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => handleApplyPreset(value as ChecklistPresetKey)}>
              <SelectTrigger className="w-[160px] h-9 text-xs bg-card/50 border-muted">
                <Sparkles size={14} className="mr-1 text-secondary" />
                <SelectValue placeholder={t('checklist.selectPreset')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHECKLIST_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {t(preset.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {template.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <div key={section.id} className="bg-muted/30 rounded-xl overflow-hidden">
              {/* Section Header */}
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <GripVertical size={14} className="text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    ({section.items.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSection(section.id);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Section Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd(section.id)}
                      >
                        <SortableContext
                          items={section.items.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {section.items.map((item) => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              sectionId={section.id}
                              isEditing={isEditing}
                              editingItemId={editingItemId}
                              editingLabel={editingLabel}
                              onStartEdit={handleStartEdit}
                              onSaveEdit={handleSaveEdit}
                              onCancelEdit={handleCancelEdit}
                              onEditingLabelChange={setEditingLabel}
                              onTogglePhotoRequired={handleTogglePhotoRequired}
                              onRemoveItem={handleRemoveItem}
                              t={t}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>

                      {/* Add Item Input */}
                      {isEditing && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newItemInputs[section.id] || ''}
                            onChange={(e) => setNewItemInputs(prev => ({
                              ...prev,
                              [section.id]: e.target.value
                            }))}
                            placeholder={t('checklist.newTaskPlaceholder')}
                            className="flex-1 h-9 text-sm bg-card/50 border-muted"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddItem(section.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(section.id)}
                            disabled={!newItemInputs[section.id]?.trim()}
                            className="h-9"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Section */}
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder={t('checklist.newSectionPlaceholder')}
              className="flex-1 bg-card/50 border-muted"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSection();
                }
              }}
            />
            <Button
              onClick={handleAddSection}
              disabled={!newSectionName.trim()}
              className="gap-1"
            >
              <Plus size={14} />
              {t('checklist.addSection')}
            </Button>
          </div>
          
          {template.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefault}
              className="mt-3 text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw size={14} />
              {t('checklist.resetToDefault')}
            </Button>
          )}
        </div>
      )}

      {/* Empty State */}
      {template.length === 0 && !isEditing && (
        <p className="text-sm text-muted-foreground italic text-center py-4">
          {t('checklist.usingDefault')}
        </p>
      )}
    </motion.div>
  );
};
