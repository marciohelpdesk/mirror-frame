
# Plano: Sistema de Geração de Relatório PDF com Envio por Email

## Visao Geral

Este plano implementa um sistema completo de geração de relatório PDF profissional ao finalizar uma limpeza, incluindo:
- Checklist completo (itens limpos e nao limpos)
- Secao de inventario com itens que precisam ser repostos
- Registro de danos encontrados (TV riscada, cama quebrada, etc.)
- Geracao de PDF profissional
- Envio direto por email ao cliente

```text
+------------------+     +------------------+     +------------------+
|   SummaryStep    | --> |   Registrar      | --> |   Gerar PDF      |
|   (existente)    |     |   Danos          |     |   + Enviar       |
+------------------+     +------------------+     +------------------+
```

## Novas Funcionalidades

### 1. Registro de Danos/Problemas
- Nova secao no fluxo de execucao para registrar problemas encontrados
- Tipos de danos: Mobilia danificada, Eletronicos com defeito, Manchas/Sujeira persistente, Outros
- Captura de foto do dano (opcional)
- Descricao textual do problema

### 2. Secao de Inventario Baixo
- Verificacao automatica de itens abaixo do limite minimo
- Lista de itens que precisam ser comprados/repostos
- Integrado ao sistema de inventario existente

### 3. Geracao de PDF
- Documento profissional com logo da empresa
- Resumo da limpeza (data, hora, duracao, responsavel)
- Checklist completo por secao (itens completos e incompletos)
- Fotos antes/depois
- Registro de danos com fotos
- Lista de inventario a repor

### 4. Envio por Email
- Campo para email do cliente na propriedade
- Botao "Enviar Relatorio" no resumo
- PDF anexado automaticamente
- Template de email profissional

---

## Detalhes Tecnicos

### Novas Dependencias
- `jspdf`: Para geracao de PDF no frontend
- `html2canvas`: Para converter elementos HTML em imagens para o PDF

### Alteracoes nos Tipos (src/types/index.ts)

```typescript
// Novo tipo para registro de danos
interface DamageReport {
  id: string;
  type: 'furniture' | 'electronics' | 'stain' | 'other';
  description: string;
  photoUrl?: string;
  severity: 'low' | 'medium' | 'high';
}

// Atualizar interface Job
interface Job {
  // ... campos existentes
  damages: DamageReport[];        // NOVO
  inventoryUsed: InventoryUsage[]; // NOVO
}

// Novo tipo para uso de inventario
interface InventoryUsage {
  itemId: string;
  quantityUsed: number;
}

// Atualizar interface Property
interface Property {
  // ... campos existentes
  clientEmail?: string;  // NOVO - email para envio do relatorio
}
```

### Novos Arquivos

1. **src/components/execution/DamageReportStep.tsx**
   - Nova etapa no fluxo de execucao
   - Interface para adicionar danos com tipo, descricao e foto
   - Lista de danos registrados

2. **src/components/execution/InventoryCheckStep.tsx**
   - Etapa para verificar itens de inventario usados
   - Mostra itens abaixo do limite
   - Permite marcar itens para reposicao

3. **src/lib/pdfGenerator.ts**
   - Funcao para gerar PDF com jsPDF
   - Formatacao profissional do relatorio
   - Inclui todas as secoes (checklist, danos, inventario, fotos)

4. **supabase/functions/send-report-email/index.ts**
   - Edge function para envio de email via Resend
   - Recebe dados do relatorio e email do destinatario
   - Envia PDF como anexo

### Arquivos Modificados

1. **src/views/ExecutionView.tsx**
   - Adicionar novas etapas no fluxo: DAMAGE_REPORT e INVENTORY_CHECK
   - Atualizar STEP_ORDER para incluir novas etapas
   - Passar inventario e handlers para as novas etapas

2. **src/components/execution/SummaryStep.tsx**
   - Adicionar preview de danos registrados
   - Adicionar preview de inventario baixo
   - Novo botao "Gerar e Enviar Relatorio"
   - Integracao com geracao de PDF

3. **src/data/initialData.ts**
   - Atualizar INITIAL_JOBS para incluir campos damages e inventoryUsed
   - Adicionar clientEmail nas propriedades de exemplo

4. **src/pages/Index.tsx**
   - Passar inventario para ExecutionView
   - Handler para atualizar inventario apos limpeza

5. **src/views/PropertyDetailsView.tsx**
   - Adicionar campo para email do cliente

### Fluxo de Execucao Atualizado

```text
BEFORE_PHOTOS -> CHECKLIST -> DAMAGE_REPORT -> INVENTORY_CHECK -> AFTER_PHOTOS -> SUMMARY
```

### Estrutura do PDF

```text
+------------------------------------------+
|  [LOGO]  RELATORIO DE LIMPEZA            |
|  Data: 26/01/2026 | Hora: 09:00          |
|  Duracao: 2h 15min                        |
|  Responsavel: Maria Santos               |
+------------------------------------------+
|  PROPRIEDADE                             |
|  Ocean View Loft                         |
|  123 Beach Ave, Santa Monica             |
+------------------------------------------+
|  CHECKLIST DE LIMPEZA                    |
|                                          |
|  Cozinha (7/7 completo)                  |
|  [x] Limpar bancadas                     |
|  [x] Limpar fogao e forno               |
|  ...                                     |
|                                          |
|  Sala (5/5 completo)                     |
|  [x] Tirar po de superficies            |
|  ...                                     |
+------------------------------------------+
|  DANOS ENCONTRADOS                       |
|                                          |
|  [!] TV da sala com arranhao             |
|      Severidade: Media                   |
|      [FOTO]                              |
+------------------------------------------+
|  INVENTARIO - ITENS PARA REPOR           |
|                                          |
|  - All-Purpose Cleaner (2 restantes)     |
|  - Microfiber Cloths (3 restantes)       |
+------------------------------------------+
|  FOTOS DOCUMENTACAO                      |
|                                          |
|  ANTES          |  DEPOIS                |
|  [IMG] [IMG]    |  [IMG] [IMG]           |
+------------------------------------------+
|  OBSERVACOES                             |
|  Limpeza concluida sem problemas.        |
+------------------------------------------+
```

---

## Etapas de Implementacao

### Fase 1: Preparacao
1. Instalar dependencias (jspdf, html2canvas)
2. Atualizar tipos em src/types/index.ts
3. Atualizar dados iniciais

### Fase 2: Novas Etapas de Execucao
1. Criar DamageReportStep.tsx
2. Criar InventoryCheckStep.tsx
3. Atualizar ExecutionView.tsx com novas etapas

### Fase 3: Geracao de PDF
1. Criar lib/pdfGenerator.ts
2. Integrar no SummaryStep

### Fase 4: Envio por Email
1. Configurar Resend (requer chave API do usuario)
2. Criar edge function send-report-email
3. Adicionar campo email na propriedade
4. Integrar envio no SummaryStep

### Fase 5: Refinamentos
1. Traduzir interface para portugues
2. Testar fluxo completo
3. Ajustar estilos do PDF

---

## Requisitos para Envio de Email

Para o envio de email funcionar, sera necessario:

1. **Habilitar Lovable Cloud** - Para ter acesso ao backend
2. **Configurar Resend** - O usuario precisara:
   - Criar conta em resend.com
   - Validar dominio de email
   - Criar API key
   - Fornecer a chave RESEND_API_KEY

Posso iniciar a implementacao sem o envio de email (apenas geracao de PDF para download) e adicionar o email posteriormente quando o backend estiver configurado.

---

## Resultado Final

Ao completar uma limpeza, o usuario podera:
1. Registrar danos encontrados com fotos
2. Verificar inventario usado e itens baixos
3. Gerar PDF profissional com todo o relatorio
4. Baixar o PDF ou enviar diretamente por email ao cliente
