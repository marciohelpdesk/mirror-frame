import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, X, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoCaptureStepProps {
  type: 'before' | 'after';
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
  minPhotos?: number;
}

// Demo placeholder images
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
];

export const PhotoCaptureStep = ({
  type,
  photos,
  onPhotosChange,
  onNext,
  onBack,
  minPhotos = 1,
}: PhotoCaptureStepProps) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate camera capture with demo photo
    setTimeout(() => {
      const randomPhoto = DEMO_PHOTOS[Math.floor(Math.random() * DEMO_PHOTOS.length)];
      onPhotosChange([...photos, `${randomPhoto}&t=${Date.now()}`]);
      setIsCapturing(false);
    }, 500);
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const canProceed = photos.length >= minPhotos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3">
        <h2 className="text-xl font-semibold text-foreground">
          {type === 'before' ? 'Before Photos' : 'After Photos'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {type === 'before'
            ? 'Capture the current state before cleaning'
            : 'Document your completed work'}
        </p>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
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

          {/* Add Photo Button */}
          <motion.button
            onClick={handleCapture}
            disabled={isCapturing}
            whileTap={{ scale: 0.95 }}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {isCapturing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Camera className="w-8 h-8" />
              </motion.div>
            ) : (
              <>
                <Plus className="w-8 h-8" />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Photo count indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 py-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
            {!canProceed && ` (minimum ${minPhotos})`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 rounded-xl"
          >
            Back
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
