import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Briefcase, 
  DollarSign,
  Play,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { Job, Property, JobStatus, Employee } from '@/types';
import { PageHeader } from '@/components/PageHeader';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { JobFormFields, JobFormData, JOB_TYPES } from '@/components/JobFormFields';
import { toast } from 'sonner';

interface JobDetailsViewProps {
  job: Job;
  properties: Property[];
  employees?: Employee[];
  onBack: () => void;
  onStartJob: (jobId: string) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobDetailsView = ({ 
  job, 
  properties, 
  employees = [],
  onBack, 
  onStartJob, 
  onUpdateJob, 
  onDeleteJob 
}: JobDetailsViewProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    propertyId: job.propertyId || '',
    clientName: job.clientName,
    selectedDate: parseISO(job.date),
    selectedTime: job.time,
    checkoutTime: job.checkoutTime || job.time,
    checkinDeadline: job.checkinDeadline || '',
    jobType: job.type,
    price: job.price?.toString() || '',
    assignedTo: job.assignedTo || '',
  });

  const property = properties.find(p => p.id === job.propertyId);
  const assignedEmployee = employees.find(e => e.id === job.assignedTo);

  const handleFormChange = (data: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSaveEdit = () => {
    if (!formData.selectedDate || !formData.propertyId) return;

    const selectedProperty = properties.find(p => p.id === formData.propertyId);
    
    const updatedJob: Job = {
      ...job,
      propertyId: formData.propertyId,
      clientName: formData.clientName || selectedProperty?.name || job.clientName,
      address: selectedProperty?.address || job.address,
      date: format(formData.selectedDate, 'yyyy-MM-dd'),
      time: formData.checkoutTime || formData.selectedTime,
      checkoutTime: formData.checkoutTime || formData.selectedTime,
      checkinDeadline: formData.checkinDeadline || undefined,
      type: formData.jobType,
      price: formData.price ? parseFloat(formData.price) : job.price,
      assignedTo: formData.assignedTo || undefined,
    };

    onUpdateJob(updatedJob);
    setShowEditModal(false);
    toast.success('Job updated successfully');
  };

  const handleDelete = () => {
    onDeleteJob(job.id);
    toast.success('Job deleted');
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.SCHEDULED:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case JobStatus.IN_PROGRESS:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case JobStatus.COMPLETED:
        return 'bg-green-500/10 text-green-600 border-green-500/20';
    }
  };

  const isEditable = job.status === JobStatus.SCHEDULED;

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <PageHeader
        title="Job Details"
        subtitle={job.type}
        leftElement={
          <button onClick={onBack} className="liquid-btn w-10 h-10">
            <ArrowLeft size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-4 relative z-10">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${getStatusColor(job.status)} px-3 py-1`}>
            {job.status === JobStatus.COMPLETED && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {job.status.replace('_', ' ')}
          </Badge>
          
          {isEditable && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="gap-1.5"
              >
                <Edit2 size={14} />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[340px] rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Delete Job
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this job? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Main Info Card */}
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{job.clientName}</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
              <MapPin size={14} />
              {job.address}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{format(parseISO(job.date), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Janela de Horário</p>
                <p className="text-sm font-medium">
                  {job.checkoutTime || job.time}
                  {job.checkinDeadline && ` → ${job.checkinDeadline}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{job.type}</p>
              </div>
            </div>

            {job.price && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-medium">${job.price}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assigned To */}
        {assignedEmployee && (
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10">
                <img src={assignedEmployee.avatar} alt={assignedEmployee.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-medium">{assignedEmployee.name}</p>
            </div>
          </div>
        )}

        {/* Property Info */}
        {property && (
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Property</h3>
            <p className="font-medium">{property.name}</p>
            <p className="text-sm text-muted-foreground">{property.type} • {property.serviceType}</p>
          </div>
        )}

        {/* Checklist Summary */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Checklist</h3>
          <div className="space-y-2">
            {job.checklist.map(section => {
              const completed = section.items.filter(i => i.completed).length;
              const total = section.items.length;
              return (
                <div key={section.id} className="flex justify-between items-center">
                  <span className="text-sm">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {completed}/{total} items
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Report Button - for completed jobs */}
        {job.status === JobStatus.COMPLETED && job.reportPdfUrl && (
          <Button 
            variant="outline"
            className="w-full gap-2" 
            size="lg"
            onClick={() => window.open(job.reportPdfUrl, '_blank')}
          >
            <FileDown size={18} />
            Baixar Relatório
          </Button>
        )}

        {/* Start Job Button */}
        {job.status === JobStatus.SCHEDULED && (
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={() => onStartJob(job.id)}
          >
            <Play size={18} />
            Start Job
          </Button>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-[340px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Job
            </DialogTitle>
            <DialogDescription>
              Update the job details below.
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
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveEdit}
              disabled={!formData.propertyId || !formData.selectedDate}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};