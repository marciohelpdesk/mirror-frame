import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Job, JobStatus, Property } from '@/types';
import { STANDARD_CHECKLIST_TEMPLATE } from '@/data/checklist';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

interface AddJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onAddJob: (job: Job) => void;
}

const JOB_TYPES = ['Standard', 'Deep Clean', 'Move-out'] as const;
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export const AddJobModal = ({ open, onOpenChange, properties, onAddJob }: AddJobModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [jobType, setJobType] = useState<typeof JOB_TYPES[number]>('Standard');
  const [price, setPrice] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const handleSubmit = () => {
    if (!selectedDate || !selectedPropertyId) return;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      propertyId: selectedPropertyId,
      clientName: clientName || selectedProperty?.name || 'New Client',
      address: selectedProperty?.address || '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      status: JobStatus.SCHEDULED,
      type: jobType,
      price: price ? parseFloat(price) : selectedProperty?.basePrice,
      checklist: JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE)),
      photosBefore: [],
      photosAfter: [],
    };

    onAddJob(newJob);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedPropertyId('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setJobType('Standard');
    setPrice('');
    setClientName('');
  };

  const isValid = selectedPropertyId && selectedDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Schedule New Job
          </DialogTitle>
          <DialogDescription>
            Create a new cleaning job with property and time details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Property
            </Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
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
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
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
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
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
            <Select value={selectedTime} onValueChange={setSelectedTime}>
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
            <Select value={jobType} onValueChange={(v) => setJobType(v as typeof JOB_TYPES[number])}>
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={selectedProperty?.basePrice?.toString() || '0'}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Create Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};