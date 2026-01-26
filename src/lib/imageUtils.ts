/**
 * Image utility functions for compression and optimization
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputType: 'image/jpeg',
};

/**
 * Compress and resize an image file
 */
export const compressImage = (
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(
          opts.maxWidth! / width,
          opts.maxHeight! / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Use better quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not compress image'));
          }
        },
        opts.outputType,
        opts.quality
      );

      // Clean up
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Could not load image'));
    };

    // Load the image
    if (file instanceof File) {
      img.src = URL.createObjectURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
};

/**
 * Compress image for thumbnails (smaller size, lower quality)
 */
export const compressForThumbnail = (file: File | Blob): Promise<Blob> => {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,
  });
};

/**
 * Compress image for standard display
 */
export const compressForDisplay = (file: File | Blob): Promise<Blob> => {
  return compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
  });
};

/**
 * Calculate file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Check if camera is available
 */
export const isCameraAvailable = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
};
