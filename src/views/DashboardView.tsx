import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Briefcase, Star, Clock, 
  MapPin, Bed, Bath, Play, ChevronRight,
  Plus, Home, FileText, Users, Check
} from 'lucide-react';
import { Job, JobStatus, Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';
import { TipsBanner } from '@/components/dashboard/TipsBanner';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { useLanguage } from '@/contexts/LanguageContext';
import purLogo from '@/assets/pur-logo.png';

interface DashboardViewProps {
  jobs: Job[];
  properties?: Property[];
  onStartJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  userProfile: { name: string; avatar: string };
}

export const DashboardView = ({ jobs, properties = [], onStartJob, onViewJob, userProfile }: DashboardViewProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.date === todayStr);
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);

  // Monthly earnings
  const monthJobs = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return jobs.filter(j => j.date.startsWith(monthStr) && j.status === JobStatus.COMPLETED);
  }, [jobs]);
  const monthEarnings = monthJobs.reduce((sum, j) => sum + (j.price || 0), 0);

  const todayProgress = todayJobs.length > 0 
    ? Math.round((completedJobs.length / todayJobs.length) * 100) 
    : 0;

  const greeting = currentTime.getHours() < 12 ? t('dashboard.goodMorning') : 
                   currentTime.getHours() < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');

  // KPI Cards data
  const kpiCards = [
    {
      icon: DollarSign,
      value: `$${monthEarnings.toLocaleString()}`,
      label: t('dashboard.thisMonth') || 'Este mês',
      gradient: 'from-primary to-primary/70',
      trend: '+12%',
      trendColor: 'text-primary bg-primary/10',
      progress: 75,
    },
    {
      icon: Briefcase,
      value: String(todayJobs.length),
      label: 'Total jobs',
      gradient: 'from-primary to-primary/70',
      badge: `${scheduledJobs.length} jobs`,
      segments: [
        { width: completedJobs.length, color: 'bg-success' },
        { width: inProgressJobs.length, color: 'bg-warning' },
        { width: scheduledJobs.length, color: 'bg-muted' },
      ],
    },
    {
      icon: Star,
      value: `${todayProgress}%`,
      label: t('dashboard.satisfaction') || 'Satisfação',
      gradient: 'from-warning to-warning/70',
      stars: true,
    },
    {
      icon: Clock,
      value: `${scheduledJobs.length + inProgressJobs.length}`,
      label: t('dashboard.pending') || 'Pendentes',
      gradient: 'from-destructive to-destructive/70',
      trend: completedJobs.length > 0 ? `${completedJobs.length} done` : undefined,
      trendColor: 'text-primary bg-primary/10',
      progress: todayProgress,
    },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</p>
            <h1 className="text-2xl font-bold text-foreground">{greeting} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <img 
              src={purLogo}
              alt="Pur Logo"
              className="w-9 h-9 object-contain drop-shadow-lg"
            />
            <img 
              src={userProfile.avatar} 
              alt={userProfile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/40 shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 relative z-10 space-y-6">
        {/* Tips Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <TipsBanner />
        </motion.div>

        {/* KPI Cards Grid - 2x2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {kpiCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className="relative bg-card rounded-2xl p-4 shadow-sm border border-border/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.gradient}`} />
              
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                  <card.icon size={18} className="text-white" />
                </div>
                {card.trend && (
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${card.trendColor}`}>
                    ↑ {card.trend}
                  </span>
                )}
                {card.badge && (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>
              
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              
              {/* Progress bar or segments */}
              {card.progress !== undefined && !card.segments && (
                <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-700`}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              )}
              {card.segments && (
                <div className="mt-3 flex gap-1">
                  {card.segments.map((seg, i) => (
                    <div key={i} className={`h-1 flex-1 ${seg.color} rounded-full`} />
                  ))}
                </div>
              )}
              {card.stars && (
                <div className="mt-3 flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} className={i <= 4 ? 'text-warning fill-warning' : 'text-warning fill-warning/50'} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Today's Timeline */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {t('dashboard.today') || 'Hoje'}, {currentTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </h2>
            <button 
              onClick={() => navigate('/agenda')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              {t('dashboard.viewAgenda') || 'Ver agenda'} <ChevronRight size={14} />
            </button>
          </div>

          <div className="relative space-y-4">
            {/* Timeline line */}
            {todayJobs.length > 1 && (
              <div className="absolute left-6 top-10 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
            )}

            <AnimatePresence>
              {todayJobs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50"
                >
                  <p className="text-muted-foreground">{t('dashboard.noJobsToday')}</p>
                </motion.div>
              ) : (
                todayJobs.map((job, idx) => {
                  const isInProgress = job.status === JobStatus.IN_PROGRESS;
                  const isCompleted = job.status === JobStatus.COMPLETED;
                  const property = properties.find(p => p.id === job.propertyId);
                  
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-4 border-card shadow z-10
                        ${isCompleted ? 'bg-success' : isInProgress ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}
                      `} />

                      {/* Job card */}
                      <div 
                        className={`ml-2 bg-card rounded-2xl p-4 shadow-sm cursor-pointer transition-all duration-300
                          ${isInProgress 
                            ? 'border-2 border-primary shadow-lg' 
                            : 'border border-border/50 hover:border-primary/30'
                          }
                          ${isCompleted ? 'opacity-75' : ''}
                        `}
                        onClick={() => onViewJob(job.id)}
                      >
                        {/* Status badge */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                              ${isCompleted ? 'text-success bg-success/10' : 
                                isInProgress ? 'text-primary bg-primary/10' : 
                                'text-muted-foreground bg-muted'}
                            `}>
                              {isCompleted ? t('status.completed') : isInProgress ? t('status.inProgress') : t('status.scheduled')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.checkoutTime || job.time}
                              {job.checkinDeadline && ` - ${job.checkinDeadline}`}
                            </span>
                          </div>
                          {!isInProgress && (
                            <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>

                        <h3 className="font-bold text-foreground text-lg">{job.clientName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {job.address}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          {property?.bedrooms && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Bed size={12} /> {property.bedrooms}
                            </span>
                          )}
                          {property?.bathrooms && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Bath size={12} /> {property.bathrooms}
                            </span>
                          )}
                          {job.price && (
                            <span className="text-xs font-semibold text-primary">${job.price}</span>
                          )}
                        </div>

                        {/* Progress bar for in-progress */}
                        {isInProgress && job.checklist && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-muted-foreground font-medium">{t('dashboard.progress') || 'Progresso'}</span>
                              <span className="text-primary font-bold">
                                {(() => {
                                  const cl = job.checklist as any[];
                                  const total = cl.reduce((a: number, s: any) => a + (s.items?.length || 0), 0);
                                  const done = cl.reduce((a: number, s: any) => a + (s.items?.filter((i: any) => i.completed)?.length || 0), 0);
                                  return total > 0 ? `${Math.round((done/total)*100)}%` : '0%';
                                })()}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-success rounded-full relative">
                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action button */}
                        {(isInProgress || job.status === JobStatus.SCHEDULED) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onStartJob(job.id); }}
                            className="mt-4 w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-transform"
                          >
                            <Play size={16} className="fill-primary-foreground" />
                            {isInProgress ? (t('dashboard.continue') || 'Continuar Limpeza') : (t('jobs.startChecklist') || 'Iniciar Checklist')}
                          </button>
                        )}

                        {/* Completed footer */}
                        {isCompleted && (
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Checklist: {(() => {
                                const cl = job.checklist as any[];
                                if (!cl) return '✓';
                                const total = cl.reduce((a: number, s: any) => a + (s.items?.length || 0), 0);
                                return `${total}/${total} ✓`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Weekly Performance */}
        <WeeklyProgress jobs={jobs} />

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            {t('dashboard.quickActions') || 'Ações Rápidas'}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Plus, label: t('dashboard.newJob') || 'Novo Job', gradient: 'from-primary to-primary/80', action: () => navigate('/agenda') },
              { icon: Home, label: t('dashboard.property') || 'Propriedade', gradient: 'from-primary to-primary/80', action: () => navigate('/properties') },
              { icon: FileText, label: t('dashboard.report') || 'Relatório', gradient: 'from-primary to-primary/80', action: () => navigate('/reports') },
              { icon: Users, label: t('dashboard.team') || 'Equipe', gradient: 'from-primary to-primary/80', action: () => navigate('/settings') },
            ].map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                onClick={action.action}
                className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl shadow-sm border border-border/50 hover:scale-105 transition-transform active:scale-95"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
