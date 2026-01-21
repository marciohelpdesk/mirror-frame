import { ExecutionStep } from '@/types';
import { Check, Camera, ClipboardList, CameraIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutionStepperProps {
  currentStep: ExecutionStep;
  completedSteps: ExecutionStep[];
}

const STEPS: { key: ExecutionStep; label: string; icon: React.ElementType }[] = [
  { key: 'BEFORE_PHOTOS', label: 'Before', icon: Camera },
  { key: 'CHECKLIST', label: 'Tasks', icon: ClipboardList },
  { key: 'AFTER_PHOTOS', label: 'After', icon: CameraIcon },
  { key: 'SUMMARY', label: 'Done', icon: FileText },
];

export const ExecutionStepper = ({ currentStep, completedSteps }: ExecutionStepperProps) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-between px-2">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        const isPast = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isPast
                    ? 'hsl(var(--primary))'
                    : isCurrent
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted))',
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCurrent ? 'cyan-glow' : ''}
                `}
              >
                {isCompleted || isPast ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Icon className={`w-5 h-5 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                )}
              </motion.div>
              <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isPast || isCompleted
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                  }}
                  className="h-full rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
