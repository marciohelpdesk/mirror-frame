import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { Job, JobStatus } from '@/types';
import { PageHeader } from '@/components/PageHeader';

import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface FinanceViewProps {
  jobs: Job[];
  onBack: () => void;
}

type TimeRange = 'week' | 'month';

export const FinanceView = ({ jobs, onBack }: FinanceViewProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED);
  
  // Calculate earnings data
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Generate chart data based on time range
  const generateChartData = () => {
    if (timeRange === 'week') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayJobs = completedJobs.filter(j => j.date === dateStr);
        const earnings = dayJobs.reduce((sum, j) => sum + (j.price || 0), 0);
        days.push({
          label: format(date, 'EEE'),
          date: format(date, 'MMM d'),
          earnings,
          jobs: dayJobs.length
        });
      }
      return days;
    } else {
      // Monthly - group by week
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStartDate = subDays(today, i * 7 + 6);
        const weekEndDate = subDays(today, i * 7);
        const weekJobs = completedJobs.filter(j => {
          try {
            const jobDate = parseISO(j.date);
            return isWithinInterval(jobDate, { start: weekStartDate, end: weekEndDate });
          } catch {
            return false;
          }
        });
        const earnings = weekJobs.reduce((sum, j) => sum + (j.price || 0), 0);
        weeks.push({
          label: `Week ${4 - i}`,
          date: `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'd')}`,
          earnings,
          jobs: weekJobs.length
        });
      }
      return weeks;
    }
  };

  const chartData = generateChartData();

  // Calculate totals
  const weeklyJobs = completedJobs.filter(j => {
    try {
      const jobDate = parseISO(j.date);
      return isWithinInterval(jobDate, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });

  const monthlyJobs = completedJobs.filter(j => {
    try {
      const jobDate = parseISO(j.date);
      return isWithinInterval(jobDate, { start: monthStart, end: monthEnd });
    } catch {
      return false;
    }
  });

  const weeklyEarnings = weeklyJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const monthlyEarnings = monthlyJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const avgPerJob = completedJobs.length > 0 ? totalEarnings / completedJobs.length : 0;

  // Recent completed jobs for history
  const recentJobs = [...completedJobs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !rounded-xl shadow-lg">
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
          <p className="text-lg font-semibold text-foreground">${payload[0].value}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.jobs} jobs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <PageHeader
        title="Earnings"
        subtitle="Finance"
        leftElement={
          <button 
            onClick={onBack}
            className="liquid-btn p-2"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
      />
      
      <div className="px-6 pt-2 relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign size={16} className="text-success" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-light text-foreground">${weeklyEarnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{weeklyJobs.length} jobs completed</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar size={16} className="text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-light text-foreground">${monthlyEarnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{monthlyJobs.length} jobs completed</p>
          </motion.div>
        </div>

        {/* Earnings Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-success" />
              <span className="text-sm font-medium text-foreground">Earnings Trend</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  timeRange === 'week' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  timeRange === 'month' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              {timeRange === 'week' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(162, 64%, 60%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(162, 64%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(162, 64%, 60%)" 
                    strokeWidth={2}
                    fill="url(#earningsGradient)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="earnings" 
                    fill="hsl(186, 100%, 46%)" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-4 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-light text-foreground">{completedJobs.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Jobs</p>
            </div>
            <div>
              <p className="text-xl font-light text-foreground">${totalEarnings.toFixed(0)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Earned</p>
            </div>
            <div>
              <p className="text-xl font-light text-foreground">${avgPerJob.toFixed(0)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg/Job</p>
            </div>
          </div>
        </motion.div>

        {/* Job History */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Recent Payments
          </h2>
          
          <div className="space-y-2">
            {recentJobs.length > 0 ? (
              recentJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="glass-panel overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-success" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">{job.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(job.date), 'MMM d, yyyy')} • {job.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-success">${job.price || 0}</span>
                      {expandedJobId === job.id ? (
                        <ChevronUp size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {expandedJobId === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 border-t border-border"
                    >
                      <div className="pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Address</span>
                          <span className="text-foreground">{job.address}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="text-foreground">{job.time}</span>
                        </div>
                        {job.startTime && job.endTime && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="text-foreground">
                              {Math.round((job.endTime - job.startTime) / 60000)} min
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service Type</span>
                          <span className="text-foreground">{job.type}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-8 text-center"
              >
                <p className="text-muted-foreground">No completed jobs yet</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
