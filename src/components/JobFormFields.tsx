import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Briefcase, DollarSign, Users } from 'lucide-react';
import { Property, Employee } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  checkoutTime: string;
  checkinDeadline: string;
  jobType: typeof JOB_TYPES[number];
  price: string;
  assignedTo: string;
}

interface JobFormFieldsProps {
  formData: JobFormData;
  onChange: (data: Partial<JobFormData>) => void;
  properties: Property[];
  employees?: Employee[];
  disablePropertyChange?: boolean;
}

export const JobFormFields = ({ formData, onChange, properties, employees = [], disablePropertyChange }: JobFormFieldsProps) => {
  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const inputClass = "h-11 rounded-xl bg-card/50 border-muted";
  const selectTriggerClass = "h-11 rounded-xl bg-card/50 border-muted";

  return (
    <div className="space-y-4">
      {/* Property Selection */}
      <div className="space-y-1.5">
        <Label className="field-label flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Property
        </Label>
        <Select 
          value={formData.propertyId} 
          onValueChange={(v) => onChange({ propertyId: v })}
          disabled={disablePropertyChange}
        >
          <SelectTrigger className={selectTriggerClass}>
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
      <div className="space-y-1.5">
        <Label className="field-label">Client Name (optional)</Label>
        <Input
          value={formData.clientName}
          onChange={(e) => onChange({ clientName: e.target.value })}
          placeholder={selectedProperty?.name || 'Enter client name'}
          className={inputClass}
        />
      </div>

      {/* Date Picker */}
      <div className="space-y-1.5">
        <Label className="field-label flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5" />
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                inputClass,
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

      {/* Time Window Selection */}
      <div className="space-y-1.5">
        <Label className="field-label flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Janela de Horário
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground ml-1">Check-out (início)</p>
            <Select value={formData.checkoutTime || formData.selectedTime} onValueChange={(v) => onChange({ checkoutTime: v, selectedTime: v })}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Check-out" />
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
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground ml-1">Check-in (prazo)</p>
            <Select value={formData.checkinDeadline || ''} onValueChange={(v) => onChange({ checkinDeadline: v })}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Check-in" />
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
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-1.5">
        <Label className="field-label flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          Job Type
        </Label>
        <Select 
          value={formData.jobType} 
          onValueChange={(v) => onChange({ jobType: v as typeof JOB_TYPES[number] })}
        >
          <SelectTrigger className={selectTriggerClass}>
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
      <div className="space-y-1.5">
        <Label className="field-label flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" />
          Price (optional)
        </Label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => onChange({ price: e.target.value })}
          placeholder={selectedProperty?.basePrice?.toString() || '0'}
          className={inputClass}
        />
      </div>

      {/* Employee Assignment */}
      {employees.length > 0 && (
        <div className="space-y-1.5">
          <Label className="field-label flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Assign To (optional)
          </Label>
          <Select 
            value={formData.assignedTo || "unassigned"} 
            onValueChange={(v) => onChange({ assignedTo: v === "unassigned" ? "" : v })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    {employee.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
