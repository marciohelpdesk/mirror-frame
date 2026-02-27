import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Briefcase, Star, Clock, 
  MapPin, Bed, Bath, Play, ChevronRight,
  Plus, Home, FileText, Users, Check, ExternalLink,
  Building2, Sparkles, ClipboardList, Timer, Ruler,
  Bell, Calendar as CalendarIcon
} from 'lucide-react';
import { openAddressInMaps } from '@/lib/utils';
import { Job, JobStatus, Property } from '@/types';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.date === todayStr);
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);

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

  const formattedDate = currentTime.toLocaleDateString('pt-BR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  // Next job to highlight
  const nextJob = useMemo(() => {
    const now = new Date();
    const upcoming = [...inProgressJobs, ...scheduledJobs].sort((a, b) => a.time.localeCompare(b.time));
    return upcoming[0] || null;
  }, [inProgressJobs, scheduledJobs]);

  const nextJobProperty = nextJob ? properties.find(p => p.id === nextJob.propertyId) : null;

  // Service categories
  const categories = [
    { icon: Home, label: 'Airbnb', color: 'from-orange-400 to-amber-300', description: 'Limpeza profissional para propriedades de aluguel por temporada. Preparação completa entre hóspedes incluindo troca de roupa de cama, reposição de amenities e verificação de inventário.' },
    { icon: Building2, label: 'Residencial', color: 'from-emerald-400 to-teal-300', description: 'Limpeza regular de casas e apartamentos. Manutenção periódica com foco em higienização profunda de todos os ambientes.' },
    { icon: Sparkles, label: 'Pós-obra', color: 'from-amber-400 to-yellow-300', description: 'Limpeza especializada após reformas e construções. Remoção de resíduos, poeira fina e preparação do espaço para uso imediato.' },
    { icon: Briefcase, label: 'Comercial', color: 'from-slate-500 to-slate-400', description: 'Limpeza de escritórios e espaços comerciais. Manutenção profissional com horários flexíveis para não interferir nas operações.' },
  ];

  // Checklist templates
  const checklistTemplates = [
    { title: 'Airbnb Premium', rooms: 6, tasks: 42, icon: '🏠', border: 'border-l-orange-400' },
    { title: 'Residencial', rooms: 4, tasks: 28, icon: '🏡', border: 'border-l-emerald-400' },
    { title: 'Comercial', rooms: 8, tasks: 35, icon: '🏢', border: 'border-l-slate-400' },
    { title: 'Pós-obra', rooms: 5, tasks: 50, icon: '🔨', border: 'border-l-amber-400' },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'linear-gradient(to bottom, hsl(160 35% 18%) 0%, hsl(160 40% 30%) 60%, transparent 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white/40 shadow-md">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-primary/20 text-white font-bold">
                {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-white">{greeting} 👋</h1>
              <p className="text-[11px] font-medium text-white/60 flex items-center gap-1">
                <CalendarIcon size={12} />
                <span className="capitalize">{formattedDate}</span>
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Bell size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 relative z-10 space-y-6">

        {/* Service Categories - Horizontal Scroll */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">{t('dashboard.quickActions') || 'Categorias'}</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.08 }}
                onClick={() => setSelectedCategory(idx)}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                  <cat.icon size={24} className="text-white" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Featured Next Job Card */}
        {nextJob && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
              {t('dashboard.nextJob') || 'Próximo Serviço'}
            </h2>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/60" />
              {nextJobProperty?.photo && (
                <div 
                  className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
                  style={{ backgroundImage: `url(${nextJobProperty.photo})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              
              {/* Content */}
              <div className="relative p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                    <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                      <Clock size={14} />
                      {nextJob.time}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                    {nextJob.type}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{nextJob.clientName}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); openAddressInMaps(nextJob.address); }}
                  className="text-white/80 text-sm flex items-center gap-1.5 underline decoration-dotted hover:text-white transition-colors mb-4"
                >
                  <MapPin size={14} />
                  {nextJob.address}
                  <ExternalLink size={10} className="opacity-60" />
                </button>

                {/* Property details */}
                <div className="flex gap-4 mb-5">
                  {nextJobProperty?.bedrooms && (
                    <div className="flex items-center gap-1.5 text-white/70 text-sm">
                      <Bed size={14} /> {nextJobProperty.bedrooms} quartos
                    </div>
                  )}
                  {nextJobProperty?.bathrooms && (
                    <div className="flex items-center gap-1.5 text-white/70 text-sm">
                      <Bath size={14} /> {nextJobProperty.bathrooms} ban.
                    </div>
                  )}
                  {nextJobProperty?.sqft && (
                    <div className="flex items-center gap-1.5 text-white/70 text-sm">
                      <Ruler size={14} /> {nextJobProperty.sqft}m²
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onStartJob(nextJob.id)}
                    className="flex-1 bg-cta text-cta-foreground py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    <Play size={18} className="fill-current" />
                    {nextJob.status === JobStatus.IN_PROGRESS 
                      ? (t('dashboard.continue') || 'Continuar') 
                      : (t('jobs.startChecklist') || 'Iniciar')}
                  </button>
                  <button
                    onClick={() => onViewJob(nextJob.id)}
                    className="w-14 bg-white/20 backdrop-blur-sm text-white py-3.5 rounded-2xl flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Checklist Templates - Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Checklist Base
            </h2>
            <button className="text-primary text-xs font-medium flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {checklistTemplates.map((tmpl, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className={`min-w-[160px] glass-panel-subtle rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 border-l-4 ${tmpl.border}`}
              >
                <span className="text-3xl mb-2 block">{tmpl.icon}</span>
                <h4 className="font-bold text-foreground text-sm mb-1">{tmpl.title}</h4>
                <p className="text-[10px] text-muted-foreground">{tmpl.rooms} cômodos • {tmpl.tasks} tarefas</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Today's Timeline */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {t('dashboard.today')}, {currentTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </h2>
            <button 
              onClick={() => navigate('/agenda')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              {t('dashboard.viewAgenda')} <ChevronRight size={14} />
            </button>
          </div>

          <div className="relative space-y-4">
            {todayJobs.length > 1 && (
              <div className="absolute left-6 top-10 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
            )}

            <AnimatePresence>
              {todayJobs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel-subtle rounded-2xl p-8 text-center"
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
                      <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-4 border-card shadow z-10
                        ${isCompleted ? 'bg-success' : isInProgress ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}
                      `} />

                      <div 
                        className={`ml-2 glass-panel-subtle rounded-2xl p-4 cursor-pointer transition-all duration-300
                          ${isInProgress 
                            ? 'border-2 border-primary shadow-lg' 
                            : 'hover:border-primary/30'
                          }
                          ${isCompleted ? 'opacity-75' : ''}
                        `}
                        onClick={() => onViewJob(job.id)}
                      >
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
                        </div>

                        <h3 className="font-bold text-foreground text-lg">{job.clientName}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); openAddressInMaps(job.address); }}
                          className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5 underline decoration-dotted hover:text-primary transition-colors"
                        >
                          <MapPin size={12} /> {job.address}
                          <ExternalLink size={10} className="opacity-50" />
                        </button>

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

                        {isInProgress && job.checklist && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-muted-foreground font-medium">{t('dashboard.progress')}</span>
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

                        {(isInProgress || job.status === JobStatus.SCHEDULED) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onStartJob(job.id); }}
                            className="mt-4 w-full py-3 bg-cta text-cta-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
                          >
                            <Play size={16} className="fill-current" />
                            {isInProgress ? t('dashboard.continue') : t('jobs.startChecklist')}
                          </button>
                        )}

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

        {/* Quick Actions - Horizontal Pills */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
            {t('dashboard.quickActions') || 'Ações Rápidas'}
          </h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {[
              { icon: Plus, label: t('dashboard.newJob') || 'Novo Job', action: () => navigate('/agenda') },
              { icon: Home, label: t('dashboard.property') || 'Propriedade', action: () => navigate('/properties') },
              { icon: FileText, label: t('dashboard.report') || 'Relatório', action: () => navigate('/reports') },
              { icon: Users, label: t('dashboard.team') || 'Equipe', action: () => navigate('/settings') },
            ].map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                onClick={action.action}
                className="flex items-center gap-2 px-4 py-3 glass-panel-subtle rounded-2xl hover:scale-105 transition-transform active:scale-95 whitespace-nowrap"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                  <action.icon size={16} className="text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {/* Category Info Drawer */}
      <Drawer open={selectedCategory !== null} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DrawerContent>
          {selectedCategory !== null && (() => {
            const cat = categories[selectedCategory];
            const CatIcon = cat.icon;
            return (
              <>
                <DrawerHeader className="text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                      <CatIcon size={28} className="text-white" />
                    </div>
                    <DrawerTitle className="text-xl">{cat.label}</DrawerTitle>
                  </div>
                  <DrawerDescription className="text-sm leading-relaxed">
                    {cat.description}
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button onClick={() => { setSelectedCategory(null); navigate('/agenda'); }} className="w-full">
                    <Plus size={16} />
                    Criar Job — {cat.label}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">Fechar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </>
            );
          })()}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
