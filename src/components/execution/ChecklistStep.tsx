import { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, ChevronDown, ChevronUp, ArrowRight, AlertTriangle, Utensils, Sofa, BedDouble, Bath as BathIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistSection, ChecklistItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { LiquidProgressBubble } from '@/components/LiquidProgressBubble';

interface ChecklistStepProps {
  checklist: ChecklistSection[];
  onChecklistChange: (checklist: ChecklistSection[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEMO_TASK_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';

const ROOM_ICONS: Record<string, typeof Utensils> = {
  kitchen: Utensils,
  cozinha: Utensils,
  living: Sofa,
  sala: Sofa,
  bedroom: BedDouble,
  quarto: BedDouble,
  bathroom: BathIcon,
  banheiro: BathIcon,
};

const getRoomIcon = (title: string) => {
  const lower = title.toLowerCase();
  for (const [key, Icon] of Object.entries(ROOM_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return null;
};

export const ChecklistStep = ({
  checklist,
  onChecklistChange,
  onNext,
  onBack,
}: ChecklistStepProps) => {
  const { t } = useLanguage();
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const [capturingPhoto, setCapturingPhoto] = useState<string | null>(null);

  const totalItems = checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = checklist.reduce(
    (acc, s) => acc + s.items.filter(i => i.completed).length, 0
  );
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allCompleted = completedItems === totalItems;

  const activeSection = checklist[activeRoomIdx] || checklist[0];
  const sectionDone = activeSection?.items.filter(i => i.completed).length || 0;
  const sectionTotal = activeSection?.items.length || 0;

  const toggleItem = useCallback((sectionId: string, itemId: string) => {
    const updated = checklist.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map(item => {
          if (item.id !== itemId) return item;
          if (item.photoRequired && !item.completed && !item.photoUrl) {
            setCapturingPhoto(itemId);
            return item;
          }
          return { ...item, completed: !item.completed };
        }),
      };
    });
    onChecklistChange(updated);
  }, [checklist, onChecklistChange]);

  const handlePhotoCapture = useCallback((sectionId: string, itemId: string) => {
    setTimeout(() => {
      const updated = checklist.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, photoUrl: `${DEMO_TASK_PHOTO}&t=${Date.now()}`, completed: true };
          }),
        };
      });
      onChecklistChange(updated);
      setCapturingPhoto(null);
    }, 300);
  }, [checklist, onChecklistChange]);

  const canGoNextRoom = activeRoomIdx < checklist.length - 1;
  const isLastRoom = activeRoomIdx === checklist.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Room Tabs - Scrollable */}
      <div className="sticky top-0 z-40 bg-card border-b border-border/30">
        <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar">
          {checklist.map((section, idx) => {
            const done = section.items.filter(i => i.completed).length;
            const total = section.items.length;
            const isActive = idx === activeRoomIdx;
            const isComplete = done === total;
            const RoomIcon = getRoomIcon(section.title);

            return (
              <button
                key={section.id}
                onClick={() => setActiveRoomIdx(idx)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-primary to-teal-600 text-white scale-105 shadow-md shadow-primary/20'
                    : isComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {RoomIcon && <RoomIcon size={14} />}
                {section.title}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${isActive ? 'bg-white/30' : 'bg-muted'}
                `}>
                  {done}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable checklist */}
      <div className="flex-1 p-4 overflow-y-auto hide-scrollbar pb-4">
        {activeSection && (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Checklist - {activeSection.title}</h2>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              {activeSection.items.map((item, idx) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  sectionId={activeSection.id}
                  isCapturing={capturingPhoto === item.id}
                  onToggle={() => toggleItem(activeSection.id, item.id)}
                  onCapturePhoto={() => handlePhotoCapture(activeSection.id, item.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="px-4 py-3 flex gap-3 border-t border-border/30 bg-card">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          {t('exec.checklist.pause') || 'Pausar'}
        </button>
        <button
          onClick={canGoNextRoom ? () => setActiveRoomIdx(prev => prev + 1) : allCompleted ? onNext : undefined}
          disabled={isLastRoom && !allCompleted}
          className={`flex-[2] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
            ${(canGoNextRoom || allCompleted)
              ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-md shadow-primary/20'
              : 'bg-muted text-muted-foreground'
            }
          `}
        >
          {canGoNextRoom ? (
            <>{t('exec.checklist.nextRoom') || 'Próxima Sala'} <ArrowRight size={16} /></>
          ) : allCompleted ? (
            <>{t('exec.checklist.finalize') || 'Finalizar'} <ArrowRight size={16} /></>
          ) : (
            `${completedItems}/${totalItems}`
          )}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Memoized Item Card Component ─────────────────────────

interface ChecklistItemCardProps {
  item: ChecklistItem;
  index: number;
  sectionId: string;
  isCapturing: boolean;
  onToggle: () => void;
  onCapturePhoto: () => void;
}

const ChecklistItemCard = memo(({ item, index, sectionId, isCapturing, onToggle, onCapturePhoto }: ChecklistItemCardProps) => {
  return (
    <label
      className={`
        flex items-center gap-4 p-4 bg-card border-2 rounded-2xl cursor-pointer transition-all duration-100
        ${item.completed
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] active:bg-muted/60'
        }
      `}
      onClick={(e) => {
        e.preventDefault();
        if (item.photoRequired && !item.photoUrl && !item.completed) {
          onCapturePhoto();
        } else {
          onToggle();
        }
      }}
    >
      {/* Checkbox */}
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-100
          ${item.completed
            ? 'bg-emerald-500 shadow-sm'
            : 'border-2 border-muted-foreground/25'
          }
        `}
      >
        {item.completed && (
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm transition-colors duration-100
          ${item.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}
        `}>
          {item.label}
        </p>
        {item.photoRequired && !item.completed && (
          <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            📷 Foto obrigatória
          </span>
        )}
      </div>

      {/* Completion time or photo */}
      {item.completed && (
        <span className="text-xs text-emerald-600 font-medium shrink-0">✓</span>
      )}

      {/* Photo icon */}
      {item.photoRequired && (
        <div className="shrink-0">
          {isCapturing ? (
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center animate-spin">
              <Camera className="w-4 h-4 text-primary" />
            </div>
          ) : item.photoUrl ? (
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-primary/20">
              <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onCapturePhoto(); }}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center"
            >
              <Camera className="w-4 h-4 text-muted-foreground/60" />
            </button>
          )}
        </div>
      )}
    </label>
  );
});

ChecklistItemCard.displayName = 'ChecklistItemCard';
