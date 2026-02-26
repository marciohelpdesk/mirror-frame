import { useState, useEffect } from 'react';
import { z } from 'zod';
import { User, Save, X } from 'lucide-react';
import { UserProfile } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PhotoUploader } from '@/components/PhotoUploader';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().max(20, 'Phone must be less than 20 characters').optional(),
});

export const EditProfileModal = ({ isOpen, onClose, userProfile, onUpdateProfile }: EditProfileModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setPhone(userProfile.phone);
      setAvatar(userProfile.avatar);
      setErrors({});
    }
  }, [isOpen, userProfile]);

  const handleSubmit = () => {
    const result = profileSchema.safeParse({ name, email, phone });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    
    onUpdateProfile({
      ...userProfile,
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || '',
      avatar,
    });

    toast({
      title: t('profile.updated'),
      description: t('profile.updatedDesc'),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 max-w-[95%] sm:max-w-md max-h-[90vh] rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            {t('profile.edit')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 px-5 pb-5 overflow-y-auto max-h-[65vh]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center glass-panel p-4">
            {user?.id ? (
              <div className="w-28">
                <PhotoUploader
                  userId={user.id}
                  category="profile"
                  currentPhoto={avatar || undefined}
                  onPhotoChange={(url) => setAvatar(url || '')}
                  aspectRatio="square"
                  placeholder={t('profile.changePhoto')}
                  className="rounded-full overflow-hidden"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg overflow-hidden bg-muted flex items-center justify-center">
                <User size={32} className="text-muted-foreground" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">{t('profile.changePhoto')}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="field-label">{t('profile.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.name')}
                className={`h-11 rounded-xl bg-card/50 border-muted ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="field-label">{t('profile.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('profile.email')}
                className={`h-11 rounded-xl bg-card/50 border-muted ${errors.email ? 'border-destructive' : ''}`}
                disabled
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="field-label">{t('profile.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('profile.phone')}
                className={`h-11 rounded-xl bg-card/50 border-muted ${errors.phone ? 'border-destructive' : ''}`}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="field-label">{t('profile.role')}</Label>
              <div className="flex items-center h-11 px-3 rounded-xl bg-card/50 border border-muted">
                <Badge variant="secondary" className="text-xs font-medium">
                  {userProfile.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-1.5" />
            {t('common.cancel')}
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25"
            onClick={handleSubmit}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
