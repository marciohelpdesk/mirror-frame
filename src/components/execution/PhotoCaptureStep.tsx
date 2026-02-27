import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Image as ImageIcon, ArrowRight, Upload, Loader2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForDisplay } from '@/lib/imageUtils';

interface PhotoCaptureStepProps {
  type: 'before' | 'after';
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
  minPhotos?: number;
  userId: string;
  jobId: string;
}

export const PhotoCaptureStep = ({
  type,
  photos,
  onPhotosChange,
  onNext,
  onBack,
  minPhotos = 0,
  userId,
  jobId,
}: PhotoCaptureStepProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { uploadPhoto, deletePhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();

  const category = type === 'before' ? 'jobs-before' : 'jobs-after';

  const processAndUploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      return null;
    }

    let fileToUpload: File | Blob = file;
    try {
      const compressedBlob = await compressForDisplay(file);
      if (compressedBlob.size < file.size) {
        fileToUpload = compressedBlob;
      }
    } catch (err) {
      console.warn('Compression failed, using original:', err);
    }

    const url = await uploadPhoto(fileToUpload, {
      userId,
      category,
      entityId: jobId,
    });

    return url || null;
  }, [userId, category, jobId, uploadPhoto]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    const results = await Promise.all(
      Array.from(files).map(file => processAndUploadFile(file))
    );

    const newUrls = results.filter((url): url is string => url !== null);

    if (newUrls.length > 0) {
      onPhotosChange([...photos, ...newUrls]);
      toast({
        title: t('exec.photo.uploaded'),
        description: `${newUrls.length} ${t('exec.photo.photosCaptured')}`,
      });
    }

    if (newUrls.length < files.length) {
      toast({
        title: t('common.error'),
        description: t('exec.photo.uploadFailed'),
        variant: 'destructive',
      });
    }

    setIsProcessing(false);

    if (e.target) {
      e.target.value = '';
    }
  }, [photos, processAndUploadFile, onPhotosChange, toast, t]);

  const handleRemovePhoto = async (index: number) => {
    const photoUrl = photos[index];
    if (photoUrl && photoUrl.includes('supabase')) {
      await deletePhoto(photoUrl);
    }
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const openCamera = () => cameraInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();

  const isLoading = isUploading || isProcessing;
  const canProceed = photos.length >= minPhotos;
  const canSkip = minPhotos === 0 && photos.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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

      <div className="px-4 py-3">
        <h2 className="text-xl font-semibold text-foreground">
          {type === 'before' ? t('exec.photo.beforeTitle') : t('exec.photo.afterTitle')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {type === 'before' ? t('exec.photo.beforeDesc') : t('exec.photo.afterDesc')}
        </p>
      </div>

      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <motion.div
              key={`${photo}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden glass-panel"
            >
              <img
                src={photo}
                alt={`${type} photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </motion.div>
          ))}

          {isLoading ? (
            <motion.div className="aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                {isProcessing ? t('exec.photo.optimizing') : t('exec.photo.uploading')}
              </span>
            </motion.div>
          ) : (
            <motion.div className="aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2">
              <button
                onClick={openCamera}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-[10px] text-muted-foreground">Camera</span>
              </button>
              <button
                onClick={openFilePicker}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">Gallery</span>
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 py-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {photos.length} {t('exec.photo.photosCaptured')}
          </span>
        </div>
      </div>

      <div className="p-4 flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 rounded-xl"
            disabled={isLoading}
          >
            {t('common.back')}
          </Button>
        )}
        {canSkip ? (
          <Button
            variant="ghost"
            onClick={onNext}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl gap-2 text-muted-foreground"
          >
            <SkipForward className="w-4 h-4" />
            {t('exec.photo.skip')}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
          >
            {t('common.continue')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
