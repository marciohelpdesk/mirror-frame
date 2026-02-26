import { useState } from 'react';
import { format } from 'date-fns';
import { Briefcase, X, Plus } from 'lucide-react';
import { Job, JobStatus, Property, Employee } from '@/types';
import { STANDARD_CHECKLIST_TEMPLATE } from '@/data/checklist';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { JobFormFields, JobFormData } from '@/components/JobFormFields';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  employees?: Employee[];
  onAddJob: (job: Job) => void;
}

export const AddJobModal = ({ open, onOpenChange, properties, employees = [], onAddJob }: AddJobModalProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<JobFormData>({
    propertyId: '',
    clientName: '',
    selectedDate: new Date(),
    selectedTime: '10:00',
    checkoutTime: '10:00',
    checkinDeadline: '15:00',
    jobType: 'Standard',
    price: '',
    assignedTo: '',
  });

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  const handleFormChange = (data: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = () => {
    if (!formData.selectedDate || !formData.propertyId) return;

    const checklistTemplate = selectedProperty?.checklistTemplate && selectedProperty.checklistTemplate.length > 0
      ? JSON.parse(JSON.stringify(selectedProperty.checklistTemplate))
      : JSON.parse(JSON.stringify(STANDARD_CHECKLIST_TEMPLATE));

    const newJob: Job = {
      id: `job-${Date.now()}`,
      propertyId: formData.propertyId,
      clientName: formData.clientName || selectedProperty?.name || 'New Client',
      address: selectedProperty?.address || '',
      date: format(formData.selectedDate, 'yyyy-MM-dd'),
      time: formData.checkoutTime || formData.selectedTime,
      checkoutTime: formData.checkoutTime || formData.selectedTime,
      checkinDeadline: formData.checkinDeadline || undefined,
      status: JobStatus.SCHEDULED,
      type: formData.jobType,
      price: formData.price ? parseFloat(formData.price) : selectedProperty?.basePrice,
      assignedTo: formData.assignedTo || undefined,
      checklist: checklistTemplate,
      photosBefore: [],
      photosAfter: [],
      damages: [],
      inventoryUsed: [],
      lostAndFound: [],
    };

    onAddJob(newJob);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      propertyId: '',
      clientName: '',
      selectedDate: new Date(),
      selectedTime: '10:00',
      checkoutTime: '10:00',
      checkinDeadline: '15:00',
      jobType: 'Standard',
      price: '',
      assignedTo: '',
    });
  };

  const isValid = formData.propertyId && formData.selectedDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-0 max-w-[95%] sm:max-w-[380px] rounded-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            {t('jobModal.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('jobModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-4 overflow-y-auto max-h-[60vh]">
          <JobFormFields
            formData={formData}
            onChange={handleFormChange}
            properties={properties}
            employees={employees}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-1.5" />
            {t('common.cancel')}
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('jobModal.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
