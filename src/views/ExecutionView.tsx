import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Job, ExecutionStep, ChecklistSection, InventoryItem, DamageReport, InventoryUsage } from '@/types';
import { ExecutionStepper } from '@/components/execution/ExecutionStepper';
import { PhotoCaptureStep } from '@/components/execution/PhotoCaptureStep';
import { ChecklistStep } from '@/components/execution/ChecklistStep';
import { DamageReportStep } from '@/components/execution/DamageReportStep';
import { InventoryCheckStep } from '@/components/execution/InventoryCheckStep';
import { SummaryStep } from '@/components/execution/SummaryStep';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExecutionViewProps {
  job: Job;
  inventory: InventoryItem[];
  onUpdateJob: (job: Job) => void;
  onComplete: (job: Job) => void;
  onCancel: () => void;
}

const STEP_ORDER: ExecutionStep[] = ['BEFORE_PHOTOS', 'CHECKLIST', 'DAMAGE_REPORT', 'INVENTORY_CHECK', 'AFTER_PHOTOS', 'SUMMARY'];

export const ExecutionView = ({ job, inventory, onUpdateJob, onComplete, onCancel }: ExecutionViewProps) => {
  const [currentStep, setCurrentStep] = useState<ExecutionStep>(job.currentStep || 'BEFORE_PHOTOS');
  const [completedSteps, setCompletedSteps] = useState<ExecutionStep[]>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setCompletedSteps(prev => [...prev, currentStep]);
      const nextStep = STEP_ORDER[nextIndex];
      setCurrentStep(nextStep);
      onUpdateJob({ ...job, currentStep: nextStep });
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEP_ORDER[prevIndex];
      setCompletedSteps(prev => prev.filter(s => s !== currentStep));
      setCurrentStep(prevStep);
      onUpdateJob({ ...job, currentStep: prevStep });
    }
  };

  const handlePhotosBeforeChange = (photos: string[]) => {
    onUpdateJob({ ...job, photosBefore: photos });
  };

  const handlePhotosAfterChange = (photos: string[]) => {
    onUpdateJob({ ...job, photosAfter: photos });
  };

  const handleChecklistChange = (checklist: ChecklistSection[]) => {
    onUpdateJob({ ...job, checklist });
  };

  const handleDamagesChange = (damages: DamageReport[]) => {
    onUpdateJob({ ...job, damages });
  };

  const handleInventoryUsedChange = (inventoryUsed: InventoryUsage[]) => {
    onUpdateJob({ ...job, inventoryUsed });
  };

  const handleComplete = (note?: string) => {
    const completedJob: Job = {
      ...job,
      reportNote: note,
      endTime: Date.now(),
      currentStep: 'SUMMARY',
    };
    onComplete(completedJob);
  };

  const handleExitAttempt = () => {
    setShowExitDialog(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Limpando Agora</p>
            <h1 className="text-lg font-semibold text-foreground truncate">{job.clientName}</h1>
          </div>
          <button
            onClick={handleExitAttempt}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Stepper */}
        <ExecutionStepper currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 'BEFORE_PHOTOS' && (
            <PhotoCaptureStep
              key="before"
              type="before"
              photos={job.photosBefore}
              onPhotosChange={handlePhotosBeforeChange}
              onNext={goToNextStep}
              minPhotos={1}
            />
          )}

          {currentStep === 'CHECKLIST' && (
            <ChecklistStep
              key="checklist"
              checklist={job.checklist}
              onChecklistChange={handleChecklistChange}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'DAMAGE_REPORT' && (
            <DamageReportStep
              key="damage"
              damages={job.damages || []}
              onDamagesChange={handleDamagesChange}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'INVENTORY_CHECK' && (
            <InventoryCheckStep
              key="inventory"
              inventory={inventory}
              inventoryUsed={job.inventoryUsed || []}
              onInventoryUsedChange={handleInventoryUsedChange}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'AFTER_PHOTOS' && (
            <PhotoCaptureStep
              key="after"
              type="after"
              photos={job.photosAfter}
              onPhotosChange={handlePhotosAfterChange}
              onNext={goToNextStep}
              onBack={goToPrevStep}
              minPhotos={1}
            />
          )}

          {currentStep === 'SUMMARY' && (
            <SummaryStep
              key="summary"
              job={job}
              inventory={inventory}
              onComplete={handleComplete}
              onBack={goToPrevStep}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="glass-panel border-0 max-w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <AlertDialogTitle>Sair do Trabalho?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Seu progresso será salvo, mas o trabalho não será marcado como concluído. Você pode retomar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl">Continuar Trabalhando</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancel}
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
