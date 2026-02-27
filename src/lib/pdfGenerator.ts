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
  publicToken?: string;
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

type RGB = [number, number, number];

const P = {
  darkNavy:    [10, 15, 30] as RGB,
  navy:        [18, 27, 52] as RGB,
  slate:       [35, 48, 72] as RGB,
  cyan:        [0, 188, 212] as RGB,
  cyanLight:   [77, 208, 225] as RGB,
  cyanDark:    [0, 151, 167] as RGB,
  teal:        [0, 150, 136] as RGB,
  emerald:     [16, 185, 129] as RGB,
  emeraldDark: [5, 150, 105] as RGB,
  amber:       [245, 158, 11] as RGB,
  amberDark:   [217, 119, 6] as RGB,
  rose:        [239, 68, 68] as RGB,
  roseDark:    [220, 38, 38] as RGB,
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
  link:        [0, 100, 200] as RGB,
};

class PremiumReportGenerator {
  private pdf: jsPDF;
  private W: number;
  private H: number;
  private M = 16;
  private y = 0;
  private CW: number;
  private logoDataUrl = '';
  private logoLoaded = false;
  private dossierUrl = '';

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.W = this.pdf.internal.pageSize.getWidth();
    this.H = this.pdf.internal.pageSize.getHeight();
    this.CW = this.W - this.M * 2;
  }

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

  private sc(c: RGB) { this.pdf.setTextColor(c[0], c[1], c[2]); }
  private sf(c: RGB) { this.pdf.setFillColor(c[0], c[1], c[2]); }
  private sd(c: RGB) { this.pdf.setDrawColor(c[0], c[1], c[2]); }

  private rr(x: number, y: number, w: number, h: number, r: number, s: string) {
    this.pdf.roundedRect(x, y, w, h, r, r, s);
  }

  private pageBreak(need: number) {
    if (this.y + need > this.H - 30) {
      this.pdf.addPage();
      this.y = 18;
      this.drawPageHeader();
    }
  }

  private drawPageHeader() {
    this.sf(P.cyan);
    this.pdf.rect(0, 0, this.W, 2.5, 'F');
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

  private sectionTitle(title: string) {
    this.pageBreak(18);
    this.sf(P.navy);
    this.rr(this.M, this.y, this.CW, 12, 3, 'F');
    this.sf(P.cyan);
    this.pdf.rect(this.M, this.y + 1, 4, 10, 'F');
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text(title, this.M + 10, this.y + 8);
    this.y += 16;
  }

  private card(x: number, y: number, w: number, h: number, accentColor?: RGB) {
    this.sf(P.gray200);
    this.rr(x + 0.5, y + 0.5, w, h, 3, 'F');
    this.sf(P.white);
    this.sd(P.gray200);
    this.pdf.setLineWidth(0.2);
    this.rr(x, y, w, h, 3, 'FD');
    if (accentColor) {
      this.sf(accentColor);
      this.rr(x, y, 3.5, h, 2, 'F');
      this.pdf.rect(x + 2, y, 1.5, h, 'F');
    }
  }

  private statBox(x: number, y: number, w: number, value: string, label: string, color: RGB) {
    this.card(x, y, w, 30);
    this.sf(color);
    this.rr(x, y, w, 3, 3, 'F');
    this.pdf.rect(x, y + 2, w, 1, 'F');
    const cx = x + w / 2;

    // Value
    this.sc(P.gray800);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text(value, cx, y + 17, { align: 'center' });

    // Label
    this.sc(P.gray500);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6.5);
    this.pdf.text(label, cx, y + 24, { align: 'center' });
  }

  /** Renders a clickable photo link instead of embedding the image */
  private photoLink(label: string, url: string, x: number, y: number, w: number): number {
    const h = 10;
    this.sf(P.gray50);
    this.sd(P.gray300);
    this.pdf.setLineWidth(0.2);
    this.rr(x, y, w, h, 2, 'FD');

    // Camera icon text
    this.sc(P.gray500);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('[FOTO]', x + 3, y + 4.5);

    // Label
    this.sc(P.gray700);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    const lbl = label.length > 35 ? label.substring(0, 33) + '...' : label;
    this.pdf.text(lbl, x + 18, y + 4.5);

    // Link
    this.sc(P.link);
    this.pdf.setFontSize(6);
    const shortUrl = url.length > 60 ? url.substring(0, 58) + '...' : url;
    this.pdf.textWithLink('Abrir foto em alta resolucao', x + 3, y + 8.5, { url });

    return h;
  }

  // ─── Cover Page ────────────────────────────────
  private drawCover(data: ReportData) {
    const { job, property } = data;

    this.sf(P.darkNavy);
    this.pdf.rect(0, 0, this.W, this.H, 'F');

    // Top bar
    this.sf(P.cyan);
    this.pdf.rect(0, 0, this.W, 5, 'F');
    this.sf(P.cyanDark);
    this.pdf.rect(0, 5, this.W, 1.5, 'F');

    // Decorative circles
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

    // Brand
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(32);
    this.pdf.text('MAISON PUR', this.W / 2, logoY, { align: 'center' });

    this.sc(P.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.text('EXCELENCIA EM GESTAO DE PROPRIEDADES', this.W / 2, logoY + 9, { align: 'center' });

    // Divider
    const divY = logoY + 18;
    this.sf(P.cyan);
    this.pdf.rect(this.W / 2 - 20, divY, 40, 0.8, 'F');

    // Report type
    this.sc(P.cyan);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text('RELATORIO DE INSPECAO E LIMPEZA', this.W / 2, divY + 14, { align: 'center' });

    // Property name
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

    // Type pill
    this.pillBadge(job.type.toUpperCase(), this.W / 2 - 16, divY + 44, P.cyan, P.darkNavy);

    // Info cards at bottom
    const cardY = this.H - 85;
    const dateStr = new Date(job.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const startTime = job.startTime ? new Date(job.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : job.time;
    const endTime = job.endTime ? new Date(job.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    this.sf(P.slate);
    this.rr(this.M + 5, cardY, this.CW - 10, 38, 5, 'F');

    const infos = [
      { label: 'DATA', value: dateStr },
      { label: 'INICIO', value: startTime },
      { label: 'TERMINO', value: endTime },
      { label: 'RESPONSAVEL', value: data.responsibleName },
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
      const val = info.value.length > 14 ? info.value.substring(0, 14) + '...' : info.value;
      this.pdf.text(val, cx, cardY + 20, { align: 'center' });
      if (i < 3) {
        this.sf(P.gray600);
        this.pdf.rect(this.M + 10 + (i + 1) * colW, cardY + 6, 0.3, 26, 'F');
      }
    });

    // Digital Dossier link on cover
    if (this.dossierUrl) {
      const linkY = cardY + 46;
      this.sf(P.cyanDark);
      this.rr(this.M + 10, linkY, this.CW - 20, 14, 3, 'F');
      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text('DOSSIE DIGITAL INTERATIVO', this.W / 2, linkY + 5.5, { align: 'center' });
      this.sc(P.cyanLight);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7);
      this.pdf.textWithLink('Acesse o relatorio completo com fotos em alta resolucao', this.W / 2 - 40, linkY + 10.5, { url: this.dossierUrl });
    }

    // Footer
    this.sc(P.gray600);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Documento gerado automaticamente pelo sistema Maison Pur', this.W / 2, this.H - 10, { align: 'center' });
  }

  // ─── Executive Summary ─────────────────────────
  private drawSummary(job: Job) {
    this.sectionTitle('RESUMO EXECUTIVO');

    const totalTasks = job.checklist.reduce((a, s) => a + s.items.length, 0);
    const completed = job.checklist.reduce((a, s) => a + s.items.filter(i => i.completed).length, 0);
    const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const dmg = job.damages?.length || 0;
    const lost = job.lostAndFound?.length || 0;
    const photos = (job.photosBefore?.length || 0) + (job.photosAfter?.length || 0);
    const dur = job.startTime && job.endTime ? Math.floor((job.endTime - job.startTime) / 60000) : 0;

    const stats = [
      { value: `${pct}%`, label: 'CONCLUSAO', color: pct === 100 ? P.emerald : P.amber },
      { value: `${completed}/${totalTasks}`, label: 'TAREFAS', color: P.cyan },
      { value: `${dmg}`, label: 'AVARIAS', color: dmg > 0 ? P.rose : P.emerald },
      { value: `${lost}`, label: 'ACHADOS', color: P.amberDark },
      { value: `${photos}`, label: 'FOTOS', color: P.teal },
      { value: dur > 0 ? `${Math.floor(dur / 60)}h${String(dur % 60).padStart(2, '0')}` : '--', label: 'DURACAO', color: P.cyanDark },
    ];

    const gap = 3;
    const sw = (this.CW - (stats.length - 1) * gap) / stats.length;
    stats.forEach((s, i) => {
      this.statBox(this.M + i * (sw + gap), this.y, sw, s.value, s.label, s.color);
    });
    this.y += 35;

    // Progress bar
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
      this.pdf.text('OBSERVACOES DO RESPONSAVEL', this.M + 12, this.y + 8);
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

    const itemH = 8;
    const headerH = 18;
    const cardH = headerH + total * itemH + 6;
    this.pageBreak(cardH + 5);

    const x = this.M;
    const y = this.y;

    this.card(x, y, this.CW, cardH, allDone ? P.emerald : P.amber);

    // Header bg
    this.sf(allDone ? P.emerald : P.amber);
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 0.08 }));
    this.pdf.rect(x, y, this.CW, headerH, 'F');
    this.pdf.setGState(new (this.pdf as any).GState({ opacity: 1 }));

    // Title
    this.sc(P.gray800);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.text(section.title.toUpperCase(), x + 12, y + 8);

    // Status
    this.pillBadge(`${done}/${total}`, x + this.CW - 30, y + 2.5, allDone ? P.emerald : P.amber);

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
        this.pdf.text('v', x + 13.5, iy + 1.5);
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
        ? item.label.substring(0, 38) + '...' : item.label;
      this.pdf.text(lbl, x + 21, iy + 1);

      // Photo indicator
      if (item.photoRequired) {
        if (item.photoUrl) {
          this.badge('FOTO OK', x + this.CW - 32, iy - 2, P.emerald);
        } else {
          this.badge('FOTO', x + this.CW - 24, iy - 2, P.gray300, P.gray600);
        }
      }

      // Completed
      if (item.completed) {
        this.sc(P.emerald);
        this.pdf.setFontSize(6);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('FEITO', x + this.CW - 14, iy + 1, { align: 'right' });
      }
    });

    this.y = y + cardH + 5;
  }

  // ─── Verification Photo Links ──────────────────
  private drawVerificationPhotoLinks(section: ChecklistSection) {
    const items = section.items.filter(i => i.photoUrl);
    if (items.length === 0) return;

    this.pageBreak(20);

    this.sc(P.gray600);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7.5);
    this.pdf.text(`FOTOS DE VERIFICACAO - ${section.title.toUpperCase()}`, this.M + 4, this.y + 4);
    this.y += 8;

    items.forEach((item) => {
      this.pageBreak(14);
      const h = this.photoLink(item.label, item.photoUrl!, this.M, this.y, this.CW);
      this.y += h + 2;
    });

    this.y += 3;
  }

  // ─── Damages Section ───────────────────────────
  private drawDamages(damages: DamageReport[]) {
    if (!damages || damages.length === 0) return;

    this.sectionTitle('REGISTRO DE AVARIAS E MANUTENCAO');

    damages.forEach((damage, idx) => {
      const hasPhoto = !!damage.photoUrl;
      const cardH = hasPhoto ? 34 : 26;
      this.pageBreak(cardH + 5);

      const x = this.M;
      const y = this.y;

      this.card(x, y, this.CW, cardH, P.rose);

      // Number
      this.sf(P.rose);
      this.pdf.circle(x + 14, y + 10, 5, 'F');
      this.sc(P.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text(`${idx + 1}`, x + 14, y + 12, { align: 'center' });

      // Severity
      const sevMap: Record<string, { label: string; color: RGB }> = {
        high: { label: 'URGENTE', color: P.rose },
        medium: { label: 'ATENCAO', color: P.amber },
        low: { label: 'BAIXA', color: P.emerald },
      };
      const sev = sevMap[damage.severity] || sevMap.medium;
      this.pillBadge(sev.label, x + this.CW - 32, y + 3, sev.color);

      // Type
      const typeMap: Record<string, string> = {
        furniture: 'MOBILIARIO', electronics: 'ELETRONICOS', stain: 'MANCHA', other: 'OUTRO',
      };
      this.badge(typeMap[damage.type] || 'OUTRO', x + this.CW - 56, y + 4, P.gray500);

      // Description
      this.sc(P.gray800);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9);
      const descLines = this.pdf.splitTextToSize(damage.description, this.CW - 28);
      this.pdf.text(descLines.slice(0, 3), x + 22, y + 20);

      this.y = y + cardH + 2;

      // Photo as link
      if (hasPhoto && damage.photoUrl) {
        this.pageBreak(14);
        const h = this.photoLink(`Avaria #${idx + 1}: ${damage.description.substring(0, 30)}`, damage.photoUrl, this.M, this.y, this.CW);
        this.y += h + 2;
      }

      this.y += 2;
    });
  }

  // ─── Lost & Found Section ─────────────────────
  private drawLostFound(items: LostAndFoundItem[]) {
    if (!items || items.length === 0) return;

    this.sectionTitle('ACHADOS E PERDIDOS');

    items.forEach((item, idx) => {
      const cardH = 24;
      this.pageBreak(cardH + 5);

      const x = this.M;
      const y = this.y;

      this.card(x, y, this.CW, cardH, P.amberDark);

      // Number
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
      this.pdf.text(`Local: ${item.location}`, x + 24, y + 18);
      this.pdf.text(`Data: ${item.date}`, x + 80, y + 18);

      this.y = y + cardH + 2;

      // Photo as link
      if (item.photoUrl) {
        this.pageBreak(14);
        const h = this.photoLink(`Achado #${idx + 1}: ${item.description.substring(0, 30)}`, item.photoUrl, this.M, this.y, this.CW);
        this.y += h + 2;
      }

      this.y += 2;
    });
  }

  // ─── Photo Gallery (as links) ─────────────────
  private drawGalleryLinks(title: string, photos: string[], accent: RGB) {
    if (!photos || photos.length === 0) return;

    this.pageBreak(20);

    // Title bar
    this.sf(accent);
    this.rr(this.M, this.y, this.CW, 11, 3, 'F');
    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text(`${title}  (${photos.length})`, this.M + 8, this.y + 7.5);
    this.y += 14;

    photos.forEach((photo, idx) => {
      this.pageBreak(14);
      const h = this.photoLink(`Foto ${idx + 1}`, photo, this.M, this.y, this.CW);
      this.y += h + 2;
    });

    this.y += 4;
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

    this.sectionTitle('INVENTARIO E SUPRIMENTOS');

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
          this.badge('! BAIXO', this.M + this.CW - 42, ry - 3.5, P.rose, P.white, 18);
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
      this.pdf.text('ALERTA: REPOSICAO NECESSARIA', this.M + 12, this.y + 9);

      lowStock.forEach((item, i) => {
        const u = used.find(x => x.itemId === item.id);
        const rem = item.quantity - (u?.quantityUsed || 0);
        this.sc(P.gray700);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(8);
        this.pdf.text(`- ${item.name} -- Estoque: ${rem} ${item.unit} (Min: ${item.threshold})`, this.M + 12, this.y + 17 + i * 7);
      });

      this.y += alertH + 5;
    }
  }

  // ─── Dossier Link Banner ──────────────────────
  private drawDossierBanner() {
    if (!this.dossierUrl) return;

    this.pageBreak(24);

    this.sf(P.cyanDark);
    this.rr(this.M, this.y, this.CW, 20, 4, 'F');

    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.text('DOSSIE DIGITAL INTERATIVO', this.W / 2, this.y + 7, { align: 'center' });

    this.sc(P.cyanLight);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7.5);
    this.pdf.textWithLink(
      'Clique aqui para acessar o relatorio interativo com fotos em alta resolucao',
      this.W / 2 - 52,
      this.y + 14,
      { url: this.dossierUrl }
    );

    this.y += 24;
  }

  // ─── Footer ────────────────────────────────────
  private drawFooter(pageNum: number, totalPages: number) {
    const fy = this.H - 22;
    this.sf(P.navy);
    this.pdf.rect(0, fy, this.W, 22, 'F');
    this.sf(P.cyan);
    this.pdf.rect(0, fy, this.W, 1, 'F');

    if (this.logoLoaded && this.logoDataUrl) {
      try { this.pdf.addImage(this.logoDataUrl, 'PNG', this.M, fy + 5, 10, 10); } catch {}
    }

    this.sc(P.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text('MAISON PUR', this.M + 14, fy + 10);
    this.sc(P.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(5.5);
    this.pdf.text('Excelencia em Gestao de Propriedades', this.M + 14, fy + 14);

    // Verified badge
    this.pillBadge('VERIFICADO', this.W / 2 - 14, fy + 6, P.emerald);

    // Page number
    this.sc(P.gray400);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${pageNum} / ${totalPages}`, this.W - this.M, fy + 10, { align: 'right' });

    // Dossier link in footer
    if (this.dossierUrl) {
      this.sc(P.cyanLight);
      this.pdf.setFontSize(5.5);
      this.pdf.textWithLink('Relatorio interativo: ' + this.dossierUrl, this.W / 2, fy + 18, { align: 'center', url: this.dossierUrl });
    } else {
      // Signature line
      this.sd(P.gray500);
      this.pdf.setLineWidth(0.3);
      const sigX = this.W - this.M - 45;
      this.pdf.line(sigX, fy + 14, sigX + 40, fy + 14);
      this.sc(P.gray500);
      this.pdf.setFontSize(5.5);
      this.pdf.text('ASSINATURA DO RESPONSAVEL', sigX + 20, fy + 18, { align: 'center' });
    }
  }

  // ─── Generate ──────────────────────────────────
  public async generate(data: ReportData): Promise<Blob> {
    await this.loadLogo();

    // Build dossier URL from publicToken
    if (data.publicToken) {
      const baseUrl = window.location.origin;
      this.dossierUrl = `${baseUrl}/r/${data.publicToken}`;
    }

    const { job, inventory, lostAndFound } = data;

    // Page 1: Cover
    this.drawCover(data);

    // Page 2+: Content
    this.pdf.addPage();
    this.y = 18;
    this.drawPageHeader();

    // Executive summary
    this.drawSummary(job);

    // Checklist sections
    this.sectionTitle('CHECKLIST DE INSPECAO');
    job.checklist.forEach(section => {
      this.drawChecklist(section);
      this.drawVerificationPhotoLinks(section);
    });

    // Damages
    this.drawDamages(job.damages || []);

    // Lost & Found
    this.drawLostFound(lostAndFound || job.lostAndFound || []);

    // Photo galleries as links
    this.drawGalleryLinks('FOTOS ANTES DA LIMPEZA', job.photosBefore, P.gray600);
    this.drawGalleryLinks('FOTOS APOS A LIMPEZA', job.photosAfter, P.cyan);

    // Inventory
    this.drawInventory(inventory, job.inventoryUsed || []);

    // Dossier link banner at the end
    this.drawDossierBanner();

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
