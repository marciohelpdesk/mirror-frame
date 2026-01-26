import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistSection, ChecklistItem } from '@/types';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChecklistStepProps {
  checklist: ChecklistSection[];
  onChecklistChange: (checklist: ChecklistSection[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// Demo photo for items requiring photos
const DEMO_TASK_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';

export const ChecklistStep = ({
  checklist,
  onChecklistChange,
  onNext,
  onBack,
}: ChecklistStepProps) => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    checklist.length > 0 ? [checklist[0].id] : []
  );
  const [capturingPhoto, setCapturingPhoto] = useState<string | null>(null);

  // Calculate progress
  const totalItems = checklist.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = checklist.reduce(
    (acc, section) => acc + section.items.filter(item => item.completed).length,
    0
  );
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    const updatedChecklist = checklist.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              // If item requires photo and being completed, we need photo first
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
    onChecklistChange(updatedChecklist);
  };

  const handlePhotoCapture = (sectionId: string, itemId: string) => {
    // Simulate photo capture
    setTimeout(() => {
      const updatedChecklist = checklist.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  photoUrl: `${DEMO_TASK_PHOTO}&t=${Date.now()}`,
                  completed: true,
                };
              }
              return item;
            }),
          };
        }
        return section;
      });
      onChecklistChange(updatedChecklist);
      setCapturingPhoto(null);
    }, 500);
  };

  const getSectionProgress = (section: ChecklistSection) => {
    const completed = section.items.filter(item => item.completed).length;
    return { completed, total: section.items.length };
  };

  const allCompleted = completedItems === totalItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header with Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-foreground">{t('exec.checklist.title')}</h2>
          <span className="text-sm font-medium text-primary">
            {completedItems}/{totalItems}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Checklist Sections */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar pb-4">
        {checklist.map(section => {
          const { completed, total } = getSectionProgress(section);
          const isExpanded = expandedSections.includes(section.id);
          const isComplete = completed === total;

          return (
            <motion.div
              key={section.id}
              className="mb-3"
              layout
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  w-full glass-panel p-3 flex items-center justify-between
                  ${isComplete ? 'border-l-4 border-l-primary' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isComplete ? 'bg-primary' : 'bg-muted'}
                  `}>
                    {isComplete ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {completed}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {completed} {t('exec.checklist.of')} {total} {t('exec.checklist.tasks')}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
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
                    <div className="pt-2 space-y-2">
                      {section.items.map(item => (
                        <ChecklistItemRow
                          key={item.id}
                          item={item}
                          isCapturing={capturingPhoto === item.id}
                          onToggle={() => toggleItem(section.id, item.id)}
                          onCapturePhoto={() => handlePhotoCapture(section.id, item.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl"
        >
          {t('common.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!allCompleted}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {allCompleted ? t('common.continue') : `${totalItems - completedItems} ${t('exec.checklist.remaining')}`}
          {allCompleted && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

interface ChecklistItemRowProps {
  item: ChecklistItem;
  isCapturing: boolean;
  onToggle: () => void;
  onCapturePhoto: () => void;
}

const ChecklistItemRow = ({ item, isCapturing, onToggle, onCapturePhoto }: ChecklistItemRowProps) => {
  return (
    <motion.div
      layout
      className={`
        ml-4 p-3 rounded-xl bg-card/50 flex items-center gap-3
        ${item.completed ? 'opacity-60' : ''}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={item.photoRequired && !item.photoUrl ? onCapturePhoto : onToggle}
        className={`
          w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors
          ${item.completed
            ? 'bg-primary'
            : 'border-2 border-muted-foreground/30 hover:border-primary'
          }
        `}
      >
        {item.completed && <Check className="w-4 h-4 text-primary-foreground" />}
      </button>

      {/* Label */}
      <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {item.label}
      </span>

      {/* Photo indicator/button */}
      {item.photoRequired && (
        <div className="shrink-0">
          {isCapturing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <Camera className="w-4 h-4 text-primary" />
            </motion.div>
          ) : item.photoUrl ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button
              onClick={onCapturePhoto}
              className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"
            >
              <Camera className="w-4 h-4 text-amber-600" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
