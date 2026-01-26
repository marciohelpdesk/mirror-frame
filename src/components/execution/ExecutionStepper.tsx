import { ExecutionStep } from '@/types';
import { Check, Camera, ClipboardList, CameraIcon, FileText, AlertTriangle, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExecutionStepperProps {
  currentStep: ExecutionStep;
  completedSteps: ExecutionStep[];
}

const STEP_KEYS: { key: ExecutionStep; labelKey: string; icon: React.ElementType }[] = [
  { key: 'BEFORE_PHOTOS', labelKey: 'exec.step.beforePhotos', icon: Camera },
  { key: 'CHECKLIST', labelKey: 'exec.step.checklist', icon: ClipboardList },
  { key: 'DAMAGE_REPORT', labelKey: 'exec.step.damages', icon: AlertTriangle },
  { key: 'LOST_AND_FOUND', labelKey: 'exec.step.lostFound', icon: Search },
  { key: 'INVENTORY_CHECK', labelKey: 'exec.step.inventory', icon: Package },
  { key: 'AFTER_PHOTOS', labelKey: 'exec.step.afterPhotos', icon: CameraIcon },
  { key: 'SUMMARY', labelKey: 'exec.step.summary', icon: FileText },
];

export const ExecutionStepper = ({ currentStep, completedSteps }: ExecutionStepperProps) => {
  const { t } = useLanguage();
  const currentIndex = STEP_KEYS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-between px-1">
      {STEP_KEYS.map((step, index) => {
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
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCurrent ? 'cyan-glow' : ''}
                `}
              >
                {isCompleted || isPast ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                )}
              </motion.div>
              <span className={`text-[9px] mt-1 font-medium text-center ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                {t(step.labelKey)}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEP_KEYS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4">
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
