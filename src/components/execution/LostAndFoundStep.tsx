import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Camera, MapPin, ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LostAndFoundItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForThumbnail } from '@/lib/imageUtils';

interface LostAndFoundStepProps {
  items: LostAndFoundItem[];
  onItemsChange: (items: LostAndFoundItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  userId: string;
  jobId: string;
}

export const LostAndFoundStep = ({ items, onItemsChange, onNext, onBack, userId, jobId }: LostAndFoundStepProps) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LostAndFoundItem>>({
    description: '',
    location: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();

  const processAndUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('exec.photo.invalidFile'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    let fileToUpload: File | Blob = file;

    try {
      const compressedBlob = await compressForThumbnail(file);
      if (compressedBlob.size < file.size) {
        fileToUpload = compressedBlob;
      }
    } catch (err) {
      console.warn('Compression failed, using original:', err);
    }

    const url = await uploadPhoto(fileToUpload, {
      userId,
      category: 'jobs-lost-found',
      entityId: jobId,
    });

    setIsProcessing(false);

    if (url) {
      setNewItem(prev => ({ ...prev, photoUrl: url }));
    } else {
      toast({
        title: t('common.error'),
        description: t('exec.photo.uploadFailed'),
        variant: 'destructive',
      });
    }
  }, [userId, jobId, uploadPhoto, toast, t]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUpload(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAddItem = () => {
    if (!newItem.description?.trim()) return;
    
    const item: LostAndFoundItem = {
      id: `lf${Date.now()}`,
      description: newItem.description.trim(),
      location: newItem.location?.trim() || '',
      photoUrl: newItem.photoUrl,
      date: new Date().toISOString().split('T')[0],
    };
    
    onItemsChange([...items, item]);
    setNewItem({ description: '', location: '' });
    setIsAdding(false);
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter(i => i.id !== id));
  };

  const isLoading = isUploading || isProcessing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('exec.lostFound.title')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('exec.lostFound.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        {/* Existing Items */}
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-3 mb-3"
            >
              <div className="flex items-start gap-3">
                {item.photoUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{item.description}</p>
                  {item.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.location}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">{item.date}</p>
                </div>
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Item Form */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-4 mb-3"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">{t('exec.lostFound.newItem')}</h3>
              
              {/* Description */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.lostFound.description')}</p>
                <Input
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('exec.lostFound.descPlaceholder')}
                  className="bg-card/50 border-muted"
                />
              </div>

              {/* Location */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.lostFound.location')}</p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newItem.location || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('exec.lostFound.locationPlaceholder')}
                    className="pl-9 bg-card/50 border-muted"
                  />
                </div>
              </div>

              {/* Photo */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.lostFound.photo')}</p>
                {isLoading ? (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground">
                      {isProcessing ? 'Optimizing...' : 'Uploading...'}
                    </span>
                  </div>
                ) : newItem.photoUrl ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={newItem.photoUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewItem(prev => ({ ...prev, photoUrl: undefined }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-accent transition-colors"
                    >
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Gallery</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={!newItem.description?.trim() || isLoading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {t('common.add')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-muted flex items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">{t('exec.lostFound.addItem')}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {items.length === 0 && !isAdding && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t('exec.lostFound.noItems')}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {t('common.continue')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
