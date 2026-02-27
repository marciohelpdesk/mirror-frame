

## Plano: Melhorar visual, responsividade e corrigir PDF bloqueado

### Problemas identificados

1. **Bottom nav com texto espremido** — 5 itens com labels em `text-[9px]` e `min-w-[56px]` causa sobreposicao de letras, especialmente em PT ("Relatórios", "Propriedades", "Configurações")
2. **Safe area / conteudo espremido** — em iPhones, o conteudo fica muito proximo da status bar (bateria, horario, sinal) e do bottom nav
3. **PDF bloqueado ao baixar** — o `PdfPreviewModal` usa `iframe` com `blob:` URL que muitos navegadores mobile bloqueiam; o download via `link.click()` tambem falha em contextos de iframe/modal
4. **Glassmorphism pode ser refinado** — as imagens de referencia mostram mercury drops maiores e mais proeminentes, cards com bordas mais suaves

### Mudancas

#### 1. Bottom nav: remover labels, apenas icones (`src/components/layout/BottomNavRouter.tsx`)
- Remover o `<span>` com label de texto
- Aumentar icone para `size={22}`
- Reduzir `min-h` para `44px`, manter `min-w-[48px]`
- Adicionar dot indicator abaixo do icone ativo (3px circulo colorido)
- Resultado: nav mais limpo, sem texto sobreposto

#### 2. Safe area e espacamento (`src/components/layout/MobileLayout.tsx` + `src/index.css`)
- Adicionar `pt-safe` ao `<main>` para garantir padding no topo
- Aumentar `pb-24` para `pb-28` para dar mais espaco acima do nav
- No `.mobile-frame`, adicionar `padding-bottom: env(safe-area-inset-bottom, 0px)`

#### 3. Corrigir download do PDF (`src/components/execution/SummaryStep.tsx` + `src/components/execution/PdfPreviewModal.tsx`)
- No `PdfPreviewModal`, trocar download por `window.open(blobUrl)` em mobile como fallback
- Adicionar `target="_blank"` ao link criado via DOM para contornar bloqueio de iframe
- Garantir que `downloadPdf` use `setTimeout` para evitar bloqueio de popup

#### 4. Glassmorphism sutil dos reference images (`src/components/BackgroundEffects.tsx`)
- Aumentar drops decorativos grandes (canto superior direito e inferior esquerdo) — mais proximos do estilo das imagens de referencia
- Elevar opacidade levemente (0.35 → 0.45) para efeito mais visivel

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/components/layout/BottomNavRouter.tsx` | Remover labels, icones maiores, dot indicator |
| `src/components/layout/MobileLayout.tsx` | Ajustar safe area e padding bottom |
| `src/components/execution/PdfPreviewModal.tsx` | Corrigir download bloqueado em mobile |
| `src/components/execution/SummaryStep.tsx` | Fallback de download direto |
| `src/components/BackgroundEffects.tsx` | Mercury drops maiores |
| `src/index.css` | Ajustar mobile-frame padding |

