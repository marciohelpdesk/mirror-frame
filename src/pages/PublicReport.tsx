import { useParams } from 'react-router-dom';
import { usePublicReport, ReportRoom, ReportPhoto } from '@/hooks/useReports';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Camera, AlertTriangle, Search, 
  ChevronLeft, ChevronRight, X, ZoomIn, Clock, MapPin,
  Sparkles, Shield, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import purLogo from '@/assets/pur-logo.png';

const translations: Record<string, Record<string, any>> = {
  en: {
    title: 'Cleaning Report',
    verified: 'VERIFIED',
    verifiedBy: 'Verified by',
    completedTasks: 'Completed Tasks',
    photosCollected: 'Photos Collected',
    issuesFound: 'Issues Found',
    itemsFound: 'Items Found',
    duration: 'Duration',
    rooms: 'Rooms',
    checklist: 'Checklist',
    damages: 'Damages',
    lostFound: 'Lost & Found',
    beforePhotos: 'Before',
    afterPhotos: 'After',
    photoGallery: 'Photo Gallery',
    noPhotos: 'No photos available',
    notes: 'Notes',
    notFound: 'Report not found',
    notFoundDesc: 'This link may be invalid or the report has not been published yet.',
    poweredBy: 'Powered by',
    severity: { low: 'Low', medium: 'Medium', high: 'High' },
    all: 'All',
  },
  pt: {
    title: 'Relatório de Limpeza',
    verified: 'VERIFICADO',
    verifiedBy: 'Verificado por',
    completedTasks: 'Tarefas Concluídas',
    photosCollected: 'Fotos Coletadas',
    issuesFound: 'Problemas Encontrados',
    itemsFound: 'Itens Encontrados',
    duration: 'Duração',
    rooms: 'Ambientes',
    checklist: 'Checklist',
    damages: 'Danos',
    lostFound: 'Achados e Perdidos',
    beforePhotos: 'Antes',
    afterPhotos: 'Depois',
    photoGallery: 'Galeria de Fotos',
    noPhotos: 'Nenhuma foto disponível',
    notes: 'Observações',
    notFound: 'Relatório não encontrado',
    notFoundDesc: 'Este link pode ser inválido ou o relatório ainda não foi publicado.',
    poweredBy: 'Desenvolvido por',
    severity: { low: 'Baixa', medium: 'Média', high: 'Alta' },
    all: 'Todos',
  },
  ko: {
    title: '청소 보고서',
    verified: '검증됨',
    verifiedBy: '검증자',
    completedTasks: '완료된 작업',
    photosCollected: '수집된 사진',
    issuesFound: '발견된 문제',
    itemsFound: '발견된 물품',
    duration: '소요 시간',
    rooms: '공간',
    checklist: '체크리스트',
    damages: '손상',
    lostFound: '분실물',
    beforePhotos: '이전',
    afterPhotos: '이후',
    photoGallery: '사진 갤러리',
    noPhotos: '사진 없음',
    notes: '메모',
    notFound: '보고서를 찾을 수 없습니다',
    notFoundDesc: '이 링크가 유효하지 않거나 보고서가 아직 게시되지 않았습니다.',
    poweredBy: 'Powered by',
    severity: { low: '낮음', medium: '중간', high: '높음' },
    all: '전체',
  },
  th: {
    title: 'รายงานการทำความสะอาด',
    verified: 'ยืนยันแล้ว',
    verifiedBy: 'ยืนยันโดย',
    completedTasks: 'งานที่เสร็จสมบูรณ์',
    photosCollected: 'ภาพถ่ายที่เก็บรวบรวม',
    issuesFound: 'ปัญหาที่พบ',
    itemsFound: 'สิ่งของที่พบ',
    duration: 'ระยะเวลา',
    rooms: 'ห้อง',
    checklist: 'รายการตรวจสอบ',
    damages: 'ความเสียหาย',
    lostFound: 'ของหายและพบ',
    beforePhotos: 'ก่อน',
    afterPhotos: 'หลัง',
    photoGallery: 'แกลเลอรีภาพ',
    noPhotos: 'ไม่มีภาพถ่าย',
    notes: 'หมายเหตุ',
    notFound: 'ไม่พบรายงาน',
    notFoundDesc: 'ลิงก์นี้อาจไม่ถูกต้องหรือรายงานยังไม่ได้เผยแพร่',
    poweredBy: 'Powered by',
    severity: { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง' },
    all: 'ทั้งหมด',
  },
};

export default function PublicReport() {
  const { token } = useParams<{ token: string }>();
  const { report, rooms, photos, isLoading } = usePublicReport(token);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [lang, setLang] = useState<string>('en');

  const t = useCallback((key: string): any => {
    const keys = key.split('.');
    let val: any = translations[lang] || translations.en;
    for (const k of keys) val = val?.[k];
    return val || key;
  }, [lang]);

  // Set lang from report once loaded
  useEffect(() => {
    if (report && translations[report.language]) {
      setLang(report.language);
    }
  }, [report]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-8 h-8 text-cyan-500" />
        </motion.div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">{t('notFound')}</h1>
          <p className="text-sm text-slate-500">{t('notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const filteredPhotos = selectedRoom
    ? photos.filter(p => p.room_id === selectedRoom)
    : photos;

  const beforePhotos = filteredPhotos.filter(p => p.photo_type === 'before');
  const afterPhotos = filteredPhotos.filter(p => p.photo_type === 'after');
  const damagePhotos = filteredPhotos.filter(p => p.photo_type === 'damage');

  const allDamages = rooms.flatMap(r => (r.damages || []) as any[]);
  const allLostFound = rooms.flatMap(r => (r.lost_and_found || []) as any[]);

  const formatDuration = (start: number | null, end: number | null) => {
    if (!start || !end) return '—';
    const mins = Math.floor((end - start) / 60000);
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}min`;
  };

  const completionPct = report.total_tasks > 0
    ? Math.round((report.completed_tasks / report.total_tasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-50">
      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 bg-white/80 backdrop-blur-lg rounded-full p-1 shadow-lg">
        {['en', 'pt', 'ko', 'th'].map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              lang === l ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-300 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative max-w-2xl mx-auto px-6 py-10 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <img src={purLogo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-sm font-semibold tracking-wider opacity-80">MAISON PUR</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">{report.property_name}</h1>
          <div className="flex items-center gap-2 text-cyan-200 text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>{report.property_address}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={`${completionPct}%`} label={t('completedTasks')} icon="✓" color="cyan" />
            <StatCard value={String(report.total_photos)} label={t('photosCollected')} icon="📷" color="blue" />
            <StatCard value={String(allDamages.length)} label={t('issuesFound')} icon="⚠" color="amber" />
            <StatCard value={formatDuration(report.start_time, report.end_time)} label={t('duration')} icon="⏱" color="emerald" />
          </div>

          {/* Verified Badge */}
          <div className="mt-6 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 tracking-wider">{t('verified')}</span>
            </div>
            <span className="text-xs text-slate-400">
              {t('verifiedBy')} {report.cleaner_name} • {format(new Date(report.cleaning_date), 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
      </header>

      {/* Room Filter Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-2xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedRoom(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              !selectedRoom ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('all')}
          </button>
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedRoom === room.id ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Checklist by Room */}
        {(selectedRoom ? rooms.filter(r => r.id === selectedRoom) : rooms).map(room => (
          <section key={room.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{room.name}</h2>
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                {room.tasks_completed}/{room.tasks_total}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${room.tasks_total > 0 ? (room.tasks_completed / room.tasks_total) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {(room.checklist as any[]).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.completed ? 'bg-emerald-50/80' : 'bg-red-50/60'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span className={`text-sm flex-1 ${item.completed ? 'text-slate-700' : 'text-red-600'}`}>
                    {item.label}
                  </span>
                  {item.photoUrl && (
                    <button onClick={() => setLightboxPhoto(item.photoUrl)} className="shrink-0">
                      <Camera className="w-4 h-4 text-cyan-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Photo Gallery */}
        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t('photoGallery')}</h2>

            {beforePhotos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('beforePhotos')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {beforePhotos.map(p => (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLightboxPhoto(p.photo_url)}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md group"
                    >
                      <img src={p.photo_url} alt={p.caption || ''} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {afterPhotos.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('afterPhotos')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {afterPhotos.map(p => (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLightboxPhoto(p.photo_url)}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md group"
                    >
                      <img src={p.photo_url} alt={p.caption || ''} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Damages */}
        {allDamages.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('damages')} ({allDamages.length})
            </h2>
            <div className="space-y-3">
              {allDamages.map((d: any, i: number) => (
                <div key={i} className="bg-amber-50 border border-amber-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {d.photoUrl && (
                      <button
                        onClick={() => setLightboxPhoto(d.photoUrl)}
                        className="w-16 h-16 rounded-lg overflow-hidden shrink-0"
                      >
                        <img src={d.photoUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.description}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        d.severity === 'high' ? 'bg-red-100 text-red-700' :
                        d.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {(t('severity') as any)?.[d.severity] || d.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lost & Found */}
        {allLostFound.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-500" />
              {t('lostFound')} ({allLostFound.length})
            </h2>
            <div className="space-y-3">
              {allLostFound.map((item: any, i: number) => (
                <div key={i} className="bg-cyan-50 border border-cyan-200/50 rounded-xl p-4 flex items-start gap-3">
                  {item.photoUrl && (
                    <button
                      onClick={() => setLightboxPhoto(item.photoUrl)}
                      className="w-16 h-16 rounded-lg overflow-hidden shrink-0"
                    >
                      <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {report.notes && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">{t('notes')}</h2>
            <div className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">{report.notes}</p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 pb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={purLogo} alt="Logo" className="w-5 h-5 rounded" />
            <span className="text-xs text-slate-400 font-medium">{t('poweredBy')} Maison Pur</span>
          </div>
          <p className="text-[10px] text-slate-300">
            © {new Date().getFullYear()} • Report ID: {report.public_token.slice(0, 8)}
          </p>
        </footer>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={lightboxPhoto}
              alt=""
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ value, label, icon, color }: { value: string; label: string; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/20 border-cyan-400/20',
    blue: 'bg-blue-500/20 border-blue-400/20',
    amber: 'bg-amber-500/20 border-amber-400/20',
    emerald: 'bg-emerald-500/20 border-emerald-400/20',
  };

  return (
    <div className={`rounded-xl p-3 border ${colorMap[color] || colorMap.cyan}`}>
      <span className="text-lg">{icon}</span>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      <p className="text-[10px] text-slate-300 uppercase tracking-wider">{label}</p>
    </div>
  );
}
