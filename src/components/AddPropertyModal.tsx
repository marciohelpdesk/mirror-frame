import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Home, MapPin, Key, Wifi, FileText, DollarSign, Bed, Bath, Ruler } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { PhotoUploader } from '@/components/PhotoUploader';

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Loft', 'Studio'] as const;
const SERVICE_TYPES = [
  'House Cleaning',
  'Deep Cleaning', 
  'Airbnb Cleaning',
  'Move in/Out',
  'Recurring Cleaning',
  'Commercial Cleaning',
  'Office Cleaning',
  'Post Construction'
] as const;
const STATUS_OPTIONS = ['READY', 'NEEDS_CLEANING', 'OCCUPIED'] as const;

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  type: z.enum(PROPERTY_TYPES, { required_error: 'Please select a property type' }),
  serviceType: z.enum(SERVICE_TYPES, { required_error: 'Please select a service type' }),
  status: z.enum(STATUS_OPTIONS, { required_error: 'Please select a status' }),
  accessCode: z.string().max(20, 'Access code must be less than 20 characters').optional(),
  wifiPassword: z.string().max(50, 'WiFi password must be less than 50 characters').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  suppliesLocation: z.string().max(200, 'Supplies location must be less than 200 characters').optional(),
  basePrice: z.coerce.number().min(0, 'Price cannot be negative').optional(),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative').max(20, 'Max 20 bedrooms').optional(),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative').max(20, 'Max 20 bathrooms').optional(),
  sqft: z.coerce.number().min(0, 'Cannot be negative').max(50000, 'Max 50,000 sqft').optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (property: Property) => void;
  userId?: string;
}

export const AddPropertyModal = ({ open, onOpenChange, onAdd, userId }: AddPropertyModalProps) => {
  const { t } = useLanguage();
  const [photo, setPhoto] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      type: undefined,
      serviceType: undefined,
      status: 'READY',
      accessCode: '',
      wifiPassword: '',
      notes: '',
      suppliesLocation: '',
      basePrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      sqft: undefined,
    },
  });

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const onSubmit = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: `p${Date.now()}`,
      name: values.name,
      address: values.address,
      type: values.type,
      serviceType: values.serviceType,
      status: values.status,
      accessCode: values.accessCode || undefined,
      wifiPassword: values.wifiPassword || undefined,
      notes: values.notes || undefined,
      suppliesLocation: values.suppliesLocation || undefined,
      basePrice: values.basePrice || undefined,
      bedrooms: values.bedrooms || undefined,
      bathrooms: values.bathrooms || undefined,
      sqft: values.sqft || undefined,
      photo: photo || undefined,
    };

    onAdd(newProperty);
    toast({
      title: t('propertyModal.addedTitle'),
      description: t('propertyModal.addedDescription').replace('{name}', values.name),
    });
    
    // Reset form
    form.reset();
    setPhoto(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-0 max-w-[95%] max-h-[90vh] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            {t('propertyModal.title')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(90vh-80px)]">
            <div className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="field-label">{t('propertyModal.photo')}</label>
                {userId ? (
                  <PhotoUploader
                    userId={userId}
                    category="properties"
                    currentPhoto={photo}
                    onPhotoChange={(url) => setPhoto(url)}
                    aspectRatio="video"
                    placeholder={t('propertyModal.addPhoto')}
                  />
                ) : (
                  <div className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">{t('propertyModal.addPhoto')}</span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="glass-panel p-3 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  {t('propertyModal.basicInfo')}
                </h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">{t('propertyModal.name')} *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Ocean View Loft" 
                          className="h-11 rounded-xl bg-card/50 border-muted"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t('propertyModal.address')} *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Beach Ave, Santa Monica" 
                          className="h-11 rounded-xl bg-card/50 border-muted"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">{t('propertyModal.type')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-card/50 border-muted">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">{t('propertyModal.status')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-card/50 border-muted">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="READY">Ready</SelectItem>
                            <SelectItem value="NEEDS_CLEANING">Needs Cleaning</SelectItem>
                            <SelectItem value="OCCUPIED">Occupied</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">{t('propertyModal.serviceType')} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl bg-card/50 border-muted">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Details */}
              <div className="glass-panel p-3 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  {t('propertyModal.propertyDetails')}
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label flex items-center gap-1">
                          <Bed className="w-3 h-3" /> {t('propertyModal.beds')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            className="h-11 rounded-xl bg-card/50 border-muted"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label flex items-center gap-1">
                          <Bath className="w-3 h-3" /> {t('propertyModal.baths')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            className="h-11 rounded-xl bg-card/50 border-muted"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sqft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">{t('propertyModal.sqft')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            className="h-11 rounded-xl bg-card/50 border-muted"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {t('propertyModal.basePrice')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          className="h-11 rounded-xl bg-card/50 border-muted"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Access Info */}
              <div className="glass-panel p-3 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  {t('propertyModal.accessInfo')}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="accessCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label flex items-center gap-1">
                          <Key className="w-3 h-3" /> {t('propertyModal.accessCode')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1234"
                            className="h-11 rounded-xl bg-card/50 border-muted font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wifiPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label flex items-center gap-1">
                          <Wifi className="w-3 h-3" /> {t('propertyModal.wifiPassword')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., guest_wifi"
                            className="h-11 rounded-xl bg-card/50 border-muted font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="suppliesLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">{t('propertyModal.suppliesLocation')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Hallway closet, code 0000"
                          className="h-11 rounded-xl bg-card/50 border-muted"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="glass-panel p-3 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {t('propertyModal.notes')}
                </h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">{t('propertyModal.specialInstructions')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special notes or instructions for cleaners..."
                          className="min-h-[80px] resize-none rounded-xl bg-card/50 border-muted"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border/20 flex gap-3 bg-card/50 backdrop-blur-sm">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-2xl border-border/40 hover:bg-muted/60"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground gap-2 shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('propertyModal.addProperty')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
