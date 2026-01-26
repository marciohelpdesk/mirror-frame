import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';

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
}: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const { uploadPhoto, deletePhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
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

    // Upload to Supabase Storage
    const url = await uploadPhoto(file, {
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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (preview && preview.includes('supabase')) {
      await deletePhoto(preview);
    }
    setPreview(null);
    onPhotoChange(null);
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden`}>
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          {!isUploading && (
            <>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-destructive/90 rounded-full flex items-center justify-center shadow-md hover:bg-destructive transition-colors"
              >
                <X className="w-4 h-4 text-destructive-foreground" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-8 h-8 bg-primary/90 rounded-full flex items-center justify-center shadow-md hover:bg-primary transition-colors"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          whileTap={{ scale: 0.98 }}
          className={`w-full ${aspectClass} rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">{placeholder}</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};
