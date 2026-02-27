

## Plano: Modernizar checklist de execucao + upload multiplo + edicao de itens/ambientes

### Mudancas

#### 1. Upload multiplo de fotos em paralelo

**`src/components/execution/ChecklistStep.tsx`** (RoomPhotosSection):
- O input ja aceita `multiple`, mas o processamento e sequencial (`for...await`). Mudar para `Promise.all` para upload paralelo.
- Adicionar estado de contagem de uploads em progresso ao inves de booleano simples.

**`src/components/execution/PhotoCaptureStep.tsx`**:
- Mesmo problema — processar fotos em paralelo com `Promise.all` ao inves de sequencial.

#### 2. Adicionar/remover itens do checklist durante execucao

**`src/components/execution/ChecklistStep.tsx`**:
- Adicionar botao "+" no final da lista de itens de cada ambiente para criar novo item inline (input de texto + confirmar).
- Adicionar botao de delete (X) em cada item card (apenas itens nao completados, com swipe ou icone).
- Adicionar botao "+" nas tabs de ambiente para criar novo ambiente/secao.
- Adicionar botao de delete no header do ambiente ativo (apenas se vazio ou com confirmacao).

#### 3. Modernizar visual do checklist

**`src/components/execution/ChecklistStep.tsx`**:

Redesign completo dos item cards:
- Trocar o layout flat por cards com micro-interacoes mais sofisticadas
- Checkbox: trocar circulo simples por checkbox animado com efeito de "ripple" ao completar
- Adicionar icone contextual por tipo de tarefa (limpeza, organizacao, etc.)
- Card completado: adicionar gradiente sutil de fundo verde com animacao de slide
- Melhorar tipografia: label em `text-sm font-medium`, sublabel para "Foto obrigatoria" mais integrado
- Thumbnail da foto verificacao: maior (w-11 h-11), com borda glow quando presente
- Adicionar contador de progresso animado no header da secao (barra circular mini ao lado do titulo)
- Transicao entre abas: slide horizontal ao invez de fade simples
- Botao "Proximo Ambiente": gradiente animado com seta pulsante
- Room tabs: adicionar indicador de progresso circular mini dentro de cada tab
- Photo grid do ambiente: layout masonry 2 colunas com aspect-ratio variado, animacao de entrada staggered
- Botoes Camera/Galeria no grid de fotos: icones maiores com labels mais visiveis

#### 4. Arquivos a editar

| Arquivo | Mudanca |
|---|---|
| `src/components/execution/ChecklistStep.tsx` | Redesign visual, upload paralelo, add/remove items e ambientes |
| `src/components/execution/PhotoCaptureStep.tsx` | Upload paralelo de fotos |

