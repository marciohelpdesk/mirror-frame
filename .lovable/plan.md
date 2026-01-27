
# Plano: Janela de Horário e Histórico de Relatórios

## Visão Geral

Este plano implementa duas funcionalidades importantes para gestão de limpezas Airbnb:

1. **Janela de Horário (Check-out/Check-in)**: Em vez de apenas um horário de agendamento, ter dois horários - quando os hóspedes saem (check-out) e quando a limpeza deve estar pronta (check-in do próximo hóspede)

2. **Histórico de Relatórios**: Salvar automaticamente o PDF gerado quando um job é concluído, permitindo acesso posterior ao documento

---

## Parte 1: Janela de Horário (Check-out/Check-in)

### O que muda para o usuário

- Ao criar/editar um job, poderá informar dois horários:
  - **Check-out**: Horário em que os hóspedes saem (quando a limpeza pode começar)
  - **Check-in**: Horário limite para a limpeza estar pronta (deadline)
- Na visualização do calendário e cards, ambos os horários serão exibidos (ex: "10:00 - 15:00")
- Isso facilita o planejamento sabendo exatamente a janela disponível

### Alterações no Banco de Dados

Adicionar novas colunas na tabela `jobs`:
- `checkout_time` (TEXT): Horário de check-out dos hóspedes
- `checkin_deadline` (TEXT): Horário limite para a limpeza (check-in dos próximos)

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/index.ts` | Adicionar `checkoutTime` e `checkinDeadline` no tipo `Job` |
| `src/hooks/useJobs.ts` | Mapear novas colunas no banco |
| `src/components/JobFormFields.tsx` | Adicionar dois seletores de horário (Check-out e Check-in) |
| `src/components/AddJobModal.tsx` | Incluir novos campos no form data |
| `src/views/JobDetailsView.tsx` | Exibir janela de horário completa |
| `src/components/calendar/CalendarJobItem.tsx` | Mostrar range de horário (ex: "10:00-15:00") |
| `src/lib/pdfGenerator.ts` | Incluir janela de horário no relatório |

---

## Parte 2: Histórico de Relatórios

### O que muda para o usuário

- Quando o job é concluído, o PDF é automaticamente salvo no Supabase Storage
- Na visualização de jobs completados, há um botão para re-baixar o relatório
- O histórico fica acessível sem precisar regenerar o documento

### Alterações no Banco de Dados

Adicionar nova coluna na tabela `jobs`:
- `report_pdf_url` (TEXT): URL do relatório PDF salvo no storage

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/index.ts` | Adicionar `reportPdfUrl` no tipo `Job` |
| `src/hooks/useJobs.ts` | Mapear nova coluna |
| `src/components/execution/SummaryStep.tsx` | Salvar PDF no storage ao completar |
| `src/views/JobDetailsView.tsx` | Adicionar botão "Ver Relatório" para jobs completados |
| `src/components/JobCard.tsx` | Indicador visual de relatório disponível |

### Fluxo de Salvamento do Relatório

```text
┌─────────────────────────────────────────────────────────┐
│                  SummaryStep.tsx                        │
│                                                         │
│  1. Usuário clica "Concluir"                           │
│                    ↓                                    │
│  2. Gera PDF com generateCleaningReport()              │
│                    ↓                                    │
│  3. Upload para: cleaning-photos/reports/{jobId}.pdf   │
│                    ↓                                    │
│  4. Salva URL no job (report_pdf_url)                  │
│                    ↓                                    │
│  5. Marca job como COMPLETED                           │
└─────────────────────────────────────────────────────────┘
```

---

## Detalhes Técnicos

### 1. Migração do Banco de Dados

```sql
-- Adicionar colunas para janela de horário e URL do relatório
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS checkout_time TEXT,
ADD COLUMN IF NOT EXISTS checkin_deadline TEXT,
ADD COLUMN IF NOT EXISTS report_pdf_url TEXT;

-- Comentários descritivos
COMMENT ON COLUMN jobs.checkout_time IS 'Guest checkout time - when cleaning can start';
COMMENT ON COLUMN jobs.checkin_deadline IS 'Next guest check-in time - cleaning deadline';
COMMENT ON COLUMN jobs.report_pdf_url IS 'URL to saved PDF report in storage';
```

### 2. Atualização do Tipo Job

```typescript
// Em src/types/index.ts
export interface Job {
  // ... campos existentes ...
  time: string;              // Mantido para compatibilidade
  checkoutTime?: string;     // Novo: quando hóspedes saem (ex: "10:00")
  checkinDeadline?: string;  // Novo: deadline para limpeza (ex: "15:00")
  reportPdfUrl?: string;     // Novo: URL do relatório salvo
}
```

### 3. Upload do Relatório no Storage

```typescript
// Em SummaryStep.tsx
const handleComplete = async () => {
  // 1. Gerar o PDF
  const pdfBlob = await generateCleaningReport({ job, inventory, ... });
  
  // 2. Upload para storage
  const filename = `reports/${job.id}-${Date.now()}.pdf`;
  const { data } = await supabase.storage
    .from('cleaning-photos')
    .upload(filename, pdfBlob, { contentType: 'application/pdf' });
  
  // 3. Obter URL pública
  const { data: urlData } = supabase.storage
    .from('cleaning-photos')
    .getPublicUrl(filename);
  
  // 4. Completar job com URL do relatório
  onComplete(note, urlData.publicUrl);
};
```

### 4. Visualização do Relatório em Jobs Completados

Na `JobDetailsView`, para jobs com status `COMPLETED`:

```typescript
{job.status === JobStatus.COMPLETED && job.reportPdfUrl && (
  <Button 
    onClick={() => window.open(job.reportPdfUrl, '_blank')}
    className="w-full gap-2"
  >
    <FileDown size={18} />
    Baixar Relatório
  </Button>
)}
```

---

## Ordem de Implementação

1. **Migração SQL**: Adicionar colunas no banco de dados
2. **Tipos e Hooks**: Atualizar `types/index.ts` e `useJobs.ts`
3. **Formulários**: Atualizar `JobFormFields.tsx` e `AddJobModal.tsx`
4. **Visualização**: Atualizar `JobDetailsView.tsx`, `CalendarJobItem.tsx`
5. **Relatório**: Atualizar `SummaryStep.tsx` para salvar PDF
6. **PDF**: Atualizar `pdfGenerator.ts` com janela de horário

---

## Resultado Final

- Usuário poderá definir janela de horário ao agendar limpezas (check-out 10:00 → check-in 15:00)
- Calendário mostrará o range de horários disponíveis
- Ao concluir um job, o relatório PDF é salvo automaticamente
- Jobs completados terão botão para re-baixar o relatório a qualquer momento
- Histórico de relatórios sempre acessível

