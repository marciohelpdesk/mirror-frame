import { useState } from 'react';
import { format } from 'date-fns';
import { Briefcase } from 'lucide-react';
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

    // Use property's custom checklist if available, otherwise use default
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
      <DialogContent className="max-w-[340px] rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            {t('jobModal.title')}
          </DialogTitle>
          <DialogDescription>
            {t('jobModal.description')}
          </DialogDescription>
        </DialogHeader>

        <JobFormFields
          formData={formData}
          onChange={handleFormChange}
          properties={properties}
          employees={employees}
        />

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {t('jobModal.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};