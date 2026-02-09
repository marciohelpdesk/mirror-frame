import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, ChevronDown, ChevronUp, ArrowRight, AlertTriangle } from 'lucide-react';
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

export const ChecklistStep = ({
  checklist,
  onChecklistChange,
  onNext,
  onBack,
}: ChecklistStepProps) => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    checklist.map(s => s.id)
  );
  const [capturingPhoto, setCapturingPhoto] = useState<string | null>(null);

  const totalItems = checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = checklist.reduce(
    (acc, s) => acc + s.items.filter(i => i.completed).length, 0
  );
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allCompleted = completedItems === totalItems;

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    const updated = checklist.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              if (item.photoRequired && !item.completed && !item.photoUrl) {
                setCapturingPhoto(itemId);
                return item;
              }
              return { ...item, completed: !item.completed };
            }
            return item;
          }),
        };
      }
      return section;
    });
    onChecklistChange(updated);
  };

  const handlePhotoCapture = (sectionId: string, itemId: string) => {
    setTimeout(() => {
      const updated = checklist.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === itemId) {
                return { ...item, photoUrl: `${DEMO_TASK_PHOTO}&t=${Date.now()}`, completed: true };
              }
              return item;
            }),
          };
        }
        return section;
      });
      onChecklistChange(updated);
      setCapturingPhoto(null);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Scrollable checklist */}
      <div className="flex-1 px-4 pt-2 overflow-y-auto hide-scrollbar pb-4">
        {checklist.map(section => {
          const done = section.items.filter(i => i.completed).length;
          const total = section.items.length;
          const isExpanded = expandedSections.includes(section.id);
          const isComplete = done === total;

          return (
            <div key={section.id} className="mb-4">
              {/* Section Header - Breezeway style */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between py-2 px-1"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide text-primary uppercase">
                    {section.title}
                  </h3>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {done}/{total}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Section Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      {section.items.map((item, idx) => (
                        <ChecklistItemCard
                          key={item.id}
                          item={item}
                          index={idx}
                          isCapturing={capturingPhoto === item.id}
                          onToggle={() => toggleItem(section.id, item.id)}
                          onCapturePhoto={() => handlePhotoCapture(section.id, item.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar - Progress + Finalize */}
      <div className="px-4 py-3 flex items-center gap-3 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <LiquidProgressBubble percentage={progress} size={48} showPercentage />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {t('exec.checklist.title')}
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {allCompleted
                ? t('exec.checklist.allDone') || 'Tudo pronto!'
                : `${totalItems - completedItems} ${t('exec.checklist.remaining')}`}
            </p>
          </div>
        </div>
        <Button
          onClick={allCompleted ? onNext : undefined}
          disabled={!allCompleted}
          className={`h-12 px-6 rounded-2xl text-sm font-semibold gap-2 transition-all ${
            allCompleted
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {allCompleted ? (t('exec.checklist.finalize') || 'Finalizar') : `${completedItems}/${totalItems}`}
          {allCompleted && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

// ─── Item Card Component ─────────────────────────

interface ChecklistItemCardProps {
  item: ChecklistItem;
  index: number;
  isCapturing: boolean;
  onToggle: () => void;
  onCapturePhoto: () => void;
}

const ChecklistItemCard = ({ item, index, isCapturing, onToggle, onCapturePhoto }: ChecklistItemCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`
        relative rounded-2xl border px-4 py-4 flex items-center gap-3
        transition-all duration-200
        ${item.completed
          ? 'bg-primary/[0.04] border-primary/20'
          : 'bg-card/60 border-border/40 hover:border-border/60'
        }
      `}
    >
      {/* Checkbox */}
      <button
        onClick={item.photoRequired && !item.photoUrl ? onCapturePhoto : onToggle}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
          ${item.completed
            ? 'bg-primary shadow-md shadow-primary/25'
            : 'border-2 border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
          }
        `}
      >
        {item.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Label */}
      <span
        className={`
          flex-1 text-sm transition-all duration-200
          ${item.completed
            ? 'line-through text-muted-foreground/60'
            : 'text-foreground font-medium'
          }
        `}
      >
        {item.label}
      </span>

      {/* Action Icons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Photo icon */}
        {item.photoRequired && (
          <>
            {isCapturing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-primary" />
              </motion.div>
            ) : item.photoUrl ? (
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-primary/20">
                <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button
                onClick={onCapturePhoto}
                className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Camera className="w-4 h-4 text-muted-foreground/60" />
              </button>
            )}
          </>
        )}

        {/* Warning/report icon */}
        <div className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-muted-foreground/40" />
        </div>
      </div>
    </motion.div>
  );
};
