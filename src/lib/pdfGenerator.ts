import jsPDF from 'jspdf';
import { Job, InventoryItem, DamageReport, ChecklistSection, LostAndFoundItem } from '@/types';
import purLogo from '@/assets/pur-logo.png';

export interface ReportData {
  job: Job;
  property?: import('@/types').Property;
  inventory: InventoryItem[];
  responsibleName: string;
  lostAndFound?: LostAndFoundItem[];
  laundryExpedition?: LaundryItem[];
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

type RGB = [number, number, number];

// Refined premium palette
const P = {
  // Primary tones
  darkNavy:    [10, 15, 30] as RGB,
  navy:        [18, 27, 52] as RGB,
  slate:       [35, 48, 72] as RGB,
  
  // Accent
  cyan:        [0, 188, 212] as RGB,
  cyanLight:   [77, 208, 225] as RGB,
  cyanDark:    [0, 151, 167] as RGB,
  teal:        [0, 150, 136] as RGB,
  
  // Status
  emerald:     [16, 185, 129] as RGB,
  emeraldDark: [5, 150, 105] as RGB,
  amber:       [245, 158, 11] as RGB,
  amberDark:   [217, 119, 6] as RGB,
  rose:        [239, 68, 68] as RGB,
  roseDark:    [220, 38, 38] as RGB,
  
  // Neutrals
  white:       [255, 255, 255] as RGB,
  offWhite:    [250, 252, 255] as RGB,
  gray50:      [248, 250, 252] as RGB,
  gray100:     [241, 245, 249] as RGB,
  gray200:     [226, 232, 240] as RGB,
  gray300:     [203, 213, 225] as RGB,
  gray400:     [148, 163, 184] as RGB,
  gray500:     [100, 116, 139] as RGB,
  gray600:     [71, 85, 105] as RGB,
  gray700:     [51, 65, 85] as RGB,
  gray800:     [30, 41, 59] as RGB,
  gray900:     [15, 23, 42] as RGB,
};

class PremiumReportGenerator {
  private pdf: jsPDF;
  private W: number;
  private H: number;
  private M = 16; // margin
  private y = 0;
  private CW: number;
  private logoDataUrl = '';
  private logoLoaded = false;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.W = this.pdf.internal.pageSize.getWidth();
    this.H = this.pdf.internal.pageSize.getHeight();
    this.CW = this.W - this.M * 2;
  }

  // ─── Utilities ─────────────────────────────────
  private async loadLogo(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0); this.logoDataUrl = c.toDataURL('image/png'); this.logoLoaded = true; }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = purLogo;
    });
  }

  private async urlToBase64(url: string): Promise<string> {
    if (!url) return '';
    if (url.startsWith('data:image')) return url;
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch { return ''; }
  }

  private async preloadImages(data: ReportData): Promise<ReportData> {
    const { job, lostAndFound } = data;
    const urls: { type: string; index: number; url: string; sub?: number }[] = [];
    
    job.photosBefore.forEach((u, i) => urls.push({ type: 'b', index: i, url: u }));
    job.photosAfter.forEach((u, i) => urls.push({ type: 'a', index: i, url: u }));
    job.checklist.forEach((s, si) => s.items.forEach((item, ii) => {
      if (item.photoUrl) urls.push({ type: 'c', index: si, sub: ii, url: item.photoUrl });
    }));
    (job.damages || []).forEach((d, i) => { if (d.photoUrl) urls.push({ type: 'd', index: i, url: d.photoUrl }); });
    (lostAndFound || job.lostAndFound || []).forEach((item, i) => { if (item.photoUrl) urls.push({ type: 'l', index: i, url: item.photoUrl }); });

    const results = await Promise.all(urls.map(async (e) => ({ ...e, b64: await this.urlToBase64(e.url) })));
    const cj: Job = JSON.parse(JSON.stringify(job));
    const cl: LostAndFoundItem[] = JSON.parse(JSON.stringify(lostAndFound || job.lostAndFound || []));

    results.forEach(r => {
      if (!r.b64) return;
      if (r.type === 'b') cj.photosBefore[r.index] = r.b64;
      else if (r.type === 'a') cj.photosAfter[r.index] = r.b64;
      else if (r.type === 'c' && r.sub !== undefined) cj.checklist[r.index].items[r.sub].photoUrl = r.b64;
      else if (r.type === 'd' && cj.damages[r.index]) cj.damages[r.index].photoUrl = r.b64;
      else if (r.type === 'l' && cl[r.index]) cl[r.index].photoUrl = r.b64;
    });

    return { ...data, job: cj, lostAndFound: cl };
  }

  private sc(c: RGB) { this.pdf.setTextColor(c[0], c[1], c[2]); }
  private sf(c: RGB) { this.pdf.setFillColor(c[0], c[1], c[2]); }
  private sd(c: RGB) { this.pdf.setDrawColor(c[0], c[1], c[2]); }

  private rr(x: number, y: number, w: number, h: number, r: number, s: string) {
    this.pdf.roundedRect(x, y, w, h, r, r, s);
  }

  private addImg(data: string, x: number, y: number, w: number, h: number): boolean {
    try {
      if (!data || !data.startsWith('data:image')) return false;
      this.pdf.addImage(data, data.includes('png') ? 'PNG' : 'JPEG', x, y, w, h);
      return true;
    } catch { return false; }
  }

  private pageBreak(need: number) {
    if (this.y + need > this.H - 30) {
      this.pdf.addPage();
      this.y = 18;
      this.drawPageHeader();
    }
  }

  private drawPageHeader() {
    // Top accent line
    this.sf(P.cyan);
    this.pdf.rect(0, 0, this.W, 2.5, 'F');
    // Secondary thin line
    this.sf(P.cyanDark);
    this.pdf.rect(0, 2.5, this.W, 0.5, 'F');
  }

  // ─── Design Components ─────────────────────────

  private badge(label: string, x: number, y: number, bg: RGB, fg: RGB = P.white, w?: number) {
    const bw = w || (this.pdf.getTextWidth(label) + 8);
    this.sf(bg);
    this.rr(x, y, bw, 6.5, 1.5, 'F');
    this.sc(fg);
    this.pdf.setFontSize(6.5);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, x + bw / 2, y + 4.5, { align: 'center' });
  }

  private pillBadge(label: string, x: number, y: number, bg: RGB, fg: RGB = P.white) {
    const bw = this.pdf.getTextWidth(label) + 10;
    this.sf(bg);
    this.rr(x, y, bw, 7.5, 3.5, 'F');
    this.sc(fg);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, x + bw / 2, y + 5.2, { align: 'center' });
    return bw;
  }

  private sectionTitle(title: string, icon?: string) {
    this.pageBreak(18);

    // Accent bar
    this.sf(P.navy);
    this.rr(this.M, this.y, this.CW, 12, 3, 'F');
    
    // Cyan left accent
    this.sf(P.cyan);
    this.pdf.rect(this.M, this.y + 1, 4, 10, 'F');

    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    const label = icon ? `${icon}  ${title}` : title;
    this.pdf.text(label, this.M + 10, this.y + 8);

    this.y += 16;
  }

  private card(x: number, y: number, w: number, h: number, accentColor?: RGB) {
    // Shadow
    this.sf(P.gray200);
    this.rr(x + 0.5, y + 0.5, w, h, 3, 'F');
    // Card
    this.sf(P.white);
    this.sd(P.gray200);
    this.pdf.setLineWidth(0.2);
    this.rr(x, y, w, h, 3, 'FD');
    // Left accent
    if (accentColor) {
      this.sf(accentColor);
      this.rr(x, y, 3.5, h, 2, 'F');
      this.pdf.rect(x + 2, y, 1.5, h, 'F');
    }
  }

  private statBox(x: number, y: number, w: number, value: string, label: string, color: RGB) {
    this.card(x, y, w, 30);
    
    // Color top stripe
    this.sf(color);
    this.rr(x, y, w, 3, 3, 'F');
    this.pdf.rect(x, y + 2, w, 1, 'F');

    // Icon circle
    this.sf(color);
    const cx = x + w / 2;
    this.pdf.circle(cx, y + 13, 5, 'F');
    
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    // Simple icon text
    this.pdf.text(value.length <= 3 ? value : '•', cx, y + 14.5, { align: 'center' });

    // Value
    this.sc(P.gray800);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text(value, cx, y + 24, { align: 'center' });

    // Label
    this.sc(P.gray500);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6.5);
    this.pdf.text(label, cx, y + 28.5, { align: 'center' });
  }

  // ─── Cover Page ────────────────────────────────
  private drawCover(data: ReportData) {
    const { job, property } = data;

    // Full dark background
    this.sf(P.darkNavy);
    this.pdf.rect(0, 0, this.W, this.H, 'F');

    // Top gradient bar
    this.sf(P.cyan);
    this.pdf.rect(0, 0, this.W, 5, 'F');
    this.sf(P.cyanDark);
    this.pdf.rect(0, 5, this.W, 1.5, 'F');

    // Decorative geometric elements
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 0.05 }));
    this.sf(P.cyan);
    this.pdf.circle(this.W - 30, 60, 80, 'F');
    this.pdf.circle(30, this.H - 80, 60, 'F');
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 1 }));

    // Logo
    let logoY = 45;
    if (this.logoLoaded && this.logoDataUrl) {
      try { this.pdf.addImage(this.logoDataUrl, 'PNG', this.W / 2 - 18, logoY, 36, 36); } catch {}
      logoY += 44;
    } else {
      logoY += 10;
    }

    // Brand name
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('MAISON PUR', this.W / 2, logoY, { align: 'center' });

    // Tagline
    this.sc(P.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.text('EXCELÊNCIA EM GESTÃO DE PROPRIEDADES', this.W / 2, logoY + 9, { align: 'center' });

    // Decorative divider
    const divY = logoY + 18;
    this.sf(P.cyan);
    this.pdf.rect(this.W / 2 - 20, divY, 40, 0.8, 'F');
    this.sf(P.cyanLight);
    this.pdf.circle(this.W / 2 - 22, divY + 0.4, 1.2, 'F');
    this.pdf.circle(this.W / 2 + 22, divY + 0.4, 1.2, 'F');

    // Report type label
    this.sc(P.cyan);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text('RELATÓRIO DE INSPEÇÃO E LIMPEZA', this.W / 2, divY + 14, { align: 'center' });

    // Property name - hero
    const propName = (property?.name || job.clientName).toUpperCase();
    this.sc(P.white);
    this.pdf.setFontSize(26);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(propName, this.W / 2, divY + 30, { align: 'center' });

    // Address
    this.sc(P.gray400);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const addr = property?.address || job.address;
    this.pdf.text(addr, this.W / 2, divY + 38, { align: 'center' });

    // Job type pill
    this.pillBadge(job.type.toUpperCase(), this.W / 2 - 16, divY + 44, P.cyan, P.darkNavy);

    // Info cards at bottom
    const cardY = this.H - 75;
    const dateStr = new Date(job.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const startTime = job.startTime ? new Date(job.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : job.time;
    const endTime = job.endTime ? new Date(job.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    // Single glass card for info
    this.sf(P.slate);
    this.rr(this.M + 5, cardY, this.CW - 10, 38, 5, 'F');

    const infos = [
      { icon: '📅', label: 'DATA', value: dateStr },
      { icon: '🕐', label: 'INÍCIO', value: startTime },
      { icon: '🕑', label: 'TÉRMINO', value: endTime },
      { icon: '👤', label: 'RESPONSÁVEL', value: data.responsibleName },
    ];

    const colW = (this.CW - 20) / 4;
    infos.forEach((info, i) => {
      const cx = this.M + 10 + i * colW + colW / 2;

      this.sc(P.gray400);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(6.5);
      this.pdf.text(info.label, cx, cardY + 10, { align: 'center' });

      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      const val = info.value.length > 14 ? info.value.substring(0, 14) + '…' : info.value;
      this.pdf.text(val, cx, cardY + 20, { align: 'center' });

      // Divider between columns (not last)
      if (i < 3) {
        this.sf(P.gray600);
        this.pdf.rect(this.M + 10 + (i + 1) * colW, cardY + 6, 0.3, 26, 'F');
      }
    });

    // Footer
    this.sc(P.gray600);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Documento gerado automaticamente pelo sistema Maison Pur', this.W / 2, this.H - 10, { align: 'center' });
  }

  // ─── Executive Summary ─────────────────────────
  private drawSummary(job: Job) {
    this.sectionTitle('RESUMO EXECUTIVO', '📊');

    const totalTasks = job.checklist.reduce((a, s) => a + s.items.length, 0);
    const completed = job.checklist.reduce((a, s) => a + s.items.filter(i => i.completed).length, 0);
    const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const dmg = job.damages?.length || 0;
    const lost = job.lostAndFound?.length || 0;
    const photos = (job.photosBefore?.length || 0) + (job.photosAfter?.length || 0);
    const dur = job.startTime && job.endTime ? Math.floor((job.endTime - job.startTime) / 60000) : 0;

    // Stats row
    const stats = [
      { value: `${pct}%`, label: 'CONCLUSÃO', color: pct === 100 ? P.emerald : P.amber },
      { value: `${completed}/${totalTasks}`, label: 'TAREFAS', color: P.cyan },
      { value: `${dmg}`, label: 'AVARIAS', color: dmg > 0 ? P.rose : P.emerald },
      { value: `${lost}`, label: 'ACHADOS', color: P.amberDark },
      { value: `${photos}`, label: 'FOTOS', color: P.teal },
      { value: dur > 0 ? `${Math.floor(dur / 60)}h${String(dur % 60).padStart(2, '0')}` : '--', label: 'DURAÇÃO', color: P.cyanDark },
    ];

    const gap = 3;
    const sw = (this.CW - (stats.length - 1) * gap) / stats.length;
    stats.forEach((s, i) => {
      this.statBox(this.M + i * (sw + gap), this.y, sw, s.value, s.label, s.color);
    });
    this.y += 35;

    // Big completion bar
    this.pageBreak(12);
    this.card(this.M, this.y, this.CW, 10);
    this.sc(P.gray600);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('PROGRESSO GERAL', this.M + 8, this.y + 5);

    this.sf(P.gray200);
    this.rr(this.M + 55, this.y + 2.5, this.CW - 80, 5, 2, 'F');
    if (pct > 0) {
      this.sf(pct === 100 ? P.emerald : P.cyan);
      const barW = (this.CW - 80) * (pct / 100);
      this.rr(this.M + 55, this.y + 2.5, barW, 5, 2, 'F');
    }
    this.sc(pct === 100 ? P.emerald : P.cyan);
    this.pdf.setFontSize(8);
    this.pdf.text(`${pct}%`, this.M + this.CW - 18, this.y + 6.5, { align: 'center' });

    this.y += 14;

    // Notes
    if (job.reportNote) {
      this.pageBreak(25);
      const lines = this.pdf.splitTextToSize(job.reportNote, this.CW - 20);
      const h = 14 + lines.length * 4.5;
      this.card(this.M, this.y, this.CW, h, P.cyan);

      this.sc(P.cyan);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7.5);
      this.pdf.text('OBSERVAÇÕES DO RESPONSÁVEL', this.M + 12, this.y + 8);

      this.sc(P.gray700);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.text(lines, this.M + 12, this.y + 15);

      this.y += h + 5;
    }
  }

  // ─── Checklist Section ─────────────────────────
  private drawChecklist(section: ChecklistSection) {
    const total = section.items.length;
    const done = section.items.filter(i => i.completed).length;
    const allDone = done === total;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Calculate needed height
    const itemH = 8;
    const headerH = 18;
    const cardH = headerH + total * itemH + 6;
    this.pageBreak(cardH + 5);

    const x = this.M;
    const y = this.y;

    // Card with accent
    this.card(x, y, this.CW, cardH, allDone ? P.emerald : P.amber);

    // Section header area
    this.sf(allDone ? P.emerald : P.amber);
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 0.08 }));
    this.pdf.rect(x, y, this.CW, headerH, 'F');
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 1 }));

    // Section title
    this.sc(P.gray800);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.text(section.title.toUpperCase(), x + 12, y + 8);

    // Status badge
    const statusColor = allDone ? P.emerald : P.amber;
    this.pillBadge(`${done}/${total}`, x + this.CW - 30, y + 2.5, statusColor);

    // Progress bar
    const barX = x + 12;
    const barY = y + 12;
    const barW = this.CW - 24;
    this.sf(P.gray200);
    this.rr(barX, barY, barW, 2.5, 1, 'F');
    if (pct > 0) {
      this.sf(allDone ? P.emerald : P.cyan);
      this.rr(barX, barY, barW * (pct / 100), 2.5, 1, 'F');
    }

    // Items
    section.items.forEach((item, idx) => {
      const iy = y + headerH + idx * itemH + 3;

      // Alternating row bg
      if (idx % 2 === 0) {
        this.sf(P.gray50);
        this.pdf.rect(x + 4, iy - 3.5, this.CW - 8, itemH, 'F');
      }

      // Checkbox
      if (item.completed) {
        this.sf(P.emerald);
        this.rr(x + 12, iy - 2.5, 5, 5, 1.5, 'F');
        this.sc(P.white);
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('✓', x + 13.2, iy + 1.5);
      } else {
        this.sd(P.gray400);
        this.pdf.setLineWidth(0.4);
        this.rr(x + 12, iy - 2.5, 5, 5, 1.5, 'S');
      }

      // Label
      this.sc(item.completed ? P.gray700 : P.gray500);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8.5);
      const maxLabelW = this.CW - 55;
      const lbl = this.pdf.getTextWidth(item.label) > maxLabelW
        ? item.label.substring(0, 38) + '…' : item.label;
      this.pdf.text(lbl, x + 21, iy + 1);

      // Photo indicator
      if (item.photoRequired) {
        if (item.photoUrl) {
          this.badge('📷 OK', x + this.CW - 30, iy - 2, P.emerald);
        } else {
          this.badge('📷', x + this.CW - 22, iy - 2, P.gray300, P.gray600);
        }
      }

      // Completed indicator
      if (item.completed) {
        this.sc(P.emerald);
        this.pdf.setFontSize(6);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('FEITO', x + this.CW - 14, iy + 1, { align: 'right' });
      }
    });

    this.y = y + cardH + 5;
  }

  // ─── Verification Photos Grid ──────────────────
  private drawVerificationPhotos(section: ChecklistSection) {
    const items = section.items.filter(i => i.photoUrl);
    if (items.length === 0) return;

    this.pageBreak(40);

    const photoW = 30;
    const photoH = 24;
    const gap = 4;
    const perRow = Math.floor((this.CW - 12) / (photoW + gap));
    const rows = Math.ceil(items.length / perRow);
    const blockH = 16 + rows * (photoH + 14);

    this.card(this.M, this.y, this.CW, blockH);

    // Header
    this.sc(P.gray600);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7.5);
    this.pdf.text(`📷 VERIFICAÇÃO FOTOGRÁFICA — ${section.title.toUpperCase()}`, this.M + 8, this.y + 9);

    items.forEach((item, idx) => {
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);
      const px = this.M + 6 + col * (photoW + gap);
      const py = this.y + 14 + row * (photoH + 14);

      // Photo frame with shadow
      this.sf(P.gray200);
      this.rr(px + 0.5, py + 0.5, photoW, photoH, 2, 'F');
      this.sf(P.white);
      this.sd(P.cyan);
      this.pdf.setLineWidth(0.5);
      this.rr(px, py, photoW, photoH, 2, 'FD');

      if (item.photoUrl) {
        this.addImg(item.photoUrl, px + 0.5, py + 0.5, photoW - 1, photoH - 1);
      }

      // Label
      this.sc(P.gray700);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(5.5);
      const lbl = item.label.length > 20 ? item.label.substring(0, 18) + '…' : item.label;
      this.pdf.text(lbl, px + photoW / 2, py + photoH + 5, { align: 'center' });

      // Status dot
      this.sf(P.emerald);
      this.pdf.circle(px + photoW / 2, py + photoH + 9, 1.5, 'F');
    });

    this.y += blockH + 5;
  }

  // ─── Damages Section ───────────────────────────
  private drawDamages(damages: DamageReport[]) {
    if (!damages || damages.length === 0) return;

    this.sectionTitle('REGISTRO DE AVARIAS E MANUTENÇÃO', '⚠️');

    damages.forEach((damage, idx) => {
      const hasPhoto = !!damage.photoUrl;
      const cardH = hasPhoto ? 42 : 26;
      this.pageBreak(cardH + 5);

      const x = this.M;
      const y = this.y;

      this.card(x, y, this.CW, cardH, P.rose);

      // Number circle
      this.sf(P.rose);
      this.pdf.circle(x + 14, y + 10, 5, 'F');
      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text(`${idx + 1}`, x + 14, y + 12, { align: 'center' });

      // Severity badge
      const sevMap: Record<string, { label: string; color: RGB }> = {
        high: { label: 'URGENTE', color: P.rose },
        medium: { label: 'ATENÇÃO', color: P.amber },
        low: { label: 'BAIXA', color: P.emerald },
      };
      const sev = sevMap[damage.severity] || sevMap.medium;
      this.pillBadge(sev.label, x + this.CW - 32, y + 3, sev.color);

      // Type badge
      const typeMap: Record<string, string> = {
        furniture: 'MOBILIÁRIO', electronics: 'ELETRÔNICOS', stain: 'MANCHA', other: 'OUTRO',
      };
      this.badge(typeMap[damage.type] || 'OUTRO', x + this.CW - 56, y + 4, P.gray500);

      // Description
      this.sc(P.gray800);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9);
      const maxW = hasPhoto ? this.CW - 60 : this.CW - 28;
      const descLines = this.pdf.splitTextToSize(damage.description, maxW);
      this.pdf.text(descLines.slice(0, 3), x + 22, y + 20);

      // Photo
      if (hasPhoto && damage.photoUrl) {
        const pw = 32; const ph = 28;
        const photoX = x + this.CW - pw - 6;
        const photoY = y + 10;
        this.sf(P.gray200);
        this.rr(photoX + 0.5, photoY + 0.5, pw, ph, 2, 'F');
        this.sd(P.rose);
        this.pdf.setLineWidth(0.5);
        this.rr(photoX, photoY, pw, ph, 2, 'S');
        this.addImg(damage.photoUrl, photoX + 0.5, photoY + 0.5, pw - 1, ph - 1);
      }

      this.y = y + cardH + 4;
    });
  }

  // ─── Lost & Found Section ─────────────────────
  private drawLostFound(items: LostAndFoundItem[]) {
    if (!items || items.length === 0) return;

    this.sectionTitle('ACHADOS E PERDIDOS', '🔍');

    items.forEach((item, idx) => {
      const hasPhoto = !!item.photoUrl;
      const cardH = hasPhoto ? 38 : 24;
      this.pageBreak(cardH + 5);

      const x = this.M;
      const y = this.y;

      this.card(x, y, this.CW, cardH, P.amberDark);

      // Number circle
      this.sf(P.amberDark);
      this.pdf.circle(x + 14, y + 10, 5, 'F');
      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text(`${idx + 1}`, x + 14, y + 12, { align: 'center' });

      // Description
      this.sc(P.gray800);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9.5);
      this.pdf.text(item.description, x + 24, y + 11);

      // Location & Date
      this.sc(P.gray500);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.text(`📍 ${item.location}`, x + 24, y + 18);
      this.pdf.text(`📅 ${item.date}`, x + 24, y + 24);

      // Photo
      if (hasPhoto && item.photoUrl) {
        const pw = 28; const ph = 24;
        const photoX = x + this.CW - pw - 6;
        const photoY = y + 6;
        this.sf(P.gray200);
        this.rr(photoX + 0.5, photoY + 0.5, pw, ph, 2, 'F');
        this.sd(P.amberDark);
        this.pdf.setLineWidth(0.5);
        this.rr(photoX, photoY, pw, ph, 2, 'S');
        this.addImg(item.photoUrl, photoX + 0.5, photoY + 0.5, pw - 1, ph - 1);
      }

      this.y = y + cardH + 4;
    });
  }

  // ─── Photo Gallery ─────────────────────────────
  private drawGallery(title: string, photos: string[], accent: RGB) {
    if (!photos || photos.length === 0) return;

    this.pageBreak(50);

    const pw = 35; const ph = 28;
    const gap = 4;
    const perRow = Math.floor((this.CW - 12) / (pw + gap));
    const maxPhotos = Math.min(photos.length, 12);
    const rows = Math.ceil(maxPhotos / perRow);
    const blockH = 16 + rows * (ph + gap);

    // Container
    this.card(this.M, this.y, this.CW, blockH);

    // Title bar
    this.sf(accent);
    this.rr(this.M, this.y, this.CW, 11, 3, 'F');
    this.pdf.rect(this.M, this.y + 8, this.CW, 3, 'F');

    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text(`${title}  (${photos.length})`, this.M + 8, this.y + 7.5);

    photos.slice(0, maxPhotos).forEach((photo, idx) => {
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);
      const px = this.M + 6 + col * (pw + gap);
      const py = this.y + 14 + row * (ph + gap);

      // Photo frame
      this.sf(P.gray100);
      this.rr(px, py, pw, ph, 2, 'F');
      this.sd(P.gray300);
      this.pdf.setLineWidth(0.3);
      this.rr(px, py, pw, ph, 2, 'S');
      this.addImg(photo, px + 0.5, py + 0.5, pw - 1, ph - 1);

      // Photo number
      this.sf(accent);
      this.rr(px + 1, py + 1, 8, 5, 1, 'F');
      this.sc(P.white);
      this.pdf.setFontSize(5.5);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${idx + 1}`, px + 5, py + 4.5, { align: 'center' });
    });

    this.y += blockH + 6;
  }

  // ─── Inventory ─────────────────────────────────
  private drawInventory(inventory: InventoryItem[], used: { itemId: string; quantityUsed: number }[]) {
    if (!inventory || inventory.length === 0) return;

    const usedItems = used.filter(u => u.quantityUsed > 0);
    const lowStock = inventory.filter(item => {
      const u = used.find(x => x.itemId === item.id);
      return (item.quantity - (u?.quantityUsed || 0)) <= item.threshold;
    });
    if (usedItems.length === 0 && lowStock.length === 0) return;

    this.sectionTitle('INVENTÁRIO E SUPRIMENTOS', '📦');

    if (usedItems.length > 0) {
      const rowH = 8;
      const tableH = 14 + usedItems.length * rowH;
      this.pageBreak(tableH + 5);

      this.card(this.M, this.y, this.CW, tableH);

      // Header row
      this.sf(P.navy);
      this.rr(this.M, this.y, this.CW, 11, 3, 'F');
      this.pdf.rect(this.M, this.y + 8, this.CW, 3, 'F');

      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7);
      this.pdf.text('PRODUTO', this.M + 10, this.y + 7.5);
      this.pdf.text('QTDE USADA', this.M + this.CW / 2, this.y + 7.5, { align: 'center' });
      this.pdf.text('ESTOQUE', this.M + this.CW - 10, this.y + 7.5, { align: 'right' });

      usedItems.forEach((u, idx) => {
        const item = inventory.find(i => i.id === u.itemId);
        if (!item) return;
        const ry = this.y + 17 + idx * rowH;
        const remaining = item.quantity - u.quantityUsed;
        const isLow = remaining <= item.threshold;

        if (idx % 2 === 0) {
          this.sf(P.gray50);
          this.pdf.rect(this.M + 1, ry - 4, this.CW - 2, rowH, 'F');
        }

        this.sc(P.gray700);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(8);
        this.pdf.text(item.name, this.M + 10, ry);
        this.pdf.text(`${u.quantityUsed} ${item.unit}`, this.M + this.CW / 2, ry, { align: 'center' });

        this.sc(isLow ? P.rose : P.gray700);
        this.pdf.setFont('helvetica', isLow ? 'bold' : 'normal');
        this.pdf.text(`${remaining} ${item.unit}`, this.M + this.CW - 10, ry, { align: 'right' });

        if (isLow) {
          this.badge('⚠ BAIXO', this.M + this.CW - 42, ry - 3.5, P.rose, P.white, 18);
        }
      });

      this.y += tableH + 5;
    }

    // Low stock alert
    if (lowStock.length > 0) {
      this.pageBreak(22);
      const alertH = 14 + lowStock.length * 7;
      this.card(this.M, this.y, this.CW, alertH, P.rose);

      this.sc(P.rose);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text('⚠ ALERTA: REPOSIÇÃO NECESSÁRIA', this.M + 12, this.y + 9);

      lowStock.forEach((item, i) => {
        const u = used.find(x => x.itemId === item.id);
        const rem = item.quantity - (u?.quantityUsed || 0);
        this.sc(P.gray700);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(8);
        this.pdf.text(`• ${item.name} — Estoque: ${rem} ${item.unit} (Mín: ${item.threshold})`, this.M + 12, this.y + 17 + i * 7);
      });

      this.y += alertH + 5;
    }
  }

  // ─── Footer ────────────────────────────────────
  private drawFooter(pageNum: number, totalPages: number) {
    const fy = this.H - 22;

    // Background
    this.sf(P.navy);
    this.pdf.rect(0, fy, this.W, 22, 'F');
    this.sf(P.cyan);
    this.pdf.rect(0, fy, this.W, 1, 'F');

    // Logo
    if (this.logoLoaded && this.logoDataUrl) {
      try { this.pdf.addImage(this.logoDataUrl, 'PNG', this.M, fy + 5, 10, 10); } catch {}
    }

    // Brand
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text('MAISON PUR', this.M + 14, fy + 10);
    this.sc(P.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(5.5);
    this.pdf.text('Excelência em Gestão de Propriedades', this.M + 14, fy + 14);

    // Verified badge
    this.pillBadge('✓ VERIFICADO', this.W / 2 - 14, fy + 6, P.emerald);

    // Page number
    this.sc(P.gray400);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${pageNum} / ${totalPages}`, this.W - this.M, fy + 10, { align: 'right' });

    // Signature line
    this.sd(P.gray500);
    this.pdf.setLineWidth(0.3);
    const sigX = this.W - this.M - 45;
    this.pdf.line(sigX, fy + 14, sigX + 40, fy + 14);
    this.sc(P.gray500);
    this.pdf.setFontSize(5.5);
    this.pdf.text('ASSINATURA DO RESPONSÁVEL', sigX + 20, fy + 18, { align: 'center' });
  }

  // ─── Generate ──────────────────────────────────
  public async generate(data: ReportData): Promise<Blob> {
    await this.loadLogo();
    const processed = await this.preloadImages(data);
    const { job, inventory, lostAndFound } = processed;

    // Page 1: Cover
    this.drawCover(processed);

    // Page 2+: Content
    this.pdf.addPage();
    this.y = 18;
    this.drawPageHeader();

    // Executive summary
    this.drawSummary(job);

    // Checklist sections
    this.sectionTitle('CHECKLIST DE INSPEÇÃO', '✅');
    job.checklist.forEach(section => {
      this.drawChecklist(section);
      this.drawVerificationPhotos(section);
    });

    // Damages
    this.drawDamages(job.damages || []);

    // Lost & Found
    this.drawLostFound(lostAndFound || job.lostAndFound || []);

    // Photo galleries
    this.drawGallery('📷 FOTOS ANTES DA LIMPEZA', job.photosBefore, P.gray600);
    this.drawGallery('✨ FOTOS APÓS A LIMPEZA', job.photosAfter, P.cyan);

    // Inventory
    this.drawInventory(inventory, job.inventoryUsed || []);

    // Add footers to all pages
    const total = this.pdf.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      this.pdf.setPage(i);
      this.drawFooter(i, total);
    }

    return this.pdf.output('blob');
  }
}

export const generateCleaningReport = async (data: ReportData): Promise<Blob> => {
  const gen = new PremiumReportGenerator();
  return await gen.generate(data);
};

export const downloadPdf = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
