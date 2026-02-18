import { useParams } from 'react-router-dom';
import { usePublicReport, ReportRoom, ReportPhoto } from '@/hooks/useReports';
import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { enUS, ptBR, ko, th, es } from 'date-fns/locale';
import purLogo from '@/assets/pur-logo.png';

// ─── Translations (matches reference HTML) ───
const translations: Record<string, Record<string, string>> = {
  en: {
    subtitle: 'YOUR TIME MATTERS, WE HANDLE CLEANING',
    rooms: 'Rooms', date: 'Date', visitReport: 'Visit Report',
    messenger: 'iMessage', website: 'Website', bookNext: 'Book Next',
    checklist: 'Checklist', damages: 'Damages Reported', lostFound: 'Lost & Found',
    footerQuote: 'Your time matters, we handle cleaning',
    notFound: 'Report not found',
    notFoundDesc: 'This link may be invalid or the report has not been published yet.',
    severity: 'Severity', location: 'Location',
  },
  pt: {
    subtitle: 'SEU TEMPO IMPORTA, NÓS CUIDAMOS DA LIMPEZA',
    rooms: 'Cômodos', date: 'Data', visitReport: 'Relatório de Visita',
    messenger: 'iMessage', website: 'Website', bookNext: 'Agendar Próxima',
    checklist: 'Checklist', damages: 'Danos Reportados', lostFound: 'Achados e Perdidos',
    footerQuote: 'Seu tempo importa, nós cuidamos da limpeza',
    notFound: 'Relatório não encontrado',
    notFoundDesc: 'Este link pode ser inválido ou o relatório ainda não foi publicado.',
    severity: 'Severidade', location: 'Localização',
  },
  ko: {
    subtitle: '당신의 시간은 소중합니다',
    rooms: '방', date: '날짜', visitReport: '방문 보고서',
    messenger: 'iMessage', website: '웹사이트', bookNext: '다음 예약',
    checklist: '체크리스트', damages: '보고된 손상', lostFound: '분실물',
    footerQuote: '당신의 시간은 소중합니다',
    notFound: '보고서를 찾을 수 없습니다',
    notFoundDesc: '이 링크가 유효하지 않거나 보고서가 아직 게시되지 않았습니다.',
    severity: '심각도', location: '위치',
  },
  th: {
    subtitle: 'เวลาของคุณมีค่า',
    rooms: 'ห้อง', date: 'วันที่', visitReport: 'รายงานการเยี่ยมชม',
    messenger: 'iMessage', website: 'เว็บไซต์', bookNext: 'จองครั้งต่อไป',
    checklist: 'รายการ', damages: 'ความเสียหายที่รายงาน', lostFound: 'ของหายและพบ',
    footerQuote: 'เวลาของคุณมีค่า',
    notFound: 'ไม่พบรายงาน',
    notFoundDesc: 'ลิงก์นี้อาจไม่ถูกต้องหรือรายงานยังไม่ได้เผยแพร่',
    severity: 'ความรุนแรง', location: 'สถานที่',
  },
  es: {
    subtitle: 'SU TIEMPO IMPORTA, NOSOTROS LIMPIAMOS',
    rooms: 'Habitaciones', date: 'Fecha', visitReport: 'Reporte de Visita',
    messenger: 'iMessage', website: 'Sitio Web', bookNext: 'Reservar Siguiente',
    checklist: 'Checklist', damages: 'Daños Reportados', lostFound: 'Objetos Perdidos',
    footerQuote: 'Su tiempo importa, nosotros nos encargamos de la limpieza',
    notFound: 'Reporte no encontrado',
    notFoundDesc: 'Este enlace puede ser inválido o el reporte aún no se ha publicado.',
    severity: 'Severidad', location: 'Ubicación',
  },
};

const dateLocales: Record<string, any> = { en: enUS, pt: ptBR, ko, th, es };

export default function PublicReport() {
  const { token } = useParams<{ token: string }>();
  const { report, rooms, photos, isLoading } = usePublicReport(token);
  const [lang, setLang] = useState('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const t = useCallback((key: string) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  useEffect(() => {
    if (report?.language && translations[report.language]) setLang(report.language);
  }, [report]);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = () => setLangMenuOpen(false);
    if (langMenuOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langMenuOpen]);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPPP', { locale: dateLocales[lang] || enUS });
    } catch { return dateStr; }
  }, [lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          </div>
          <h1 className="text-xl font-serif text-stone-800 mb-2">{t('notFound')}</h1>
          <p className="text-sm text-stone-500">{t('notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const allDamages = rooms.flatMap(r => (r.damages || []) as any[]);
  const allLostFound = rooms.flatMap(r => (r.lost_and_found || []) as any[]);

  // Get photos grouped by room
  const getPhotosForRoom = (roomId: string) => photos.filter(p => p.room_id === roomId);
  const generalPhotos = photos.filter(p => !p.room_id);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased font-sans selection:bg-stone-200" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Header: Gallery Wall Style */}
      <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden bg-stone-100">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1920&auto=format&fit=crop"
          className="w-full h-full object-cover object-center"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50/90 md:to-stone-50/50" />

        {/* Logo */}
        <div className="absolute top-6 left-6 z-20">
          <img src={purLogo} className="h-12 w-auto drop-shadow-md" alt="Logo" />
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setLangMenuOpen(!langMenuOpen); }}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all text-xs font-bold text-stone-800 uppercase tracking-wider"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {lang.toUpperCase()}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-stone-100 py-2 overflow-hidden origin-top-right animate-scale-in z-50">
              {Object.keys(translations).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-medium uppercase hover:bg-stone-50 transition-colors"
                >
                  {{ en: 'English', pt: 'Português', es: 'Español', th: 'Thai', ko: 'Korean' }[l] || l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Overlapping Profile & Info Card */}
      <div className="relative z-10 -mt-24 md:-mt-32 text-center px-4 animate-fade-in">
        <div className="inline-block relative mb-6">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-stone-200 mx-auto flex items-center justify-center">
            <img src="https://i.ibb.co/bg9ZNvSk/Captura-de-Tela-2026-01-01-s-01-33-28.png" className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {report.cleaner_name}
        </h1>

        {/* Info Card */}
        <div className="max-w-3xl mx-auto bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-2xl overflow-hidden mb-12">
          <div className="py-6 px-4 border-b border-stone-100 bg-stone-50/30">
            <p className="text-xs font-bold text-[#717D62] uppercase tracking-[0.2em]">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors">
              <span className="text-3xl font-serif text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{rooms.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{t('rooms')}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors">
              <span className="text-lg font-serif text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{formatDate(report.cleaning_date)}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{t('date')}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors text-center">
              <div className="flex items-center gap-1 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-300"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="text-sm font-serif text-stone-600 line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>{report.property_name}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{t('visitReport')}</span>
            </div>
          </div>
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col md:flex-row justify-center gap-3">
            <a href="sms:" className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              {t('messenger')}
            </a>
            <a href="https://maisonpurusa.com" target="_blank" rel="noopener" className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {t('website')}
            </a>
            <a href="mailto:contact@maisonpurusa.com" className="flex-1 flex justify-center items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {t('bookNext')}
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Content - Room by Room */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {rooms.map((room, roomIdx) => {
          const roomPhotos = getPhotosForRoom(room.id);
          const roomGeneralPhotos = roomIdx === 0 ? generalPhotos : [];
          const allRoomPhotos = [...roomPhotos, ...roomGeneralPhotos];
          const roomDamages = (room.damages || []) as any[];
          const roomLostFound = (room.lost_and_found || []) as any[];
          const checklistItems = (room.checklist || []) as any[];

          return (
            <div key={room.id} className="mb-24 border-b border-stone-200 pb-16 last:border-0">
              {/* Room Header */}
              <div className="flex items-center gap-4 mb-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 font-serif text-lg font-bold text-white shadow-lg shadow-stone-200 flex-shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {roomIdx + 1}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-stone-800 break-words" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {room.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Checklist Column */}
                <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
                  {/* Checklist Card */}
                  {checklistItems.length > 0 && (
                    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                      <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                        <h4 className="font-bold text-stone-400 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          {t('checklist')}
                        </h4>
                        <span className="text-[10px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                          {room.tasks_completed}/{room.tasks_total}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {checklistItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 text-sm group">
                            <div className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-[#8A9679]' : 'text-stone-300'}`}>
                              {item.completed ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={item.completed ? 'text-stone-700' : 'text-stone-400'}>{item.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Damages Card */}
                  {roomDamages.length > 0 && (
                    <div className="bg-white rounded-xl border border-amber-200/60 shadow-sm overflow-hidden">
                      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                        <h4 className="font-bold text-amber-600 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          {t('damages')}
                        </h4>
                        <span className="text-[10px] font-mono bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                          {roomDamages.length}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {roomDamages.map((d: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            {d.photoUrl && (
                              <button onClick={() => setLightboxUrl(d.photoUrl)} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                                <img src={d.photoUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-stone-800 font-medium">{d.description}</p>
                              {d.severity && (
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  d.severity === 'high' ? 'bg-red-100 text-red-700' :
                                  d.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {d.severity}
                                </span>
                              )}
                              {d.location && <p className="text-xs text-stone-400 mt-1">{d.location}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lost & Found Card */}
                  {roomLostFound.length > 0 && (
                    <div className="bg-white rounded-xl border border-blue-200/60 shadow-sm overflow-hidden">
                      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                        <h4 className="font-bold text-blue-600 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          {t('lostFound')}
                        </h4>
                        <span className="text-[10px] font-mono bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded">
                          {roomLostFound.length}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {roomLostFound.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            {item.photoUrl && (
                              <button onClick={() => setLightboxUrl(item.photoUrl)} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                                <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-stone-800 font-medium">{item.description}</p>
                              {item.location && <p className="text-xs text-stone-400 mt-1">{item.location}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photos Column */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                  {allRoomPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {allRoomPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl aspect-square"
                          onClick={() => setLightboxUrl(photo.photo_url)}
                        >
                          <img
                            src={photo.photo_url}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={photo.caption || room.name}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 p-2 rounded-full shadow-sm text-stone-800">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            </div>
                          </div>
                          {photo.photo_type !== 'after' && photo.photo_type !== 'before' && (
                            <div className="absolute top-3 left-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md ${
                                photo.photo_type === 'damage' ? 'bg-amber-500/80 text-white' :
                                photo.photo_type === 'lost_found' ? 'bg-blue-500/80 text-white' :
                                'bg-stone-800/60 text-white'
                              }`}>
                                {photo.photo_type === 'damage' ? '⚠' : photo.photo_type === 'lost_found' ? '🔍' : '📷'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-stone-100 rounded-xl text-stone-400 text-sm">
                      No photos
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Standalone damages/lostfound that aren't room-specific */}
        {rooms.length === 0 && (allDamages.length > 0 || allLostFound.length > 0) && (
          <div className="space-y-6">
            {allDamages.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200/60 shadow-sm overflow-hidden p-4">
                <h3 className="font-bold text-amber-600 uppercase tracking-widest text-xs mb-3">{t('damages')}</h3>
                {allDamages.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <p className="text-sm text-stone-800">{d.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-24 text-center border-t border-stone-200 pt-12 pb-24">
        <p className="font-serif italic text-stone-500" style={{ fontFamily: "'Playfair Display', serif" }}>
          "{t('footerQuote')}"
        </p>
        <div className="mt-8 flex justify-center">
          <img src={purLogo} className="h-8 w-auto opacity-50" alt="Logo" />
        </div>
        <p className="text-[10px] text-stone-300 mt-4">
          © {new Date().getFullYear()} Maison Pur • Report ID: {report.public_token.slice(0, 8)}
        </p>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="fixed top-6 right-6 z-[100000] bg-stone-900/50 text-white hover:bg-stone-800 p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div className="max-w-5xl max-h-[90vh] relative w-full flex justify-center items-center">
            <img
              src={lightboxUrl}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              alt=""
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
