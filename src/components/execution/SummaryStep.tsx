import { motion } from 'framer-motion';
import { Check, Clock, Camera, ClipboardCheck, Star, MessageSquare, FileDown, AlertTriangle, Package, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Job, InventoryItem } from '@/types';
import { useState } from 'react';
import { generateCleaningReport, downloadPdf } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { PdfPreviewModal } from './PdfPreviewModal';

interface SummaryStepProps {
  job: Job;
  inventory: InventoryItem[];
  onComplete: (note?: string) => void;
  onBack: () => void;
}

export const SummaryStep = ({ job, inventory, onComplete, onBack }: SummaryStepProps) => {
  const { t } = useLanguage();
  const [note, setNote] = useState(job.reportNote || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState('');

  // Calculate stats
  const totalTasks = job.checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedTasks = job.checklist.reduce(
    (acc, s) => acc + s.items.filter(i => i.completed).length,
    0
  );

  const duration = job.startTime
    ? Math.floor((Date.now() - job.startTime) / 60000)
    : 0;

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  const lowStockItems = (inventory || []).filter(item => {
    const usage = job.inventoryUsed?.find(u => u.itemId === item.id);
    const remaining = item.quantity - (usage?.quantityUsed || 0);
    return remaining <= item.threshold;
  });

  const handlePreviewPdf = async () => {
    setShowPreview(true);
    setIsGeneratingPdf(true);
    setPdfBlob(null);
    
    try {
      const blob = await generateCleaningReport({
        job: { ...job, reportNote: note, endTime: Date.now() },
        inventory,
        responsibleName: 'Maria Santos', // TODO: Get from user profile
        lostAndFound: job.lostAndFound || [],
      });
      
      const filename = `relatorio-${job.clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      setPdfBlob(blob);
      setPdfFilename(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar pré-visualização do PDF');
      setShowPreview(false);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfBlob && pdfFilename) {
      downloadPdf(pdfBlob, pdfFilename);
      toast.success('Relatório PDF baixado com sucesso!');
    }
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(note);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center cyan-glow"
        >
          <Check className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-xl font-semibold text-foreground">{t('exec.summary.greatJob')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('exec.summary.reviewSummary')}
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 flex-1 overflow-y-auto hide-scrollbar">
        <div className="glass-panel p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{job.clientName}</h3>
          <p className="text-xs text-muted-foreground mb-4">{job.address}</p>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Clock}
              label={t('exec.summary.duration')}
              value={formatDuration(duration)}
              color="primary"
            />
            <StatCard
              icon={ClipboardCheck}
              label={t('exec.summary.tasks')}
              value={`${completedTasks}/${totalTasks}`}
              color="success"
            />
            <StatCard
              icon={Camera}
              label={t('exec.summary.before')}
              value={`${job.photosBefore.length} ${t('exec.summary.photos')}`}
              color="amber"
            />
            <StatCard
              icon={Camera}
              label={t('exec.summary.after')}
              value={`${job.photosAfter.length} ${t('exec.summary.photos')}`}
              color="emerald"
            />
          </div>
        </div>

        {/* Damages Preview */}
        {job.damages && job.damages.length > 0 && (
          <div className="glass-panel p-4 mb-4 border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">{t('exec.summary.damagesRecorded')} ({job.damages.length})</h3>
            </div>
            <div className="space-y-2">
              {job.damages.slice(0, 2).map(damage => (
                <div key={damage.id} className="text-xs text-muted-foreground">
                  • {damage.description.substring(0, 50)}{damage.description.length > 50 ? '...' : ''}
                </div>
              ))}
              {job.damages.length > 2 && (
                <p className="text-xs text-muted-foreground">+{job.damages.length - 2} {t('exec.summary.more')}</p>
              )}
            </div>
          </div>
        )}

        {/* Lost and Found Preview */}
        {job.lostAndFound && job.lostAndFound.length > 0 && (
          <div className="glass-panel p-4 mb-4 border-l-4 border-l-accent">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">{t('exec.summary.lostFoundRecorded')} ({job.lostAndFound.length})</h3>
            </div>
            <div className="space-y-2">
              {job.lostAndFound.slice(0, 2).map(item => (
                <div key={item.id} className="text-xs text-muted-foreground flex items-center gap-2">
                  {item.photoUrl && (
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                      <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span>• {item.description.substring(0, 40)}{item.description.length > 40 ? '...' : ''}</span>
                </div>
              ))}
              {job.lostAndFound.length > 2 && (
                <p className="text-xs text-muted-foreground">+{job.lostAndFound.length - 2} {t('exec.summary.more')}</p>
              )}
            </div>
          </div>
        )}

        {/* Low Stock Warning */}
        {lowStockItems.length > 0 && (
          <div className="glass-panel p-4 mb-4 border-l-4 border-l-warning">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">{t('exec.summary.lowStock')} ({lowStockItems.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 3).map(item => (
                <span 
                  key={item.id}
                  className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs"
                >
                  {item.name}
                </span>
              ))}
              {lowStockItems.length > 3 && (
                <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                  +{lowStockItems.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Photo Preview */}
        {(job.photosBefore.length > 0 || job.photosAfter.length > 0) && (
          <div className="glass-panel p-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('exec.summary.photoDocumentation')}</h3>
            
            {job.photosBefore.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('exec.summary.before')} ({job.photosBefore.length})</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {job.photosBefore.slice(0, 4).map((photo, i) => (
                    <div key={i} className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.photosAfter.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('exec.summary.after')} ({job.photosAfter.length})</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {job.photosAfter.slice(0, 4).map((photo, i) => (
                    <div key={i} className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{t('exec.summary.addNote')}</h3>
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('exec.summary.notePlaceholder')}
            className="min-h-[80px] resize-none bg-card/50 border-muted"
          />
        </div>

        {/* Earnings Preview */}
        {job.price && (
          <div className="glass-panel p-4 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('exec.summary.serviceValue')}</p>
                <p className="text-2xl font-bold text-foreground">R$ {job.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1 text-warning">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Generate PDF Button */}
        <Button
          variant="outline"
          onClick={handlePreviewPdf}
          disabled={isGeneratingPdf}
          className="w-full mb-4 h-12 rounded-xl gap-2"
        >
          <Eye className="w-5 h-5" />
          {t('exec.summary.previewPdf')}
        </Button>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        pdfBlob={pdfBlob}
        filename={pdfFilename}
        isLoading={isGeneratingPdf}
        onDownload={handleDownloadPdf}
      />

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl"
          disabled={isSubmitting}
        >
          {t('common.back')}
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              {t('exec.summary.complete')}
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'amber' | 'emerald';
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    amber: 'bg-warning/10 text-warning',
    emerald: 'bg-success/10 text-success',
  };

  return (
    <div className="bg-card/50 rounded-xl p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
};
