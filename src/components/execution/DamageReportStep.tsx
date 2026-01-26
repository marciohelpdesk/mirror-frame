import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, Trash2, Camera, Sofa, Tv, Droplet, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DamageReport } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface DamageReportStepProps {
  damages: DamageReport[];
  onDamagesChange: (damages: DamageReport[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAMAGE_TYPE_CONFIGS = [
  { value: 'furniture' as const, labelKey: 'exec.damage.typeFurniture', icon: Sofa },
  { value: 'electronics' as const, labelKey: 'exec.damage.typeElectronics', icon: Tv },
  { value: 'stain' as const, labelKey: 'exec.damage.typeStain', icon: Droplet },
  { value: 'other' as const, labelKey: 'exec.damage.typeOther', icon: HelpCircle },
];

const SEVERITY_CONFIGS = [
  { value: 'low' as const, labelKey: 'exec.damage.severityLow', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'medium' as const, labelKey: 'exec.damage.severityMedium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'high' as const, labelKey: 'exec.damage.severityHigh', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

export const DamageReportStep = ({ damages, onDamagesChange, onNext, onBack }: DamageReportStepProps) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [newDamage, setNewDamage] = useState<Partial<DamageReport>>({
    type: 'furniture',
    severity: 'medium',
    description: '',
  });

  const handleAddDamage = () => {
    if (!newDamage.description?.trim()) return;
    
    const damage: DamageReport = {
      id: `d${Date.now()}`,
      type: newDamage.type || 'other',
      severity: newDamage.severity || 'medium',
      description: newDamage.description,
      photoUrl: newDamage.photoUrl,
    };
    
    onDamagesChange([...damages, damage]);
    setNewDamage({ type: 'furniture', severity: 'medium', description: '' });
    setIsAdding(false);
  };

  const handleRemoveDamage = (id: string) => {
    onDamagesChange(damages.filter(d => d.id !== id));
  };

  const handlePhotoCapture = () => {
    // Simulated photo capture
    const mockPhoto = `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&t=${Date.now()}`;
    setNewDamage(prev => ({ ...prev, photoUrl: mockPhoto }));
  };

  const getTypeIcon = (type: DamageReport['type']) => {
    const typeConfig = DAMAGE_TYPE_CONFIGS.find(t => t.value === type);
    return typeConfig?.icon || HelpCircle;
  };

  const getTypeLabel = (type: DamageReport['type']) => {
    const typeConfig = DAMAGE_TYPE_CONFIGS.find(t => t.value === type);
    return typeConfig ? t(typeConfig.labelKey) : t('exec.damage.typeOther');
  };

  const getSeverityConfig = (severity: DamageReport['severity']) => {
    return SEVERITY_CONFIGS.find(s => s.value === severity) || SEVERITY_CONFIGS[1];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('exec.damage.title')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('exec.damage.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        {/* Existing Damages */}
        <AnimatePresence>
          {damages.map((damage, index) => {
            const Icon = getTypeIcon(damage.type);
            const severityConfig = getSeverityConfig(damage.severity);
            
            return (
              <motion.div
                key={damage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel p-3 mb-3"
              >
                <div className="flex items-start gap-3">
                  {damage.photoUrl ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={damage.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getTypeLabel(damage.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${severityConfig.color}`}>
                        {t(severityConfig.labelKey)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{damage.description}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDamage(damage.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add New Damage Form */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-4 mb-3"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">{t('exec.damage.newRecord')}</h3>
              
              {/* Type Selection */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.damage.problemType')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {DAMAGE_TYPE_CONFIGS.map(type => {
                    const Icon = type.icon;
                    const isSelected = newDamage.type === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewDamage(prev => ({ ...prev, type: type.value }))}
                        className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                          isSelected 
                            ? 'border-secondary bg-secondary/10 text-secondary' 
                            : 'border-muted bg-muted/50 text-muted-foreground hover:border-secondary/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t(type.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Selection */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.damage.severity')}</p>
                <div className="flex gap-2">
                  {SEVERITY_CONFIGS.map(sev => (
                    <button
                      key={sev.value}
                      onClick={() => setNewDamage(prev => ({ ...prev, severity: sev.value }))}
                      className={`flex-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                        newDamage.severity === sev.value ? sev.color : 'border-muted bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {t(sev.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.damage.description')}</p>
                <Textarea
                  value={newDamage.description || ''}
                  onChange={(e) => setNewDamage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('exec.damage.descPlaceholder')}
                  className="min-h-[80px] resize-none bg-card/50 border-muted"
                />
              </div>

              {/* Photo */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.damage.photo')}</p>
                {newDamage.photoUrl ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={newDamage.photoUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewDamage(prev => ({ ...prev, photoUrl: undefined }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePhotoCapture}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-secondary transition-colors"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{t('common.add')}</span>
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleAddDamage}
                  disabled={!newDamage.description?.trim()}
                  className="flex-1 bg-secondary text-secondary-foreground"
                >
                  {t('common.add')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-muted flex items-center justify-center gap-2 text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">{t('exec.damage.register')}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {damages.length === 0 && !isAdding && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t('exec.damage.noDamages')}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {t('common.continue')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
