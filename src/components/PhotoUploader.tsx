import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForDisplay } from '@/lib/imageUtils';

type PhotoCategory = 'profile' | 'properties' | 'jobs-before' | 'jobs-after' | 'jobs-damages' | 'jobs-lost-found';

interface PhotoUploaderProps {
  userId: string;
  category: PhotoCategory;
  entityId?: string;
  currentPhoto?: string | null;
  onPhotoChange: (url: string | null) => void;
  aspectRatio?: 'square' | 'video';
  placeholder?: string;
  className?: string;
  showCameraOption?: boolean;
}

export const PhotoUploader = ({
  userId,
  category,
  entityId,
  currentPhoto,
  onPhotoChange,
  aspectRatio = 'video',
  placeholder = 'Tap to upload photo',
  className = '',
  showCameraOption = true,
}: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const { uploadPhoto, deletePhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();

  const processAndUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Compress the image
    setIsCompressing(true);
    let fileToUpload: File | Blob = file;

    try {
      const compressedBlob = await compressForDisplay(file);
      // Only use compressed version if it's smaller
      if (compressedBlob.size < file.size) {
        fileToUpload = compressedBlob;
      }
    } catch (err) {
      console.warn('Compression failed, using original:', err);
    } finally {
      setIsCompressing(false);
    }

    // Upload to Supabase Storage
    const url = await uploadPhoto(fileToUpload, {
      userId,
      category,
      entityId,
    });

    if (url) {
      setPreview(url);
      onPhotoChange(url);
      toast({
        title: 'Photo uploaded',
        description: 'Your photo has been uploaded successfully',
      });
    } else {
      // Revert preview on error
      setPreview(currentPhoto || null);
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  }, [userId, category, entityId, currentPhoto, uploadPhoto, onPhotoChange, toast]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUpload(file);
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (preview && preview.includes('supabase')) {
      await deletePhoto(preview);
    }
    setPreview(null);
    onPhotoChange(null);
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const isLoading = isUploading || isCompressing;
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* Hidden file input for camera capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {preview ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden`}>
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          {!isLoading && (
            <>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-destructive/90 rounded-full flex items-center justify-center shadow-md hover:bg-destructive transition-colors"
              >
                <X className="w-4 h-4 text-destructive-foreground" />
              </button>
              <div className="absolute bottom-2 right-2 flex gap-2">
                {showCameraOption && (
                  <button
                    type="button"
                    onClick={openCamera}
                    className="w-8 h-8 bg-secondary/90 rounded-full flex items-center justify-center shadow-md hover:bg-secondary transition-colors"
                  >
                    <Camera className="w-4 h-4 text-secondary-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="w-8 h-8 bg-primary/90 rounded-full flex items-center justify-center shadow-md hover:bg-primary transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">
                {isCompressing ? 'Optimizing...' : 'Uploading...'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full ${aspectClass} rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center`}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                {isCompressing ? 'Optimizing...' : 'Uploading...'}
              </span>
            </div>
          ) : showCameraOption ? (
            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={openCamera}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Camera</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={openFilePicker}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Gallery</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={openFilePicker}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">{placeholder}</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
