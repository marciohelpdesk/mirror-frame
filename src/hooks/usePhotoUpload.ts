import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type PhotoCategory = 'profile' | 'properties' | 'jobs-before' | 'jobs-after' | 'jobs-damages' | 'jobs-lost-found' | 'jobs-checklist' | `jobs-room-${string}`;

interface UploadOptions {
  userId: string;
  category: PhotoCategory;
  entityId?: string; // property_id or job_id
  fileName?: string;
}

export const usePhotoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getStoragePath = (options: UploadOptions, fileName: string): string => {
    const { userId, category, entityId } = options;
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    switch (category) {
      case 'profile':
        return `${userId}/profile/${timestamp}_${cleanFileName}`;
      case 'properties':
        return `${userId}/properties/${entityId}/${timestamp}_${cleanFileName}`;
      case 'jobs-before':
        return `${userId}/jobs/${entityId}/before/${timestamp}_${cleanFileName}`;
      case 'jobs-after':
        return `${userId}/jobs/${entityId}/after/${timestamp}_${cleanFileName}`;
      case 'jobs-damages':
        return `${userId}/jobs/${entityId}/damages/${timestamp}_${cleanFileName}`;
      case 'jobs-lost-found':
        return `${userId}/jobs/${entityId}/lost-found/${timestamp}_${cleanFileName}`;
      default:
        return `${userId}/misc/${timestamp}_${cleanFileName}`;
    }
  };

  const uploadPhoto = async (
    file: File | Blob,
    options: UploadOptions
  ): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const fileName = file instanceof File ? file.name : 'photo.jpg';
      const path = getStoragePath(options, fileName);

      const { error: uploadError } = await supabase.storage
        .from('cleaning-photos')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cleaning-photos')
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadBase64Photo = async (
    base64Data: string,
    options: UploadOptions
  ): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Remove data URL prefix if present
      const base64 = base64Data.includes('base64,')
        ? base64Data.split('base64,')[1]
        : base64Data;

      // Convert base64 to Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const path = getStoragePath(options, 'photo.jpg');

      const { error: uploadError } = await supabase.storage
        .from('cleaning-photos')
        .upload(path, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cleaning-photos')
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/cleaning-photos\/(.+)$/);
      if (!pathMatch) return false;

      const path = decodeURIComponent(pathMatch[1]);

      const { error } = await supabase.storage
        .from('cleaning-photos')
        .remove([path]);

      return !error;
    } catch {
      return false;
    }
  };

  return {
    uploadPhoto,
    uploadBase64Photo,
    deletePhoto,
    isUploading,
    error,
  };
};
