import { useState, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, ArrowRight, AlertTriangle, Utensils, Sofa, BedDouble, Bath as BathIcon, X, Upload, Loader2, Sparkles } from 'lucide-react';
import { ChecklistSection, ChecklistItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForDisplay } from '@/lib/imageUtils';

interface ChecklistStepProps {
  checklist: ChecklistSection[];
  onChecklistChange: (checklist: ChecklistSection[]) => void;
  onNext: () => void;
  onBack: () => void;
  userId?: string;
  jobId?: string;
}

const ROOM_ICONS: Record<string, typeof Utensils> = {
  kitchen: Utensils, cozinha: Utensils,
  living: Sofa, sala: Sofa,
  bedroom: BedDouble, quarto: BedDouble,
  bathroom: BathIcon, banheiro: BathIcon,
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
  userId,
  jobId,
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

  const handlePhotoCapture = useCallback((sectionId: string, itemId: string, photoUrl?: string) => {
    const updated = checklist.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, photoUrl: photoUrl || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&t=${Date.now()}`, completed: true };
        }),
      };
    });
    onChecklistChange(updated);
    setCapturingPhoto(null);
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
      {/* Header with Glass Effect */}
      <div className="px-5 py-4 border-b border-border/20 glass-panel-elevated rounded-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                {t('exec.checklist.title') || 'Checklist'}
              </p>
              <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{activeSection?.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary tabular-nums">{progress}%</p>
            <p className="text-[10px] text-muted-foreground font-medium">{completedItems}/{totalItems} tarefas</p>
          </div>
        </div>
        {/* Progress Bar with glow */}
        <div className="bg-muted/60 rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-success rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 rounded-full animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* Room Tabs with Glass styling */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-card/80 border-b border-border/20">
        <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
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
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-300 border
                  ${isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground scale-105 shadow-lg shadow-primary/25 border-primary/50'
                    : isComplete
                      ? 'bg-success/10 text-success border-success/20 shadow-sm'
                      : 'bg-card/80 text-muted-foreground border-border/30 hover:border-primary/20 hover:bg-card shadow-sm'
                  }
                `}
              >
                {RoomIcon && <RoomIcon size={13} />}
                <span className="truncate max-w-[80px]">{section.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold
                  ${isActive ? 'bg-white/30 text-primary-foreground' : isComplete ? 'bg-success/20 text-success' : 'bg-muted/80 text-muted-foreground'}
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
            {/* Section header with ornamental details */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="font-bold text-foreground text-base">{activeSection.title}</h2>
              </div>
              <span className="text-xs text-muted-foreground font-semibold bg-muted/60 px-3 py-1 rounded-full">
                {sectionDone}/{sectionTotal}
              </span>
            </div>

            {/* Checklist items with glass cards */}
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
                  userId={userId}
                  jobId={jobId}
                  onPhotoUploaded={(url) => handlePhotoCapture(activeSection.id, item.id, url)}
                />
              ))}
            </div>

            {/* Room Photos Section */}
            <RoomPhotosSection
              sectionId={activeSection.id}
              sectionTitle={activeSection.title}
              userId={userId}
              jobId={jobId}
              checklist={checklist}
              onChecklistChange={onChecklistChange}
              activeRoomIdx={activeRoomIdx}
            />
          </>
        )}
      </div>

      {/* Bottom Bar with Glass Effect */}
      <div className="px-4 py-4 flex gap-3 border-t border-border/20 glass-panel-elevated rounded-none">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-card/80 backdrop-blur-sm text-muted-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 border border-border/40 shadow-sm hover:shadow-md transition-all"
        >
          {t('exec.checklist.pause') || 'Pausar'}
        </button>
        <button
          onClick={canGoNextRoom ? () => setActiveRoomIdx(prev => prev + 1) : allCompleted ? onNext : undefined}
          disabled={isLastRoom && !allCompleted}
          className={`flex-[2] py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300
            ${(canGoNextRoom || allCompleted)
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]'
              : 'bg-muted/60 text-muted-foreground border border-border/30'
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

// ─── Room Photos Section ─────────────────
interface RoomPhotosSectionProps {
  sectionId: string;
  sectionTitle: string;
  userId?: string;
  jobId?: string;
  checklist: ChecklistSection[];
  onChecklistChange: (checklist: ChecklistSection[]) => void;
  activeRoomIdx: number;
}

const RoomPhotosSection = ({ sectionId, sectionTitle, userId, jobId, checklist, onChecklistChange, activeRoomIdx }: RoomPhotosSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const section = checklist[activeRoomIdx];
  const roomPhotos: string[] = (section as any)?.roomPhotos || [];

  const processAndUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (!userId || !jobId) return;

    setIsProcessing(true);
    let fileToUpload: File | Blob = file;
    try {
      const compressed = await compressForDisplay(file);
      if (compressed.size < file.size) fileToUpload = compressed;
    } catch {}

    const url = await uploadPhoto(fileToUpload, {
      userId,
      category: `jobs-room-${sectionId}`,
      entityId: jobId,
    });
    setIsProcessing(false);

    if (url) {
      const updated = checklist.map((s, idx) => {
        if (idx !== activeRoomIdx) return s;
        return { ...s, roomPhotos: [...roomPhotos, url] } as any;
      });
      onChecklistChange(updated);
      toast({ title: 'Foto adicionada', description: `Foto do ${sectionTitle} salva` });
    }
  }, [userId, jobId, sectionId, activeRoomIdx, checklist, roomPhotos, onChecklistChange, uploadPhoto, toast, sectionTitle]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      await processAndUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const updated = checklist.map((s, idx) => {
      if (idx !== activeRoomIdx) return s;
      const photos = [...roomPhotos];
      photos.splice(index, 1);
      return { ...s, roomPhotos: photos } as any;
    });
    onChecklistChange(updated);
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div className="mt-8">
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={isLoading} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" disabled={isLoading} />

      <div className="glass-panel p-4">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Camera size={15} className="text-primary" />
          </div>
          <span className="truncate">Fotos - {sectionTitle}</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {roomPhotos.map((photo, idx) => (
            <div key={`${photo}-${idx}`} className="aspect-square rounded-2xl bg-muted overflow-hidden relative group shadow-sm border border-border/30">
              <img src={photo} alt={`${sectionTitle} ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center text-destructive-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {isLoading ? (
            <div className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 bg-primary/5">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">Enviando...</span>
            </div>
          ) : (
            <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-3 bg-card/50 hover:bg-card/80 transition-colors">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-1"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">Câmera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-1"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">Galeria</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
  userId?: string;
  jobId?: string;
  onPhotoUploaded?: (url: string) => void;
}

const ChecklistItemCard = memo(({ item, index, sectionId, isCapturing, onToggle, onCapturePhoto, userId, jobId, onPhotoUploaded }: ChecklistItemCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !jobId || !onPhotoUploaded) return;

    setIsProcessing(true);
    let fileToUpload: File | Blob = file;
    try {
      const compressed = await compressForDisplay(file);
      if (compressed.size < file.size) fileToUpload = compressed;
    } catch {}

    const url = await uploadPhoto(fileToUpload, {
      userId,
      category: 'jobs-checklist',
      entityId: jobId,
    });
    setIsProcessing(false);

    if (url) {
      onPhotoUploaded(url);
    }
    if (e.target) e.target.value = '';
  }, [userId, jobId, uploadPhoto, onPhotoUploaded]);

  const isLoading = isUploading || isProcessing;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoFile}
        className="hidden"
      />
      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`
          flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 shadow-sm
          ${item.completed
            ? 'glass-panel border-success/30 bg-success/5 shadow-success/5'
            : item.photoRequired
              ? 'glass-panel border-primary/20 shadow-primary/5'
              : 'glass-panel border-border/30 hover:border-primary/30 hover:shadow-md active:scale-[0.99]'
          }
        `}
        onClick={(e) => {
          e.preventDefault();
          if (item.photoRequired && !item.photoUrl && !item.completed) {
            if (userId && jobId) {
              fileInputRef.current?.click();
            } else {
              onCapturePhoto();
            }
          } else {
            onToggle();
          }
        }}
      >
        {/* Checkbox with animation */}
        <motion.div
          animate={item.completed ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`
            w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
            ${item.completed
              ? 'bg-gradient-to-br from-success to-success/80 shadow-md shadow-success/30'
              : 'border-2 border-muted-foreground/20 bg-card/50'
            }
          `}
        >
          {item.completed && (
            <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />
          )}
        </motion.div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm transition-colors duration-200 truncate
            ${item.completed ? 'line-through text-muted-foreground/50' : 'text-foreground'}
          `}>
            {item.label}
          </p>
          {item.photoRequired && !item.completed && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold border border-primary/10">
              📷 Foto obrigatória
            </span>
          )}
        </div>

        {/* Status indicator */}
        {item.completed && (
          <span className="text-xs text-success font-bold shrink-0">✓</span>
        )}

        {/* Photo icon */}
        {item.photoRequired && (
          <div className="shrink-0">
            {isLoading || isCapturing ? (
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            ) : item.photoUrl ? (
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/20 shadow-sm">
                <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (userId && jobId) {
                    fileInputRef.current?.click();
                  } else {
                    onCapturePhoto();
                  }
                }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center hover:from-primary/25 hover:to-primary/10 transition-all border border-primary/10 shadow-sm"
              >
                <Camera className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>
        )}
      </motion.label>
    </>
  );
});

ChecklistItemCard.displayName = 'ChecklistItemCard';
