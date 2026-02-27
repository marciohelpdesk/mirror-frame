import { useAuth } from '@/hooks/useAuth';
import { useReports, CleaningReport } from '@/hooks/useReports';
import { useJobs } from '@/hooks/useJobs';
import { useProfile } from '@/hooks/useProfile';
import { PageLoader } from '@/lib/routes';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Share2, Eye, Trash2, Plus, Clock, CheckCircle, Link2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { Job, JobStatus } from '@/types';
import { format } from 'date-fns';

export default function Reports() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { reports, isLoading, createReport, updateReport, deleteReport, isCreating } = useReports(user?.id);
  const { jobs } = useJobs(user?.id);
  const [generatingForJob, setGeneratingForJob] = useState<string | null>(null);

  const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED);
  // Jobs that don't have a report yet
  const unreportedJobs = completedJobs.filter(
    j => !reports.some(r => r.job_id === j.id)
  );

  const handleGenerateReport = async (job: Job) => {
    setGeneratingForJob(job.id);
    try {
      // Build rooms from checklist sections
      const allDamages = job.damages || [];
      const allLostFound = job.lostAndFound || [];
      
      const rooms = job.checklist.map((section, i) => {
        const sTitle = section.title.toLowerCase();
        const sectionDamages = allDamages.filter(d => d.description?.toLowerCase().includes(sTitle));
        const sectionLostFound = allLostFound.filter(l => l.location?.toLowerCase().includes(sTitle) || l.description?.toLowerCase().includes(sTitle));
        const unmatchedDamages = allDamages.filter(d => !job.checklist.some(s => d.description?.toLowerCase().includes(s.title.toLowerCase())));
        const unmatchedLost = allLostFound.filter(l => !job.checklist.some(s => l.location?.toLowerCase().includes(s.title.toLowerCase()) || l.description?.toLowerCase().includes(s.title.toLowerCase())));
        return {
          name: section.title,
          room_type: 'other',
          display_order: i,
          checklist: section.items,
          tasks_total: section.items.length,
          tasks_completed: section.items.filter(it => it.completed).length,
          damages: i === 0 ? [...sectionDamages, ...unmatchedDamages] : sectionDamages,
          lost_and_found: i === 0 ? [...sectionLostFound, ...unmatchedLost] : sectionLostFound,
        };
      });

      // Build photos
      const photos = [
        ...job.photosBefore.map((url, i) => ({ photo_url: url, photo_type: 'before' as const, display_order: i, caption: `Before #${i + 1}` })),
        ...job.photosAfter.map((url, i) => ({ photo_url: url, photo_type: 'after' as const, display_order: i, caption: `After #${i + 1}` })),
        ...(job.damages || []).filter(d => d.photoUrl).map((d, i) => ({ photo_url: d.photoUrl!, photo_type: 'damage' as const, display_order: i, caption: d.description })),
        ...(job.lostAndFound || []).filter(l => l.photoUrl).map((l, i) => ({ photo_url: l.photoUrl!, photo_type: 'lost_found' as const, display_order: i, caption: l.description })),
      ];

      const totalTasks = job.checklist.reduce((acc, s) => acc + s.items.length, 0);
      const completedTasks = job.checklist.reduce((acc, s) => acc + s.items.filter(i => i.completed).length, 0);

      await createReport({
        job_id: job.id,
        property_id: job.propertyId || null,
        property_name: job.clientName,
        property_address: job.address,
        service_type: job.type,
        cleaner_name: profile?.name || 'Cleaner',
        cleaning_date: job.date,
        start_time: job.startTime || null,
        end_time: job.endTime || null,
        status: 'draft',
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_photos: photos.length,
        notes: job.reportNote || null,
        rooms,
        photos,
      });

      toast.success(t('reports.generated'));
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t('reports.errorGenerating'));
    } finally {
      setGeneratingForJob(null);
    }
  };

  const handlePublish = (report: CleaningReport) => {
    updateReport({ id: report.id, status: 'published' });
    toast.success(t('reports.published'));
  };

  const getShareUrl = (report: CleaningReport) => {
    return `https://maisonpur.lovable.app/r/${report.public_token}`;
  };

  const handleCopyLink = async (report: CleaningReport) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(report));
      toast.success(t('reports.linkCopied'));
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  };

  const handleDelete = (id: string) => {
    deleteReport(id);
    toast.success(t('reports.deleted'));
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('reports.subtitle')}</p>
            <h1 className="font-bold text-foreground text-2xl">{t('nav.reports')}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">

      {/* Unreported completed jobs */}
      {unreportedJobs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('reports.pendingGeneration')} ({unreportedJobs.length})
          </h3>
          <div className="space-y-2">
            {unreportedJobs.slice(0, 3).map(job => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{job.clientName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(job.date), 'dd/MM/yyyy')}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerateReport(job)}
                  disabled={generatingForJob === job.id || isCreating}
                  className="gap-1.5 rounded-xl h-9"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatingForJob === job.id ? '...' : t('reports.generate')}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Existing reports */}
      <div className="space-y-3">
        {reports.length === 0 && unreportedJobs.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t('reports.empty')}</p>
          </div>
        )}

        <AnimatePresence>
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{report.property_name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{report.property_address}</p>
                </div>
                <Badge
                  variant={report.status === 'published' ? 'default' : 'secondary'}
                  className="ml-2 shrink-0"
                >
                  {report.status === 'published' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />{t('reports.statusPublished')}</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" />{t('reports.statusDraft')}</>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>{format(new Date(report.cleaning_date), 'dd/MM/yyyy')}</span>
                <span>•</span>
                <span>{report.completed_tasks}/{report.total_tasks} tasks</span>
                <span>•</span>
                <span>{report.total_photos} photos</span>
              </div>

              <div className="flex items-center gap-2">
                {report.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handlePublish(report)}
                    className="flex-1 gap-1.5 rounded-xl h-9"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {t('reports.publish')}
                  </Button>
                )}
                {report.status === 'published' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(report)}
                      className="flex-1 gap-1.5 rounded-xl h-9"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {t('reports.copyLink')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getShareUrl(report), '_blank', 'noopener,noreferrer')}
                      className="gap-1.5 rounded-xl h-9"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(report.id)}
                  className="rounded-xl h-9 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
