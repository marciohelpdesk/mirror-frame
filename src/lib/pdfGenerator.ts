import jsPDF from 'jspdf';
import { Job, Property, InventoryItem, DamageReport, ChecklistSection } from '@/types';

interface ReportData {
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

// Design tokens from the template
const COLORS = {
  primary: [0, 150, 136] as [number, number, number],
  accent: [38, 166, 154] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  dark: [33, 33, 33] as [number, number, number],
  text: [66, 66, 66] as [number, number, number],
  muted: [117, 117, 117] as [number, number, number],
  lightGray: [245, 245, 245] as [number, number, number],
  cardBg: [250, 250, 250] as [number, number, number],
  success: [76, 175, 80] as [number, number, number],
  warning: [255, 152, 0] as [number, number, number],
  danger: [244, 67, 54] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const FONTS = {
  title: 'times',
  body: 'helvetica',
};

class ProfessionalReportGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private yPos: number = 20;
  private contentWidth: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  private checkPageBreak(neededSpace: number): void {
    if (this.yPos + neededSpace > this.pageHeight - 30) {
      this.pdf.addPage();
      this.yPos = this.margin;
    }
  }

  private addImageSafely(imageData: string, x: number, y: number, width: number, height: number): boolean {
    try {
      if (!imageData || !imageData.startsWith('data:image')) {
        return false;
      }
      
      // Determine format from data URL
      let format = 'JPEG';
      if (imageData.includes('data:image/png')) {
        format = 'PNG';
      } else if (imageData.includes('data:image/webp')) {
        format = 'WEBP';
      }
      
      this.pdf.addImage(imageData, format, x, y, width, height);
      return true;
    } catch (error) {
      console.warn('Failed to add image to PDF:', error);
      return false;
    }
  }

  private drawLogo(): void {
    const centerX = this.pageWidth / 2;
    const logoY = 15;
    
    // Draw stylized gold drop
    this.pdf.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    this.pdf.circle(centerX, logoY + 8, 6, 'F');
    
    // Top point
    this.pdf.setFillColor(COLORS.gold[0] - 30, COLORS.gold[1] - 30, COLORS.gold[2] - 10);
    this.pdf.triangle(centerX, logoY - 2, centerX - 5, logoY + 6, centerX + 5, logoY + 6, 'F');
    
    // Highlight
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.circle(centerX - 1.5, logoY + 5, 1.2, 'F');
    
    // Green accent at bottom
    this.pdf.setFillColor(0, 100, 50);
    this.pdf.ellipse(centerX, logoY + 14, 3, 1.5, 'F');
  }

  private drawHeader(propertyName: string, date: string, startTime: string, endTime: string, auditorName: string): void {
    this.drawLogo();
    
    // Property name
    this.pdf.setFont(FONTS.title, 'normal');
    this.pdf.setFontSize(28);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text(propertyName, this.pageWidth / 2, 45, { align: 'center' });
    
    // Subtitle
    this.pdf.setFont(FONTS.body, 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    const subtitle = 'R E L A T Ó R I O   D E   I N S P E Ç Ã O  •  G U E S T   R E A D Y';
    this.pdf.text(subtitle, this.pageWidth / 2, 53, { align: 'center' });
    
    // Meta info line
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const metaLine = `DATA: ${date}     •     HORÁRIO: ${startTime} - ${endTime}     •     AUDITOR: ${auditorName}`;
    this.pdf.text(metaLine, this.pageWidth / 2, 62, { align: 'center' });
    
    // Decorative line
    this.pdf.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, 67, this.pageWidth - this.margin, 67);
    
    this.yPos = 75;
  }

  private drawSectionCard(
    section: ChecklistSection, 
    beforePhoto?: string, 
    afterPhoto?: string, 
    sectionDamages: DamageReport[] = []
  ): void {
    const cardPadding = 8;
    const totalItems = section.items.length;
    const completedItems = section.items.filter(i => i.completed).length;
    
    // Calculate card height
    const itemRows = Math.ceil(section.items.length / 2);
    const hasPhotos = beforePhoto || afterPhoto;
    const hasDamages = sectionDamages.length > 0;
    
    let cardHeight = 20 + (itemRows * 8);
    if (hasPhotos) cardHeight += 50;
    if (hasDamages) cardHeight += 35 + (sectionDamages.length > 1 ? (sectionDamages.length - 1) * 15 : 0);
    
    this.checkPageBreak(cardHeight);
    
    const cardX = this.margin;
    const cardY = this.yPos;
    const cardWidth = this.contentWidth;
    
    // Card background
    this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.setLineWidth(0.3);
    this.pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, 'FD');
    
    // Section title
    this.pdf.setFont(FONTS.title, 'normal');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text(section.title, cardX + cardPadding, cardY + 10);
    
    // Task counter
    this.pdf.setFont(FONTS.body, 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    this.pdf.text(`${completedItems}/${totalItems} TAREFAS`, cardX + cardWidth - cardPadding, cardY + 10, { align: 'right' });
    
    // Separator line
    this.pdf.setDrawColor(240, 240, 240);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(cardX + cardPadding, cardY + 14, cardX + cardWidth - cardPadding, cardY + 14);
    
    // Items in 2 columns
    let itemY = cardY + 22;
    const colWidth = (cardWidth - (cardPadding * 3)) / 2;
    
    section.items.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const itemX = cardX + cardPadding + (col * (colWidth + cardPadding));
      const currentItemY = itemY + (row * 8);
      
      // Checkbox
      this.pdf.setFillColor(item.completed ? COLORS.primary[0] : 255, item.completed ? COLORS.primary[1] : 255, item.completed ? COLORS.primary[2] : 255);
      this.pdf.setDrawColor(item.completed ? COLORS.primary[0] : 200, item.completed ? COLORS.primary[1] : 200, item.completed ? COLORS.primary[2] : 200);
      this.pdf.roundedRect(itemX, currentItemY - 3, 4, 4, 0.5, 0.5, 'FD');
      
      if (item.completed) {
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFontSize(8);
        this.pdf.text('✓', itemX + 0.8, currentItemY + 0.5);
      }
      
      // Item label
      this.pdf.setFont(FONTS.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      const truncatedLabel = item.label.length > 28 ? item.label.substring(0, 26) + '...' : item.label;
      this.pdf.text(truncatedLabel, itemX + 7, currentItemY);
    });
    
    let currentY = itemY + (itemRows * 8) + 5;
    
    // Visual Audit Section (Photos)
    if (hasPhotos) {
      this.pdf.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
      this.pdf.roundedRect(cardX + cardPadding, currentY, cardWidth - (cardPadding * 2), 45, 2, 2, 'F');
      
      // Section label
      this.pdf.setFont(FONTS.body, 'bold');
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      this.pdf.text('AUDITORIA VISUAL', cardX + cardPadding + 5, currentY + 6);
      
      const photoWidth = 35;
      const photoHeight = 30;
      const photoY = currentY + 10;
      
      // Before photo (PADRÃO)
      const beforeX = cardX + cardPadding + 5;
      this.pdf.setDrawColor(220, 220, 220);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(beforeX, photoY, photoWidth, photoHeight, 2, 2, 'S');
      
      // Try to add actual before photo
      if (beforePhoto) {
        this.addImageSafely(beforePhoto, beforeX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 7);
      } else {
        // Placeholder
        this.pdf.setFillColor(240, 240, 240);
        this.pdf.roundedRect(beforeX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 7, 1, 1, 'F');
      }
      
      // PADRÃO label
      this.pdf.setFillColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      this.pdf.roundedRect(beforeX, photoY + photoHeight - 6, photoWidth, 6, 0, 0, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(6);
      this.pdf.text('PADRÃO', beforeX + photoWidth / 2, photoY + photoHeight - 1.5, { align: 'center' });
      
      // After photo (REALIZADO)
      const afterX = beforeX + photoWidth + 8;
      this.pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      this.pdf.setLineWidth(0.8);
      this.pdf.roundedRect(afterX, photoY, photoWidth, photoHeight, 2, 2, 'S');
      
      // Try to add actual after photo
      if (afterPhoto) {
        this.addImageSafely(afterPhoto, afterX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 7);
      } else {
        // Placeholder
        this.pdf.setFillColor(240, 240, 240);
        this.pdf.roundedRect(afterX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 7, 1, 1, 'F');
      }
      
      // REALIZADO label
      this.pdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      this.pdf.roundedRect(afterX, photoY + photoHeight - 6, photoWidth, 6, 0, 0, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(6);
      this.pdf.text('REALIZADO', afterX + photoWidth / 2, photoY + photoHeight - 1.5, { align: 'center' });
      
      currentY += 50;
    }
    
    // Damage section
    if (hasDamages) {
      const damageBoxHeight = 25 + (sectionDamages.length > 1 ? (sectionDamages.length - 1) * 15 : 0);
      const damageBoxY = currentY;
      
      this.pdf.setFillColor(255, 250, 245);
      this.pdf.setDrawColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
      this.pdf.setLineWidth(0.3);
      this.pdf.roundedRect(cardX + cardPadding, damageBoxY, cardWidth - (cardPadding * 2), damageBoxHeight, 2, 2, 'FD');
      
      // Damage header
      this.pdf.setFont(FONTS.body, 'bold');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
      this.pdf.text('REGISTRO DE AVARIA / MANUTENÇÃO', cardX + cardPadding + 5, damageBoxY + 6);
      
      // Process each damage
      let damageY = damageBoxY + 12;
      sectionDamages.forEach((damage, idx) => {
        const severityColors: Record<string, [number, number, number]> = {
          high: COLORS.danger,
          medium: COLORS.warning,
          low: COLORS.success,
        };
        const severityLabels: Record<string, string> = {
          high: 'EMERGENCY',
          medium: 'ATENÇÃO',
          low: 'BAIXA',
        };
        
        // Severity badge (only on first damage)
        if (idx === 0) {
          const badgeColor = severityColors[damage.severity] || COLORS.warning;
          const badgeX = cardX + cardPadding + 85;
          this.pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
          this.pdf.roundedRect(badgeX, damageBoxY + 2, 22, 6, 1, 1, 'F');
          this.pdf.setTextColor(255, 255, 255);
          this.pdf.setFontSize(5);
          this.pdf.text(severityLabels[damage.severity] || 'INFO', badgeX + 11, damageBoxY + 6, { align: 'center' });
        }
        
        // Damage photo if available
        if (damage.photoUrl) {
          const photoX = cardX + cardPadding + 5;
          this.pdf.setDrawColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
          this.pdf.setLineWidth(0.3);
          this.pdf.roundedRect(photoX, damageY, 12, 10, 1, 1, 'S');
          this.addImageSafely(damage.photoUrl, photoX + 0.5, damageY + 0.5, 11, 9);
          
          // Description next to photo
          this.pdf.setFont(FONTS.body, 'italic');
          this.pdf.setFontSize(9);
          this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          const desc = `"${damage.description.substring(0, 40)}${damage.description.length > 40 ? '...' : ''}"`;
          this.pdf.text(desc, photoX + 15, damageY + 6);
        } else {
          // Description without photo
          this.pdf.setFont(FONTS.body, 'italic');
          this.pdf.setFontSize(9);
          this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
          const desc = `"${damage.description}"`;
          this.pdf.text(desc, cardX + cardPadding + 5, damageY + 5);
        }
        
        damageY += 15;
      });
    }
    
    this.yPos = cardY + cardHeight + 8;
  }

  private drawChecklistPhotosGrid(section: ChecklistSection): void {
    // Get items with photos
    const itemsWithPhotos = section.items.filter(item => item.photoUrl);
    if (itemsWithPhotos.length === 0) return;
    
    this.checkPageBreak(50);
    
    const cardX = this.margin;
    const cardY = this.yPos;
    const photoWidth = 25;
    const photoHeight = 20;
    const photosPerRow = 6;
    const rows = Math.ceil(itemsWithPhotos.length / photosPerRow);
    const cardHeight = 15 + (rows * (photoHeight + 10));
    
    // Card background
    this.pdf.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
    this.pdf.roundedRect(cardX, cardY, this.contentWidth, cardHeight, 2, 2, 'F');
    
    // Title
    this.pdf.setFont(FONTS.body, 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    this.pdf.text(`FOTOS DE VERIFICAÇÃO - ${section.title.toUpperCase()}`, cardX + 5, cardY + 8);
    
    // Photos grid
    itemsWithPhotos.forEach((item, idx) => {
      const col = idx % photosPerRow;
      const row = Math.floor(idx / photosPerRow);
      const photoX = cardX + 5 + (col * (photoWidth + 3));
      const photoY = cardY + 12 + (row * (photoHeight + 10));
      
      // Photo frame
      this.pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(photoX, photoY, photoWidth, photoHeight, 1, 1, 'S');
      
      // Add actual photo
      if (item.photoUrl) {
        this.addImageSafely(item.photoUrl, photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
      }
      
      // Label below
      this.pdf.setFont(FONTS.body, 'normal');
      this.pdf.setFontSize(5);
      this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      const label = item.label.length > 12 ? item.label.substring(0, 10) + '...' : item.label;
      this.pdf.text(label, photoX + photoWidth / 2, photoY + photoHeight + 4, { align: 'center' });
    });
    
    this.yPos = cardY + cardHeight + 5;
  }

  private drawAllPhotosSection(photosBefore: string[], photosAfter: string[]): void {
    if (photosBefore.length === 0 && photosAfter.length === 0) return;
    
    this.checkPageBreak(60);
    
    const cardX = this.margin;
    let cardY = this.yPos;
    
    // Before photos
    if (photosBefore.length > 0) {
      const photoWidth = 28;
      const photoHeight = 22;
      const photosPerRow = 5;
      const rows = Math.ceil(photosBefore.length / photosPerRow);
      const sectionHeight = 15 + (rows * (photoHeight + 5));
      
      this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
      this.pdf.setDrawColor(230, 230, 230);
      this.pdf.roundedRect(cardX, cardY, this.contentWidth, sectionHeight, 3, 3, 'FD');
      
      // Title
      this.pdf.setFont(FONTS.body, 'bold');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      this.pdf.text('📷 Fotos Antes da Limpeza', cardX + 8, cardY + 10);
      
      photosBefore.slice(0, 15).forEach((photo, idx) => {
        const col = idx % photosPerRow;
        const row = Math.floor(idx / photosPerRow);
        const photoX = cardX + 8 + (col * (photoWidth + 4));
        const photoY = cardY + 15 + (row * (photoHeight + 5));
        
        this.pdf.setDrawColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
        this.pdf.setLineWidth(0.3);
        this.pdf.roundedRect(photoX, photoY, photoWidth, photoHeight, 1, 1, 'S');
        this.addImageSafely(photo, photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
      });
      
      cardY += sectionHeight + 5;
      this.yPos = cardY;
    }
    
    // After photos
    if (photosAfter.length > 0) {
      this.checkPageBreak(50);
      cardY = this.yPos;
      
      const photoWidth = 28;
      const photoHeight = 22;
      const photosPerRow = 5;
      const rows = Math.ceil(photosAfter.length / photosPerRow);
      const sectionHeight = 15 + (rows * (photoHeight + 5));
      
      this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
      this.pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(cardX, cardY, this.contentWidth, sectionHeight, 3, 3, 'FD');
      
      // Title
      this.pdf.setFont(FONTS.body, 'bold');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      this.pdf.text('✨ Fotos Após a Limpeza', cardX + 8, cardY + 10);
      
      photosAfter.slice(0, 15).forEach((photo, idx) => {
        const col = idx % photosPerRow;
        const row = Math.floor(idx / photosPerRow);
        const photoX = cardX + 8 + (col * (photoWidth + 4));
        const photoY = cardY + 15 + (row * (photoHeight + 5));
        
        this.pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        this.pdf.setLineWidth(0.5);
        this.pdf.roundedRect(photoX, photoY, photoWidth, photoHeight, 1, 1, 'S');
        this.addImageSafely(photo, photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
      });
      
      this.yPos = cardY + sectionHeight + 8;
    }
  }

  private drawInventorySection(inventory: InventoryItem[], inventoryUsed: { itemId: string; quantityUsed: number }[], laundryExpedition?: LaundryItem[]): void {
    this.checkPageBreak(80);
    
    const cardX = this.margin;
    const cardY = this.yPos;
    const halfWidth = (this.contentWidth - 10) / 2;
    
    // Left card: Expedição Lavanderia
    this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.roundedRect(cardX, cardY, halfWidth, 90, 3, 3, 'FD');
    
    this.pdf.setFont(FONTS.title, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text('Expedição Lavanderia', cardX + 8, cardY + 12);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(cardX + 8, cardY + 15, cardX + halfWidth - 8, cardY + 15);
    
    const items = laundryExpedition || [];
    let itemY = cardY + 24;
    items.slice(0, 9).forEach(item => {
      this.pdf.setFont(FONTS.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      this.pdf.text(item.name, cardX + 8, itemY);
      this.pdf.text(`${item.quantity} ${item.unit}`, cardX + halfWidth - 8, itemY, { align: 'right' });
      itemY += 8;
    });
    
    // Right card: Reposição Necessária
    const rightCardX = cardX + halfWidth + 10;
    this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.roundedRect(rightCardX, cardY, halfWidth, 90, 3, 3, 'FD');
    
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineDashPattern([2, 2], 0);
    this.pdf.roundedRect(rightCardX + 2, cardY + 2, halfWidth - 4, 86, 2, 2, 'S');
    this.pdf.setLineDashPattern([], 0);
    
    this.pdf.setFont(FONTS.title, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text('Reposição Necessária', rightCardX + 8, cardY + 12);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(rightCardX + 8, cardY + 15, rightCardX + halfWidth - 8, cardY + 15);
    
    const lowStockItems = inventory.filter(item => {
      const usage = inventoryUsed.find(u => u.itemId === item.id);
      const remaining = item.quantity - (usage?.quantityUsed || 0);
      return remaining <= item.threshold;
    });
    
    itemY = cardY + 24;
    lowStockItems.slice(0, 9).forEach(item => {
      const usage = inventoryUsed.find(u => u.itemId === item.id);
      const remaining = item.quantity - (usage?.quantityUsed || 0);
      
      this.pdf.setFont(FONTS.body, 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
      this.pdf.text(item.name, rightCardX + 8, itemY);
      
      this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      this.pdf.setFontSize(7);
      this.pdf.text(`Estoque: ${remaining} (Mín: ${item.threshold})`, rightCardX + halfWidth - 8, itemY, { align: 'right' });
      itemY += 8;
    });
    
    this.yPos = cardY + 95;
  }

  private drawLostAndFound(items: LostAndFoundItem[]): void {
    if (!items || items.length === 0) return;
    
    this.checkPageBreak(50);
    
    const cardX = this.margin;
    const cardY = this.yPos;
    const cardHeight = 20 + (items.length * 25);
    
    this.pdf.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.roundedRect(cardX, cardY, this.contentWidth, Math.min(cardHeight, 60), 3, 3, 'FD');
    
    this.pdf.setFont(FONTS.title, 'normal');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text('Achados e Perdidos', cardX + 8, cardY + 12);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(cardX + 8, cardY + 15, cardX + this.contentWidth - 8, cardY + 15);
    
    let itemY = cardY + 28;
    items.slice(0, 2).forEach(item => {
      this.pdf.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
      this.pdf.roundedRect(cardX + 8, itemY - 8, this.contentWidth - 16, 22, 2, 2, 'F');
      
      // Photo
      if (item.photoUrl) {
        this.pdf.setDrawColor(200, 200, 200);
        this.pdf.roundedRect(cardX + 12, itemY - 5, 16, 16, 1, 1, 'S');
        this.addImageSafely(item.photoUrl, cardX + 12.5, itemY - 4.5, 15, 15);
      } else {
        this.pdf.setFillColor(220, 220, 220);
        this.pdf.roundedRect(cardX + 12, itemY - 5, 16, 16, 1, 1, 'F');
      }
      
      this.pdf.setFont(FONTS.body, 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      this.pdf.text(item.description, cardX + 32, itemY);
      
      this.pdf.setFont(FONTS.body, 'normal');
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      this.pdf.text(`Local: ${item.location}`, cardX + 32, itemY + 6);
      this.pdf.text(item.date, cardX + 32, itemY + 11);
      
      itemY += 25;
    });
    
    this.yPos = cardY + Math.min(cardHeight, 60) + 10;
  }

  private drawFooter(responsibleName: string, date: string): void {
    const footerY = this.pageHeight - 25;
    
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);
    
    this.pdf.setFont(FONTS.body, 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text('MAISON PUR', this.margin, footerY);
    
    this.pdf.setFont(FONTS.body, 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    this.pdf.text('EXCELÊNCIA EM PROPRIEDADES', this.margin, footerY + 5);
    
    this.pdf.setDrawColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.setLineWidth(0.2);
    const signatureX = this.pageWidth - this.margin - 50;
    this.pdf.line(signatureX, footerY - 2, this.pageWidth - this.margin, footerY - 2);
    
    this.pdf.setFont(FONTS.body, 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    this.pdf.text('ASSINATURA RESPONSÁVEL', signatureX + 25, footerY + 3, { align: 'center' });
    this.pdf.text(date, signatureX + 25, footerY + 7, { align: 'center' });
    
    this.pdf.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    this.pdf.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    this.pdf.setFontSize(14);
    this.pdf.text('✓', this.pageWidth / 2, footerY - 15, { align: 'center' });
  }

  public generate(data: ReportData): Blob {
    const { job, property, inventory, responsibleName, lostAndFound, laundryExpedition } = data;
    
    const dateStr = new Date(job.date).toLocaleDateString('pt-BR');
    const startTime = job.startTime 
      ? new Date(job.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : job.time;
    const endTime = job.endTime 
      ? new Date(job.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '--:--:--';
    
    // Draw header
    this.drawHeader(
      property?.name || job.clientName,
      dateStr,
      startTime,
      endTime,
      responsibleName
    );
    
    // Draw each checklist section as a card with photos
    job.checklist.forEach((section, index) => {
      const beforePhoto = job.photosBefore[index];
      const afterPhoto = job.photosAfter[index];
      
      // Filter damages related to this section (simple matching by title words)
      const sectionDamages = (job.damages || []).filter(d => {
        const sectionWords = section.title.toLowerCase().split(' ');
        return sectionWords.some(word => d.description.toLowerCase().includes(word));
      });
      
      this.drawSectionCard(section, beforePhoto, afterPhoto, sectionDamages);
      
      // Draw checklist item photos if any have photoUrl
      this.drawChecklistPhotosGrid(section);
    });
    
    // Draw all before/after photos section
    this.drawAllPhotosSection(job.photosBefore, job.photosAfter);
    
    // Draw inventory section
    if (inventory && inventory.length > 0) {
      this.drawInventorySection(inventory, job.inventoryUsed || [], laundryExpedition);
    }
    
    // Draw lost and found
    if (lostAndFound && lostAndFound.length > 0) {
      this.drawLostAndFound(lostAndFound);
    }
    
    // Draw footer on last page
    this.drawFooter(responsibleName, dateStr);
    
    // Add page numbers
    const totalPages = this.pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      this.pdf.text(`Página ${i} de ${totalPages}`, this.pageWidth / 2, this.pageHeight - 8, { align: 'center' });
    }
    
    return this.pdf.output('blob');
  }
}

export const generateCleaningReport = async (data: ReportData): Promise<Blob> => {
  const generator = new ProfessionalReportGenerator();
  return generator.generate(data);
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
