

## Plano: Redesign estrutural inspirado na imagem de referencia

A imagem de referencia mostra um layout com: (1) header com saudacao + avatar + data sobre gradiente escuro, (2) categorias horizontais com icones circulares, (3) card de servico destacado com descricao + tempo + area, (4) secao de checklist base com cards horizontais, (5) bottom nav com 5 icones incluindo um central destacado. O gradiente vai de verde-floresta escuro no topo para verde-claro translucido no meio.

### Problema atual
- `--primary` ainda e `200 98% 39%` (azul ciano) — aparece em botoes, badges, progress bars, bottom nav
- Dashboard usa grid 2x2 de KPIs que nao corresponde ao layout da referencia
- Quick actions sao 4 colunas simples sem os icones ilustrativos da referencia
- Bottom nav nao tem icone central destacado
- PropertiesView header usa `bg-card` opaco em vez de transparente

### Mudancas

#### 1. Paleta de cores — eliminar azul (`src/index.css`)
- `--primary: 160 45% 35%` (verde-esmeralda escuro)
- `--primary-foreground: 0 0% 100%`
- `--ring: 160 45% 35%`
- `--sky-cyan: 160 40% 35%`
- `--status-active: 160 60% 40%` (era ciano)
- Dark mode: `--primary: 160 50% 45%`
- Adicionar `--cta: 38 90% 50%` (amber/dourado para botoes de acao)
- Gradient bottom nav indicator: trocar `hsl(186 100% 46% / 0.12)` para usar primary

#### 2. Dashboard — layout inspirado na referencia (`src/views/DashboardView.tsx`)
- Manter header com saudacao + avatar sobre gradiente (ja existe)
- Substituir grid 2x2 de KPIs por: secao de **categorias horizontais** com scroll — icones circulares representando tipos de servico (Airbnb, Residencial, Pos-obra, Comercial) usando icones Lucide
- Abaixo: **card de destaque do proximo job** — card grande com info do servico, tempo estimado, area m², similar ao "Menage Airbnb Premium" da referencia
- Abaixo: **Checklist de Base** — cards horizontais com scroll mostrando templates de checklist disponiveis
- Manter timeline de jobs do dia e weekly progress
- Quick actions: trocar de grid 4 colunas para row horizontal com scroll, estilo pills arredondadas

#### 3. Botoes CTA em amber/dourado
- Botoes "Continuar", "Iniciar", "+ Novo Job" usam `bg-gradient-to-r from-amber-500 to-amber-400 text-white`
- Aplicar em: `DashboardView.tsx`, `AgendaView.tsx`, `NextJobCard.tsx`

#### 4. PropertiesView header transparente (`src/views/PropertiesView.tsx`)
- Trocar `bg-card border-b` por `bg-transparent backdrop-blur-xl`
- Texto do header em branco

#### 5. Bottom nav — icone central destacado (`src/components/layout/BottomNavRouter.tsx`)
- O icone central (Reports/FileText, indice 2) ganha estilo elevado: circulo verde com sombra, posicionado acima da barra
- Trocar cor do indicator de `hsl(186...)` para `hsl(var(--primary) / 0.12)`

#### 6. Gradiente mais pronunciado (`src/index.css`)
- `.bg-florida-sky`: escurecer topo para `hsl(160 35% 20%)`, transicao mais longa ate branco
- `.mobile-frame` background: `rgba(255,255,255,0.25)` no mobile para deixar gradiente mais visivel

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/index.css` | Primary verde-esmeralda, gradiente mais forte, variavel CTA |
| `src/views/DashboardView.tsx` | Layout: categorias horizontais + card destaque + checklist cards |
| `src/views/AgendaView.tsx` | Botoes CTA amber |
| `src/views/PropertiesView.tsx` | Header transparente |
| `src/components/layout/BottomNavRouter.tsx` | Icone central elevado, cor primary no indicator |
| `src/components/dashboard/NextJobCard.tsx` | Botao CTA amber |
| `src/components/BackgroundEffects.tsx` | Ajuste opacidade da gota hero |

Nenhuma logica, rota ou funcionalidade sera alterada.

