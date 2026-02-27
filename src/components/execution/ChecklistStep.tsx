import { useState, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, ArrowRight, AlertTriangle, Utensils, Sofa, BedDouble, Bath as BathIcon, X, Upload, Loader2, Sparkles, Plus, Trash2, ChevronRight } from 'lucide-react';
import { ChecklistSection, ChecklistItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForDisplay } from '@/lib/imageUtils';
import { Input } from '@/components/ui/input';

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
  const [addingItem, setAddingItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const { toast } = useToast();

  const totalItems = checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = checklist.reduce(
    (acc, s) => acc + s.items.filter(i => i.completed).length, 0
  );
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allCompleted = completedItems === totalItems && totalItems > 0;

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

  // Add new item to active section
  const handleAddItem = useCallback(() => {
    if (!newItemLabel.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label: newItemLabel.trim(),
      completed: false,
      photoRequired: false,
    };
    const updated = checklist.map((s, idx) => {
      if (idx !== activeRoomIdx) return s;
      return { ...s, items: [...s.items, newItem] };
    });
    onChecklistChange(updated);
    setNewItemLabel('');
    setAddingItem(false);
    toast({ title: 'Item adicionado', description: newItem.label });
  }, [newItemLabel, checklist, activeRoomIdx, onChecklistChange, toast]);

  // Remove item from active section
  const handleRemoveItem = useCallback((itemId: string) => {
    const updated = checklist.map((s, idx) => {
      if (idx !== activeRoomIdx) return s;
      return { ...s, items: s.items.filter(i => i.id !== itemId) };
    });
    onChecklistChange(updated);
  }, [checklist, activeRoomIdx, onChecklistChange]);

  // Add new room/section
  const handleAddRoom = useCallback(() => {
    if (!newRoomName.trim()) return;
    const newSection: ChecklistSection = {
      id: `room-${Date.now()}`,
      title: newRoomName.trim(),
      items: [],
    };
    onChecklistChange([...checklist, newSection]);
    setNewRoomName('');
    setAddingRoom(false);
    setActiveRoomIdx(checklist.length);
    toast({ title: 'Ambiente adicionado', description: newSection.title });
  }, [newRoomName, checklist, onChecklistChange, toast]);

  // Remove room/section
  const handleRemoveRoom = useCallback((idx: number) => {
    if (checklist.length <= 1) return;
    const updated = checklist.filter((_, i) => i !== idx);
    onChecklistChange(updated);
    if (activeRoomIdx >= updated.length) setActiveRoomIdx(updated.length - 1);
    else if (idx < activeRoomIdx) setActiveRoomIdx(prev => prev - 1);
  }, [checklist, activeRoomIdx, onChecklistChange]);

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
        {/* Progress Bar */}
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

      {/* Room Tabs */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-card/80 border-b border-border/20">
        <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar items-center">
          {checklist.map((section, idx) => {
            const done = section.items.filter(i => i.completed).length;
            const total = section.items.length;
            const isActive = idx === activeRoomIdx;
            const isComplete = done === total && total > 0;
            const RoomIcon = getRoomIcon(section.title);
            const sectionProgress = total > 0 ? (done / total) * 100 : 0;

            return (
              <button
                key={section.id}
                onClick={() => setActiveRoomIdx(idx)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-300 border
                  ${isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground scale-105 shadow-lg shadow-primary/25 border-primary/50'
                    : isComplete
                      ? 'bg-success/10 text-success border-success/20 shadow-sm'
                      : 'bg-card/80 text-muted-foreground border-border/30 hover:border-primary/20 hover:bg-card shadow-sm'
                  }
                `}
              >
                {/* Mini circular progress */}
                {!isActive && !isComplete && total > 0 && (
                  <svg className="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.15} />
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeDasharray={`${sectionProgress * 0.377} 100`}
                      className="text-primary"
                    />
                  </svg>
                )}
                {isComplete && <Check size={12} />}
                {RoomIcon && !isComplete && <RoomIcon size={13} />}
                <span className="truncate max-w-[80px]">{section.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold
                  ${isActive ? 'bg-white/30 text-primary-foreground' : isComplete ? 'bg-success/20 text-success' : 'bg-muted/80 text-muted-foreground'}
                `}>
                  {done}/{total}
                </span>
              </button>
            );
          })}

          {/* Add Room Button */}
          {addingRoom ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                placeholder="Nome..."
                className="h-8 w-28 text-xs rounded-xl"
                onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
                autoFocus
              />
              <button onClick={handleAddRoom} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Check size={12} />
              </button>
              <button onClick={() => { setAddingRoom(false); setNewRoomName(''); }} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingRoom(true)}
              className="w-9 h-9 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors shrink-0"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable checklist */}
      <div className="flex-1 p-4 overflow-y-auto hide-scrollbar pb-4">
        <AnimatePresence mode="wait">
          {activeSection && (
            <motion.div
              key={activeSection.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                  <h2 className="font-bold text-foreground text-base">{activeSection.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold bg-muted/60 px-3 py-1 rounded-full">
                    {sectionDone}/{sectionTotal}
                  </span>
                  {checklist.length > 1 && (
                    <button
                      onClick={() => handleRemoveRoom(activeRoomIdx)}
                      className="w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {activeSection.items.map((item, idx) => (
                    <ChecklistItemCard
                      key={item.id}
                      item={item}
                      index={idx}
                      sectionId={activeSection.id}
                      isCapturing={capturingPhoto === item.id}
                      onToggle={() => toggleItem(activeSection.id, item.id)}
                      onCapturePhoto={() => handlePhotoCapture(activeSection.id, item.id)}
                      onRemove={() => handleRemoveItem(item.id)}
                      userId={userId}
                      jobId={jobId}
                      onPhotoUploaded={(url) => handlePhotoCapture(activeSection.id, item.id, url)}
                    />
                  ))}
                </AnimatePresence>

                {/* Add Item */}
                {addingItem ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5"
                  >
                    <Input
                      value={newItemLabel}
                      onChange={e => setNewItemLabel(e.target.value)}
                      placeholder="Nome da tarefa..."
                      className="flex-1 h-9 text-sm rounded-xl border-none bg-transparent focus-visible:ring-0"
                      onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                      autoFocus
                    />
                    <button onClick={handleAddItem} className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                      <Check size={14} />
                    </button>
                    <button onClick={() => { setAddingItem(false); setNewItemLabel(''); }} className="w-8 h-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setAddingItem(true)}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-muted-foreground/15 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={16} />
                    Adicionar tarefa
                  </motion.button>
                )}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="px-4 py-4 flex gap-3 border-t border-border/20 glass-panel-elevated rounded-none">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-card/80 backdrop-blur-sm text-muted-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 border border-border/40 shadow-sm hover:shadow-md transition-all"
        >
          <span className="text-sm">{t('exec.checklist.pause')}</span>
        </button>
        <button
          onClick={canGoNextRoom ? () => setActiveRoomIdx(prev => prev + 1) : allCompleted ? onNext : undefined}
          disabled={isLastRoom && !allCompleted}
          className={`flex-[2] py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
            ${(canGoNextRoom || allCompleted)
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]'
              : 'bg-muted/60 text-muted-foreground border border-border/30'
            }
          `}
        >
          {canGoNextRoom ? (
            <>
              {t('exec.checklist.nextRoom')}
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={16} />
              </motion.span>
            </>
          ) : allCompleted ? (
            <>{t('exec.checklist.finalize')} <ArrowRight size={16} /></>
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
  const [uploadingCount, setUploadingCount] = useState(0);

  const section = checklist[activeRoomIdx];
  const roomPhotos: string[] = (section as any)?.roomPhotos || [];

  const processAndUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) return null;
    if (!userId || !jobId) return null;

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
    return url;
  }, [userId, jobId, sectionId, uploadPhoto]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadingCount(fileArray.length);

    // Parallel uploads
    const results = await Promise.all(fileArray.map(f => processAndUpload(f)));
    const newUrls = results.filter((u): u is string => !!u);

    if (newUrls.length > 0) {
      const updated = checklist.map((s, idx) => {
        if (idx !== activeRoomIdx) return s;
        return { ...s, roomPhotos: [...roomPhotos, ...newUrls] } as any;
      });
      onChecklistChange(updated);
      toast({ title: `${newUrls.length} foto(s) adicionada(s)`, description: `Fotos do ${sectionTitle} salvas` });
    }

    setUploadingCount(0);
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

  const isLoading = isUploading || uploadingCount > 0;

  return (
    <div className="mt-8">
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={isLoading} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" disabled={isLoading} />

      <div className="glass-panel p-4 rounded-2xl">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Camera size={15} className="text-primary" />
          </div>
          <span className="truncate flex-1">Fotos - {sectionTitle}</span>
          {roomPhotos.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium bg-muted/60 px-2 py-0.5 rounded-full">{roomPhotos.length}</span>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {roomPhotos.map((photo, idx) => (
            <motion.div
              key={`${photo}-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="aspect-square rounded-2xl bg-muted overflow-hidden relative group shadow-sm border border-border/30"
            >
              <img src={photo} alt={`${sectionTitle} ${idx + 1}`} className="w-full h-full object-cover" />
               <button
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center text-destructive-foreground text-xs shadow-md"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}

          {isLoading ? (
            <div className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 bg-primary/5">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {uploadingCount > 1 ? `${uploadingCount} fotos...` : 'Enviando...'}
              </span>
            </div>
          ) : (
            <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-3 bg-card/50 hover:bg-card/80 transition-colors">
              <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-1.5 p-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">Câmera</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 p-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
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
  onRemove: () => void;
  userId?: string;
  jobId?: string;
  onPhotoUploaded?: (url: string) => void;
}

const ChecklistItemCard = memo(({ item, index, sectionId, isCapturing, onToggle, onCapturePhoto, onRemove, userId, jobId, onPhotoUploaded }: ChecklistItemCardProps) => {
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100, height: 0 }}
        transition={{ duration: 0.15 }}
        layout
        className={`
          flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border-2 shadow-sm group
          ${item.completed
            ? 'glass-panel border-success/30 bg-success/5 shadow-success/5'
            : item.photoRequired
              ? 'glass-panel border-primary/20 shadow-primary/5'
              : 'glass-panel border-border/30 hover:border-primary/30 hover:shadow-md'
          }
        `}
      >
        {/* Checkbox */}
        <button
          onClick={e => {
            e.stopPropagation();
            if (item.photoRequired && !item.photoUrl && !item.completed) {
              if (userId && jobId) fileInputRef.current?.click();
              else onCapturePhoto();
            } else {
              onToggle();
            }
          }}
          className="shrink-0"
        >
          <motion.div
            animate={item.completed ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
              ${item.completed
                ? 'bg-gradient-to-br from-success to-success/80 shadow-md shadow-success/30'
                : 'border-2 border-muted-foreground/20 bg-card/50 hover:border-primary/40'
              }
            `}
          >
            {item.completed && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        </button>

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

        {/* Photo icon */}
        {item.photoRequired && (
          <div className="shrink-0">
            {isLoading || isCapturing ? (
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            ) : item.photoUrl ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-primary/30 shadow-md shadow-primary/10">
                <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (userId && jobId) fileInputRef.current?.click();
                  else onCapturePhoto();
                }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center hover:from-primary/25 hover:to-primary/10 transition-all border border-primary/10 shadow-sm"
              >
                <Camera className="w-5 h-5 text-primary" />
              </button>
            )}
          </div>
        )}

        {/* Remove button */}
        {!item.completed && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </motion.div>
    </>
  );
});

ChecklistItemCard.displayName = 'ChecklistItemCard';
