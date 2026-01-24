import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Property } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export const JOB_TYPES = ['Standard', 'Deep Clean', 'Move-out'] as const;
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export interface JobFormData {
  propertyId: string;
  clientName: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  jobType: typeof JOB_TYPES[number];
  price: string;
}

interface JobFormFieldsProps {
  formData: JobFormData;
  onChange: (data: Partial<JobFormData>) => void;
  properties: Property[];
  disablePropertyChange?: boolean;
}

export const JobFormFields = ({ formData, onChange, properties, disablePropertyChange }: JobFormFieldsProps) => {
  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  return (
    <div className="space-y-4">
      {/* Property Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Property
        </Label>
        <Select 
          value={formData.propertyId} 
          onValueChange={(v) => onChange({ propertyId: v })}
          disabled={disablePropertyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Name */}
      <div className="space-y-2">
        <Label>Client Name (optional)</Label>
        <Input
          value={formData.clientName}
          onChange={(e) => onChange({ clientName: e.target.value })}
          placeholder={selectedProperty?.name || 'Enter client name'}
        />
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.selectedDate ? format(formData.selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.selectedDate}
              onSelect={(date) => onChange({ selectedDate: date })}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Time
        </Label>
        <Select value={formData.selectedTime} onValueChange={(v) => onChange({ selectedTime: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {TIME_SLOTS.map(time => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          Job Type
        </Label>
        <Select 
          value={formData.jobType} 
          onValueChange={(v) => onChange({ jobType: v as typeof JOB_TYPES[number] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          Price (optional)
        </Label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => onChange({ price: e.target.value })}
          placeholder={selectedProperty?.basePrice?.toString() || '0'}
        />
      </div>
    </div>
  );
};