

## Plano: Adaptar design ao estilo teal/green gradient das imagens de referencia

### O que muda (apenas CSS e visual)

As imagens de referencia mostram um gradiente escuro teal/verde-floresta no topo (~35% da tela) que transiciona suavemente para branco. Uma gota 3D de vidro proeminente fica posicionada no topo. Cards sao brancos limpos com bordas suaves.

### Mudancas

#### 1. Gradiente de fundo (`src/index.css`)
- Trocar `--sky-pink` (rosa) e `--sky-blue` (azul claro) por tons teal/verde escuro
- `--sky-pink` → `160 30% 25%` (teal escuro, topo)
- `--sky-blue` → `160 15% 92%` (quase branco, base)
- Atualizar `.bg-florida-sky` para gradiente vertical teal-to-white
- Atualizar `.mobile-frame` background para `rgba(255,255,255,0.65)` mais transparente no topo

#### 2. Gota 3D de agua no topo (`src/components/BackgroundEffects.tsx`)
- Substituir as gotas aleatorias por uma unica gota hero centralizada no topo (~80px do topo, centro)
- Estilo 3D glass sphere: borda branca mais forte, sombra interna mais pronunciada, reflexo de luz
- Manter as duas gotas decorativas grandes nos cantos mas com opacidade reduzida
- Remover as 5 gotas aleatorias pequenas

#### 3. Headers com gradiente visivel (`src/views/DashboardView.tsx`, `src/views/SettingsView.tsx`, `src/views/AgendaView.tsx`)
- Trocar `bg-background/70` e `bg-card` dos headers por `bg-transparent` para deixar o gradiente aparecer
- Texto do header em branco (`text-white`) quando sobre o gradiente escuro
- Manter `backdrop-blur-xl` para legibilidade

#### 4. Bottom nav ajuste de cor (`src/components/layout/BottomNavRouter.tsx`)
- Ajustar fundo da nav para `rgba(255,255,255,0.92)` — mais opaco para contrastar com o novo gradiente

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/index.css` | Gradiente teal-to-white, variáveis sky |
| `src/components/BackgroundEffects.tsx` | Gota hero 3D centralizada no topo |
| `src/views/DashboardView.tsx` | Header transparente com texto claro |
| `src/views/SettingsView.tsx` | Header transparente com texto claro |
| `src/views/AgendaView.tsx` | Header transparente com texto claro |
| `src/components/layout/BottomNavRouter.tsx` | Nav mais opaca |

Nenhuma logica, rota ou funcionalidade sera alterada — apenas CSS e componentes visuais.

