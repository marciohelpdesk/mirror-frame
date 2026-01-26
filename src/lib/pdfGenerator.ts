import jsPDF from 'jspdf';
import { Job, Property, InventoryItem, DamageReport, ChecklistSection } from '@/types';

interface ReportData {
  job: Job;
  property?: Property;
  inventory: InventoryItem[];
  responsibleName: string;
}

const COLORS = {
  primary: [0, 210, 211] as [number, number, number],
  secondary: [255, 122, 89] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
};

export const generateCleaningReport = async (data: ReportData): Promise<Blob> => {
  const { job, property, inventory, responsibleName } = data;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const addNewPage = () => {
    pdf.addPage();
    yPos = margin;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  // Header
  pdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE LIMPEZA', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(dateStr, pageWidth - margin, 25, { align: 'right' });
  
  yPos = 55;

  // Job Info Section
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informações do Serviço', margin, yPos);
  yPos += 8;

  pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);

  const jobInfo = [
    ['Propriedade:', job.clientName],
    ['Endereço:', job.address],
    ['Tipo de Serviço:', job.type === 'Standard' ? 'Limpeza Padrão' : job.type === 'Deep Clean' ? 'Limpeza Profunda' : 'Move-out'],
    ['Responsável:', responsibleName],
    ['Data:', new Date(job.date).toLocaleDateString('pt-BR')],
    ['Horário:', job.time],
  ];

  if (job.startTime && job.endTime) {
    const duration = Math.floor((job.endTime - job.startTime) / 60000);
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    jobInfo.push(['Duração:', hours > 0 ? `${hours}h ${mins}min` : `${mins} minutos`]);
  }

  if (job.price) {
    jobInfo.push(['Valor:', `R$ ${job.price.toFixed(2)}`]);
  }

  jobInfo.forEach(([label, value]) => {
    pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    pdf.text(label, margin, yPos);
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 40, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 6;
  });

  yPos += 10;

  // Checklist Section
  checkPageBreak(30);
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Checklist de Limpeza', margin, yPos);
  yPos += 8;

  pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  job.checklist.forEach((section: ChecklistSection) => {
    checkPageBreak(20);
    
    const completedItems = section.items.filter(i => i.completed).length;
    const totalItems = section.items.length;
    const allCompleted = completedItems === totalItems;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    pdf.text(section.title, margin, yPos);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const statusColor = allCompleted ? COLORS.success : COLORS.warning;
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`(${completedItems}/${totalItems})`, margin + pdf.getTextWidth(section.title) + 3, yPos);
    yPos += 6;

    section.items.forEach(item => {
      checkPageBreak(8);
      
      pdf.setFontSize(10);
      const checkbox = item.completed ? '☑' : '☐';
      const checkColor = item.completed ? COLORS.success : COLORS.muted;
      pdf.setTextColor(checkColor[0], checkColor[1], checkColor[2]);
      pdf.text(checkbox, margin + 4, yPos);
      
      const textColor = item.completed ? COLORS.dark : COLORS.muted;
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text(item.label, margin + 12, yPos);
      
      if (!item.completed) {
        pdf.setTextColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
        pdf.setFontSize(8);
        pdf.text('(não concluído)', margin + 12 + pdf.getTextWidth(item.label) + 2, yPos);
      }
      
      yPos += 5;
    });
    
    yPos += 5;
  });

  // Damages Section
  if (job.damages && job.damages.length > 0) {
    checkPageBreak(30);
    yPos += 5;
    
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Danos Encontrados', margin, yPos);
    yPos += 8;

    pdf.setDrawColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    job.damages.forEach((damage: DamageReport) => {
      checkPageBreak(20);
      
      const typeLabels: Record<DamageReport['type'], string> = {
        furniture: 'Móvel Danificado',
        electronics: 'Eletrônico com Defeito',
        stain: 'Mancha/Sujeira Persistente',
        other: 'Outro',
      };
      
      const severityLabels: Record<DamageReport['severity'], string> = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
      };
      
      const severityColors: Record<DamageReport['severity'], [number, number, number]> = {
        low: COLORS.success,
        medium: COLORS.warning,
        high: COLORS.danger,
      };

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      pdf.text(`• ${typeLabels[damage.type]}`, margin + 4, yPos);
      
      pdf.setFont('helvetica', 'normal');
      const sevColor = severityColors[damage.severity];
      pdf.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      pdf.text(`[Severidade: ${severityLabels[damage.severity]}]`, margin + 4 + pdf.getTextWidth(`• ${typeLabels[damage.type]}`) + 3, yPos);
      yPos += 5;
      
      pdf.setFontSize(9);
      pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      const descLines = pdf.splitTextToSize(damage.description, pageWidth - margin * 2 - 10);
      descLines.forEach((line: string) => {
        pdf.text(line, margin + 8, yPos);
        yPos += 4;
      });
      
      yPos += 4;
    });
  }

  // Inventory Section
  const lowStockItems = inventory.filter(item => {
    const usage = job.inventoryUsed?.find(u => u.itemId === item.id);
    const remaining = item.quantity - (usage?.quantityUsed || 0);
    return remaining <= item.threshold;
  });

  if (lowStockItems.length > 0) {
    checkPageBreak(30);
    yPos += 5;
    
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Itens para Reposição', margin, yPos);
    yPos += 8;

    pdf.setDrawColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    lowStockItems.forEach(item => {
      checkPageBreak(8);
      
      const usage = job.inventoryUsed?.find(u => u.itemId === item.id);
      const remaining = item.quantity - (usage?.quantityUsed || 0);
      
      pdf.setFontSize(10);
      pdf.setTextColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
      pdf.text('⚠', margin + 4, yPos);
      pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      pdf.text(`${item.name}: ${remaining} ${item.unit} restantes`, margin + 12, yPos);
      pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      pdf.setFontSize(8);
      pdf.text(`(mínimo: ${item.threshold})`, margin + 12 + pdf.getTextWidth(`${item.name}: ${remaining} ${item.unit} restantes`) + 2, yPos);
      
      yPos += 6;
    });
  }

  // Notes Section
  if (job.reportNote) {
    checkPageBreak(30);
    yPos += 10;
    
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Observações', margin, yPos);
    yPos += 8;

    pdf.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const noteLines = pdf.splitTextToSize(job.reportNote, pageWidth - margin * 2);
    noteLines.forEach((line: string) => {
      checkPageBreak(6);
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  pdf.text('Relatório gerado automaticamente pelo sistema PUR Clean', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`Página 1 de ${pdf.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

  return pdf.output('blob');
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
