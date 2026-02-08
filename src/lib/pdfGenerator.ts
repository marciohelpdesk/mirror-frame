import jsPDF from 'jspdf';
import { Job, Property, InventoryItem, DamageReport, ChecklistSection } from '@/types';
import purLogo from '@/assets/pur-logo.png';

export interface ReportData {
  job: Job;
  property?: Property;
  inventory: InventoryItem[];
  responsibleName: string;
  lostAndFound?: LostAndFoundItem[];
  laundryExpedition?: LaundryItem[];
}

export interface LostAndFoundItem {
  id: string;
  description: string;
  location: string;
  photoUrl?: string;
  date: string;
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

// Premium color palette
const C = {
  navy: [15, 23, 42] as RGB,        // Primary dark
  slate: [30, 41, 59] as RGB,
  cyan: [6, 182, 212] as RGB,        // Brand accent
  teal: [20, 184, 166] as RGB,
  emerald: [16, 185, 129] as RGB,
  amber: [245, 158, 11] as RGB,
  rose: [244, 63, 94] as RGB,
  white: [255, 255, 255] as RGB,
  gray50: [248, 250, 252] as RGB,
  gray100: [241, 245, 249] as RGB,
  gray200: [226, 232, 240] as RGB,
  gray400: [148, 163, 184] as RGB,
  gray500: [100, 116, 139] as RGB,
  gray700: [51, 65, 85] as RGB,
  gray900: [15, 23, 42] as RGB,
};

type RGB = [number, number, number];

class PremiumReportGenerator {
  private pdf: jsPDF;
  private W: number;
  private H: number;
  private M = 14; // margin
  private y = 0;
  private CW: number; // content width
  private logoDataUrl = '';
  private logoLoaded = false;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.W = this.pdf.internal.pageSize.getWidth();
    this.H = this.pdf.internal.pageSize.getHeight();
    this.CW = this.W - this.M * 2;
  }

  // ─── Helpers ──────────────────────────────────
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

  private pageBreak(need: number) {
    if (this.y + need > this.H - 25) {
      this.pdf.addPage();
      this.y = this.M;
      this.drawPageAccent();
    }
  }

  private drawPageAccent() {
    // Subtle side accent on every page
    this.pdf.setFillColor(...C.cyan);
    this.pdf.rect(0, 0, 3, this.H, 'F');
  }

  private setColor(c: RGB) { this.pdf.setTextColor(c[0], c[1], c[2]); }
  private setFill(c: RGB) { this.pdf.setFillColor(c[0], c[1], c[2]); }
  private setDraw(c: RGB) { this.pdf.setDrawColor(c[0], c[1], c[2]); }

  private addImg(data: string, x: number, y: number, w: number, h: number): boolean {
    try {
      if (!data || !data.startsWith('data:image')) return false;
      const fmt = data.includes('data:image/png') ? 'PNG' : 'JPEG';
      this.pdf.addImage(data, fmt, x, y, w, h);
      return true;
    } catch { return false; }
  }

  private text(str: string, x: number, y: number, opts?: any) {
    this.pdf.text(str, x, y, opts);
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number, style: string) {
    this.pdf.roundedRect(x, y, w, h, r, r, style);
  }

  private badge(label: string, x: number, y: number, bg: RGB, fg: RGB = C.white, w?: number) {
    const bw = w || this.pdf.getTextWidth(label) + 6;
    this.setFill(bg);
    this.roundRect(x, y, bw, 7, 2, 'F');
    this.setColor(fg);
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.text(label, x + bw / 2, y + 5, { align: 'center' });
  }

  // ─── Cover Page ───────────────────────────────
  private drawCoverPage(data: ReportData) {
    const { job, property } = data;

    // Full navy background
    this.setFill(C.navy);
    this.pdf.rect(0, 0, this.W, this.H, 'F');

    // Gradient accent strip at top
    this.setFill(C.cyan);
    this.pdf.rect(0, 0, this.W, 4, 'F');
    this.setFill(C.teal);
    this.pdf.rect(0, 4, this.W, 2, 'F');

    // Logo
    const logoY = 35;
    if (this.logoLoaded && this.logoDataUrl) {
      try { this.pdf.addImage(this.logoDataUrl, 'PNG', this.W / 2 - 15, logoY, 30, 30); } catch {}
    }

    // Brand
    this.setColor(C.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(28);
    this.text('MAISON PUR', this.W / 2, logoY + 42, { align: 'center' });

    this.pdf.setFontSize(9);
    this.setColor(C.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.text('EXCELÊNCIA EM GESTÃO DE PROPRIEDADES', this.W / 2, logoY + 50, { align: 'center' });

    // Decorative line
    this.setDraw(C.cyan);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(this.W / 2 - 30, logoY + 55, this.W / 2 + 30, logoY + 55);

    // Report type
    const typeY = logoY + 70;
    this.setColor(C.cyan);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.text('RELATÓRIO DE INSPEÇÃO E LIMPEZA', this.W / 2, typeY, { align: 'center' });

    // Property name - hero
    const propName = (property?.name || job.clientName).toUpperCase();
    this.setColor(C.white);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.text(propName, this.W / 2, typeY + 20, { align: 'center' });

    // Address
    this.setColor(C.gray400);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.text(property?.address || job.address, this.W / 2, typeY + 28, { align: 'center' });

    // Info cards at bottom
    const cardY = this.H - 90;
    const cardW = (this.CW - 12) / 4;
    const dateStr = new Date(job.date).toLocaleDateString('pt-BR');
    const startTime = job.startTime ? new Date(job.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : job.time;
    const endTime = job.endTime ? new Date(job.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const infos = [
      { label: 'DATA', value: dateStr },
      { label: 'INÍCIO', value: startTime },
      { label: 'TÉRMINO', value: endTime },
      { label: 'RESPONSÁVEL', value: data.responsibleName },
    ];

    infos.forEach((info, i) => {
      const x = this.M + i * (cardW + 4);
      this.setFill(C.slate);
      this.roundRect(x, cardY, cardW, 28, 3, 'F');

      this.setColor(C.gray400);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7);
      this.text(info.label, x + cardW / 2, cardY + 10, { align: 'center' });

      this.setColor(C.white);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      const val = info.value.length > 12 ? info.value.substring(0, 12) + '…' : info.value;
      this.text(val, x + cardW / 2, cardY + 20, { align: 'center' });
    });

    // Job type badge
    this.badge(job.type.toUpperCase(), this.W / 2 - 18, cardY + 35, C.cyan, C.navy, 36);

    // Footer text
    this.setColor(C.gray500);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.text('Documento gerado automaticamente pelo sistema Maison Pur', this.W / 2, this.H - 12, { align: 'center' });
  }

  // ─── Executive Summary ────────────────────────
  private drawExecutiveSummary(job: Job) {
    this.pageBreak(70);

    // Section title
    this.drawSectionTitle('RESUMO EXECUTIVO');

    const totalTasks = job.checklist.reduce((a, s) => a + s.items.length, 0);
    const completed = job.checklist.reduce((a, s) => a + s.items.filter(i => i.completed).length, 0);
    const completion = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const damageCount = job.damages?.length || 0;
    const lostCount = job.lostAndFound?.length || 0;
    const photoCount = (job.photosBefore?.length || 0) + (job.photosAfter?.length || 0);
    const duration = job.startTime && job.endTime ? Math.floor((job.endTime - job.startTime) / 60000) : 0;

    // Main stats row
    const stats = [
      { value: `${completion}%`, label: 'CONCLUSÃO', color: completion === 100 ? C.emerald : C.amber, big: true },
      { value: `${completed}/${totalTasks}`, label: 'TAREFAS', color: C.cyan },
      { value: `${damageCount}`, label: 'AVARIAS', color: damageCount > 0 ? C.rose : C.emerald },
      { value: `${lostCount}`, label: 'ACHADOS', color: C.amber },
      { value: `${photoCount}`, label: 'FOTOS', color: C.cyan },
      { value: duration > 0 ? `${Math.floor(duration / 60)}h${String(duration % 60).padStart(2, '0')}` : '--', label: 'DURAÇÃO', color: C.teal },
    ];

    const statW = (this.CW - (stats.length - 1) * 3) / stats.length;
    stats.forEach((s, i) => {
      const x = this.M + i * (statW + 3);
      this.setFill(C.gray50);
      this.setDraw(C.gray200);
      this.pdf.setLineWidth(0.3);
      this.roundRect(x, this.y, statW, 26, 3, 'FD');

      // Color accent top
      this.setFill(s.color);
      this.pdf.rect(x + 1, this.y, statW - 2, 2, 'F');

      this.setColor(s.color);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(s.big ? 18 : 15);
      this.text(s.value, x + statW / 2, this.y + 14, { align: 'center' });

      this.setColor(C.gray500);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(6);
      this.text(s.label, x + statW / 2, this.y + 21, { align: 'center' });
    });

    this.y += 32;

    // Completion bar
    this.setFill(C.gray200);
    this.roundRect(this.M, this.y, this.CW, 5, 2, 'F');
    if (completion > 0) {
      this.setFill(completion === 100 ? C.emerald : C.cyan);
      this.roundRect(this.M, this.y, this.CW * (completion / 100), 5, 2, 'F');
    }
    this.y += 10;

    // Notes if present
    if (job.reportNote) {
      this.pageBreak(25);
      this.setFill(C.gray50);
      this.setDraw(C.cyan);
      this.pdf.setLineWidth(0.5);
      const noteLines = this.pdf.splitTextToSize(job.reportNote, this.CW - 16);
      const noteH = 12 + noteLines.length * 4.5;
      this.roundRect(this.M, this.y, this.CW, noteH, 3, 'FD');

      // Accent left bar
      this.setFill(C.cyan);
      this.pdf.rect(this.M, this.y, 3, noteH, 'F');

      this.setColor(C.gray500);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7);
      this.text('OBSERVAÇÕES DO RESPONSÁVEL', this.M + 10, this.y + 7);

      this.setColor(C.gray700);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.text(noteLines, this.M + 10, this.y + 14);

      this.y += noteH + 6;
    }
  }

  // ─── Section Title ─────────────────────────────
  private drawSectionTitle(title: string) {
    this.pageBreak(15);
    this.setColor(C.navy);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(13);
    this.text(title, this.M, this.y + 5);

    // Underline
    this.setFill(C.cyan);
    this.pdf.rect(this.M, this.y + 8, 25, 1.5, 'F');
    this.setFill(C.gray200);
    this.pdf.rect(this.M + 25, this.y + 8, this.CW - 25, 0.5, 'F');

    this.y += 14;
  }

  // ─── Checklist Section Cards ──────────────────
  private drawChecklistSection(section: ChecklistSection) {
    const totalItems = section.items.length;
    const completedItems = section.items.filter(i => i.completed).length;
    const allDone = completedItems === totalItems;

    // Calculate height
    const rows = Math.ceil(totalItems / 2);
    const cardH = 22 + rows * 9;
    this.pageBreak(cardH + 5);

    const x = this.M;
    const y = this.y;

    // Card
    this.setFill(C.white);
    this.setDraw(allDone ? C.emerald : C.gray200);
    this.pdf.setLineWidth(allDone ? 0.6 : 0.3);
    this.roundRect(x, y, this.CW, cardH, 3, 'FD');

    // Status indicator left bar
    this.setFill(allDone ? C.emerald : C.amber);
    this.pdf.rect(x, y + 2, 3, cardH - 4, 'F');

    // Title
    this.setColor(C.navy);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.text(section.title, x + 10, y + 10);

    // Counter badge
    const badgeBg = allDone ? C.emerald : C.amber;
    this.badge(`${completedItems}/${totalItems}`, x + this.CW - 28, y + 4, badgeBg);

    // Progress mini-bar
    const barX = x + 10;
    const barY = y + 14;
    const barW = this.CW - 20;
    this.setFill(C.gray200);
    this.roundRect(barX, barY, barW, 2, 1, 'F');
    if (completedItems > 0) {
      this.setFill(allDone ? C.emerald : C.cyan);
      this.roundRect(barX, barY, barW * (completedItems / totalItems), 2, 1, 'F');
    }

    // Items in 2 columns
    const colW = (this.CW - 24) / 2;
    section.items.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ix = x + 10 + col * (colW + 4);
      const iy = y + 22 + row * 9;

      // Checkbox
      if (item.completed) {
        this.setFill(C.emerald);
        this.roundRect(ix, iy - 3, 4, 4, 1, 'F');
        this.setColor(C.white);
        this.pdf.setFontSize(7);
        this.text('✓', ix + 0.7, iy + 0.5);
      } else {
        this.setDraw(C.gray400);
        this.pdf.setLineWidth(0.4);
        this.roundRect(ix, iy - 3, 4, 4, 1, 'S');
      }

      // Label
      this.pdf.setFont('helvetica', item.completed ? 'normal' : 'normal');
      this.pdf.setFontSize(8);
      this.setColor(item.completed ? C.gray700 : C.gray500);
      const lbl = item.label.length > 32 ? item.label.substring(0, 30) + '…' : item.label;
      this.text(lbl, ix + 7, iy);

      // Photo indicator
      if (item.photoRequired) {
        this.pdf.setFontSize(6);
        this.setColor(item.photoUrl ? C.cyan : C.gray400);
        this.text('📷', ix + colW - 4, iy);
      }
    });

    this.y = y + cardH + 4;
  }

  // ─── Checklist Verification Photos ────────────
  private drawVerificationPhotos(section: ChecklistSection) {
    const items = section.items.filter(i => i.photoUrl);
    if (items.length === 0) return;

    this.pageBreak(35);

    this.setFill(C.gray50);
    const photoW = 28;
    const photoH = 22;
    const gap = 3;
    const perRow = Math.floor((this.CW - 10) / (photoW + gap));
    const rows = Math.ceil(items.length / perRow);
    const blockH = 14 + rows * (photoH + 12);

    this.roundRect(this.M, this.y, this.CW, blockH, 3, 'F');

    this.setColor(C.gray500);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.text(`FOTOS DE VERIFICAÇÃO — ${section.title.toUpperCase()}`, this.M + 6, this.y + 8);

    items.forEach((item, idx) => {
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);
      const px = this.M + 6 + col * (photoW + gap);
      const py = this.y + 12 + row * (photoH + 12);

      this.setDraw(C.cyan);
      this.pdf.setLineWidth(0.5);
      this.roundRect(px, py, photoW, photoH, 2, 'S');

      if (item.photoUrl) {
        this.addImg(item.photoUrl, px + 0.5, py + 0.5, photoW - 1, photoH - 1);
      }

      this.setColor(C.gray700);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(5.5);
      const lbl = item.label.length > 18 ? item.label.substring(0, 16) + '…' : item.label;
      this.text(lbl, px + photoW / 2, py + photoH + 4, { align: 'center' });
    });

    this.y += blockH + 5;
  }

  // ─── Damages Section ──────────────────────────
  private drawDamagesSection(damages: DamageReport[]) {
    if (!damages || damages.length === 0) return;

    this.drawSectionTitle('REGISTRO DE AVARIAS E MANUTENÇÃO');

    damages.forEach((damage, idx) => {
      this.pageBreak(40);

      const x = this.M;
      const y = this.y;
      const hasPhoto = !!damage.photoUrl;
      const cardH = hasPhoto ? 38 : 22;

      // Card with rose left accent
      this.setFill(C.white);
      this.setDraw(C.gray200);
      this.pdf.setLineWidth(0.3);
      this.roundRect(x, y, this.CW, cardH, 3, 'FD');
      this.setFill(C.rose);
      this.pdf.rect(x, y + 2, 3, cardH - 4, 'F');

      // Severity badge
      const sevMap: Record<string, { label: string; color: RGB }> = {
        high: { label: 'URGENTE', color: C.rose },
        medium: { label: 'ATENÇÃO', color: C.amber },
        low: { label: 'BAIXA', color: C.emerald },
      };
      const sev = sevMap[damage.severity] || sevMap.medium;
      this.badge(sev.label, x + this.CW - 28, y + 3, sev.color);

      // Type badge
      const typeMap: Record<string, string> = {
        furniture: 'MOBILIÁRIO',
        electronics: 'ELETRÔNICOS',
        stain: 'MANCHA',
        other: 'OUTRO',
      };
      this.badge(typeMap[damage.type] || 'OUTRO', x + this.CW - 52, y + 3, C.gray500);

      // Number
      this.setColor(C.rose);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(14);
      this.text(`#${idx + 1}`, x + 10, y + 11);

      // Description
      this.setColor(C.gray700);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      const descLines = this.pdf.splitTextToSize(damage.description, hasPhoto ? this.CW - 55 : this.CW - 20);
      this.text(descLines.slice(0, 2), x + 10, y + 18);

      // Photo
      if (hasPhoto && damage.photoUrl) {
        const photoX = x + this.CW - 40;
        const photoY = y + 13;
        this.setDraw(C.rose);
        this.pdf.setLineWidth(0.5);
        this.roundRect(photoX, photoY, 30, 22, 2, 'S');
        this.addImg(damage.photoUrl, photoX + 0.5, photoY + 0.5, 29, 21);
      }

      this.y = y + cardH + 4;
    });
  }

  // ─── Lost & Found Section ─────────────────────
  private drawLostAndFoundSection(items: LostAndFoundItem[]) {
    if (!items || items.length === 0) return;

    this.drawSectionTitle('ACHADOS E PERDIDOS');

    items.forEach((item, idx) => {
      this.pageBreak(35);

      const x = this.M;
      const y = this.y;
      const hasPhoto = !!item.photoUrl;
      const cardH = hasPhoto ? 35 : 22;

      this.setFill(C.white);
      this.setDraw(C.gray200);
      this.pdf.setLineWidth(0.3);
      this.roundRect(x, y, this.CW, cardH, 3, 'FD');
      this.setFill(C.amber);
      this.pdf.rect(x, y + 2, 3, cardH - 4, 'F');

      // Number
      this.setColor(C.amber);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(14);
      this.text(`#${idx + 1}`, x + 10, y + 11);

      // Description
      this.setColor(C.gray700);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9);
      this.text(item.description, x + 28, y + 10);

      // Location & Date
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.setColor(C.gray500);
      this.text(`📍 ${item.location}`, x + 28, y + 17);
      this.text(`📅 ${item.date}`, x + 28, y + 23);

      // Photo
      if (hasPhoto && item.photoUrl) {
        const photoX = x + this.CW - 35;
        const photoY = y + 5;
        this.setDraw(C.amber);
        this.pdf.setLineWidth(0.5);
        this.roundRect(photoX, photoY, 26, 22, 2, 'S');
        this.addImg(item.photoUrl, photoX + 0.5, photoY + 0.5, 25, 21);
      }

      this.y = y + cardH + 4;
    });
  }

  // ─── Photo Gallery ────────────────────────────
  private drawPhotoGallery(title: string, photos: string[], accentColor: RGB) {
    if (!photos || photos.length === 0) return;

    this.pageBreak(50);

    const photoW = 32;
    const photoH = 25;
    const gap = 4;
    const perRow = Math.floor((this.CW - 8) / (photoW + gap));
    const rows = Math.ceil(Math.min(photos.length, 12) / perRow);
    const blockH = 16 + rows * (photoH + gap);

    this.setFill(C.white);
    this.setDraw(accentColor);
    this.pdf.setLineWidth(0.5);
    this.roundRect(this.M, this.y, this.CW, blockH, 3, 'FD');

    // Title bar
    this.setFill(accentColor);
    this.roundRect(this.M, this.y, this.CW, 10, 3, 'F');
    // Fix bottom corners
    this.pdf.rect(this.M, this.y + 7, this.CW, 3, 'F');

    this.setColor(C.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.text(`${title}  (${photos.length})`, this.M + 8, this.y + 7);

    photos.slice(0, 12).forEach((photo, idx) => {
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);
      const px = this.M + 4 + col * (photoW + gap);
      const py = this.y + 13 + row * (photoH + gap);

      this.setDraw(C.gray200);
      this.pdf.setLineWidth(0.3);
      this.roundRect(px, py, photoW, photoH, 2, 'S');
      this.addImg(photo, px + 0.5, py + 0.5, photoW - 1, photoH - 1);
    });

    this.y += blockH + 6;
  }

  // ─── Inventory Section ────────────────────────
  private drawInventorySection(inventory: InventoryItem[], used: { itemId: string; quantityUsed: number }[]) {
    if (!inventory || inventory.length === 0) return;

    const usedItems = used.filter(u => u.quantityUsed > 0);
    const lowStock = inventory.filter(item => {
      const usage = used.find(u => u.itemId === item.id);
      const remaining = item.quantity - (usage?.quantityUsed || 0);
      return remaining <= item.threshold;
    });

    if (usedItems.length === 0 && lowStock.length === 0) return;

    this.drawSectionTitle('INVENTÁRIO E SUPRIMENTOS');

    // Used items table
    if (usedItems.length > 0) {
      this.pageBreak(20 + usedItems.length * 8);

      const x = this.M;
      const y = this.y;
      const rowH = 7;
      const tableH = 12 + usedItems.length * rowH;

      this.setFill(C.white);
      this.setDraw(C.gray200);
      this.pdf.setLineWidth(0.3);
      this.roundRect(x, y, this.CW, tableH, 3, 'FD');

      // Header
      this.setFill(C.navy);
      this.roundRect(x, y, this.CW, 10, 3, 'F');
      this.pdf.rect(x, y + 7, this.CW, 3, 'F');

      this.setColor(C.white);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7);
      this.text('PRODUTO', x + 8, y + 7);
      this.text('QTDE USADA', x + this.CW / 2, y + 7, { align: 'center' });
      this.text('ESTOQUE', x + this.CW - 8, y + 7, { align: 'right' });

      usedItems.forEach((u, idx) => {
        const item = inventory.find(i => i.id === u.itemId);
        if (!item) return;
        const ry = y + 14 + idx * rowH;
        const remaining = item.quantity - u.quantityUsed;
        const isLow = remaining <= item.threshold;

        if (idx % 2 === 0) {
          this.setFill(C.gray50);
          this.pdf.rect(x + 1, ry - 4, this.CW - 2, rowH, 'F');
        }

        this.setColor(C.gray700);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(8);
        this.text(item.name, x + 8, ry);
        this.text(`${u.quantityUsed} ${item.unit}`, x + this.CW / 2, ry, { align: 'center' });

        this.setColor(isLow ? C.rose : C.gray700);
        this.pdf.setFont('helvetica', isLow ? 'bold' : 'normal');
        this.text(`${remaining} ${item.unit}`, x + this.CW - 8, ry, { align: 'right' });

        if (isLow) {
          this.badge('BAIXO', x + this.CW - 38, ry - 4, C.rose, C.white, 16);
        }
      });

      this.y = y + tableH + 5;
    }

    // Low stock alerts
    if (lowStock.length > 0) {
      this.pageBreak(20);
      const alertH = 12 + lowStock.length * 7;
      this.setFill(C.white);
      this.setDraw(C.rose);
      this.pdf.setLineWidth(0.5);
      this.roundRect(this.M, this.y, this.CW, alertH, 3, 'FD');
      this.setFill(C.rose);
      this.pdf.rect(this.M, this.y + 2, 3, alertH - 4, 'F');

      this.setColor(C.rose);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.text('⚠ ALERTA: REPOSIÇÃO NECESSÁRIA', this.M + 10, this.y + 8);

      lowStock.forEach((item, i) => {
        const usage = used.find(u => u.itemId === item.id);
        const remaining = item.quantity - (usage?.quantityUsed || 0);
        this.setColor(C.gray700);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(8);
        this.text(`• ${item.name} — Estoque: ${remaining} ${item.unit} (Mín: ${item.threshold})`, this.M + 10, this.y + 15 + i * 7);
      });

      this.y += alertH + 5;
    }
  }

  // ─── Footer ───────────────────────────────────
  private drawFooter() {
    const footerH = 28;
    const fy = this.H - footerH;

    // Background
    this.setFill(C.navy);
    this.pdf.rect(0, fy, this.W, footerH, 'F');
    this.setFill(C.cyan);
    this.pdf.rect(0, fy, this.W, 1.5, 'F');

    // Logo mini
    if (this.logoLoaded && this.logoDataUrl) {
      try { this.pdf.addImage(this.logoDataUrl, 'PNG', this.M, fy + 6, 12, 12); } catch {}
    }

    // Brand
    this.setColor(C.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.text('MAISON PUR', this.M + 16, fy + 12);

    this.setColor(C.gray400);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6);
    this.text('Excelência em Gestão de Propriedades', this.M + 16, fy + 17);

    // Verified badge
    this.badge('✓ VERIFICADO', this.W / 2 - 14, fy + 8, C.emerald, C.white, 28);

    // Signature area
    const sigX = this.W - this.M - 50;
    this.setDraw(C.gray400);
    this.pdf.setLineWidth(0.4);
    this.pdf.line(sigX, fy + 14, sigX + 45, fy + 14);
    this.setColor(C.gray400);
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    this.text('ASSINATURA DO RESPONSÁVEL', sigX + 22.5, fy + 19, { align: 'center' });
  }

  // ─── Main Generate ────────────────────────────
  public async generate(data: ReportData): Promise<Blob> {
    await this.loadLogo();

    const { job, inventory, lostAndFound } = data;

    // Page 1: Cover
    this.drawCoverPage(data);

    // Page 2+: Content
    this.pdf.addPage();
    this.y = this.M;
    this.drawPageAccent();

    // Executive summary
    this.drawExecutiveSummary(job);

    // Checklist sections
    this.drawSectionTitle('CHECKLIST DE INSPEÇÃO');
    job.checklist.forEach(section => {
      this.drawChecklistSection(section);
      this.drawVerificationPhotos(section);
    });

    // Damages
    this.drawDamagesSection(job.damages || []);

    // Lost & Found
    this.drawLostAndFoundSection(lostAndFound || job.lostAndFound || []);

    // Photo galleries
    this.drawPhotoGallery('📷 FOTOS ANTES DA LIMPEZA', job.photosBefore, C.gray500);
    this.drawPhotoGallery('✨ FOTOS APÓS A LIMPEZA', job.photosAfter, C.cyan);

    // Inventory
    this.drawInventorySection(inventory, job.inventoryUsed || []);

    // Footer on all pages
    const totalPages = this.pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      if (i > 1) this.drawFooter();

      // Page number
      this.pdf.setFontSize(7);
      this.setColor(C.gray400);
      this.pdf.setFont('helvetica', 'normal');
      this.text(`${i} / ${totalPages}`, this.W / 2, this.H - 4, { align: 'center' });
    }

    return this.pdf.output('blob');
  }
}

export const generateCleaningReport = async (data: ReportData): Promise<Blob> => {
  const generator = new PremiumReportGenerator();
  return await generator.generate(data);
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
