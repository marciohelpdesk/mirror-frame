

## Diagnostico

### 1. Labels da Dashboard mostrando chaves brutas
O `t()` retorna a propria chave quando ela nao existe (ex: `"dashboard.thisMonth"`). Como e uma string truthy, o fallback `|| 'Este mes'` **nunca executa**. Resultado: o usuario ve textos como "dashboard.thisMonth", "Total jobs", "dashboard.satisfaction" nos KPI cards.

**Chaves ausentes nas traducoes (en e pt):** `dashboard.thisMonth`, `dashboard.satisfaction`, `dashboard.pending`, `dashboard.quickActions`, `dashboard.newJob`, `dashboard.property`, `dashboard.report`, `dashboard.team`, `dashboard.today`, `dashboard.viewAgenda`, `dashboard.continue`, `dashboard.progress`.

### 2. Visual pouco minimalista
Os KPI cards usam `bg-card` simples sem glassmorphism. Os labels sao longos demais ("Propriedade", "Relatorio"). Quick actions tambem precisa de labels curtos.

### 3. Fotos no relatorio publico so aparecem em um ambiente
A correcao anterior do `_room_index` ja foi aplicada no codigo, mas so funcionara para **novos relatorios** criados apos a correcao. Relatorios existentes continuarao com fotos sem `room_id`. Nao ha bug adicional aqui -- o usuario precisa testar com um novo job.

### 4. Bottom nav se move com a pagina
O `BottomNavRouter` ja usa `fixed bottom-0` -- o problema pode ser o container `overflow-y-auto` no DashboardView criando um contexto de scroll separado. Preciso garantir que o `MobileLayout` nao interfira.

### 5. Design do bottom nav
Atualmente funcional mas pode ser mais limpo e moderno.

---

## Plano de Implementacao

### Arquivo 1: `src/contexts/LanguageContext.tsx`
Adicionar todas as chaves ausentes em ambos idiomas (en + pt) com labels **curtos e minimalistas**:

| Chave | EN | PT |
|---|---|---|
| `dashboard.thisMonth` | `This Month` | `Mes` |
| `dashboard.satisfaction` | `Rating` | `Nota` |
| `dashboard.pending` | `Pending` | `Pendente` |
| `dashboard.quickActions` | `Quick Actions` | `Acoes` |
| `dashboard.newJob` | `New` | `Novo` |
| `dashboard.property` | `Property` | `Imovel` |
| `dashboard.report` | `Report` | `Dossi` |
| `dashboard.team` | `Team` | `Equipe` |
| `dashboard.today` | `Today` | `Hoje` |
| `dashboard.viewAgenda` | `See all` | `Ver tudo` |
| `dashboard.continue` | `Continue` | `Continuar` |
| `dashboard.progress` | `Progress` | `Progresso` |
| `dashboard.totalJobs` | `Jobs` | `Jobs` |

### Arquivo 2: `src/views/DashboardView.tsx`
- Substituir labels dos KPI cards por chaves de traducao curtas (ex: `t('dashboard.thisMonth')` ja vai funcionar com as chaves adicionadas)
- Remover label hardcoded `'Total jobs'` e usar `t('dashboard.totalJobs')`
- Remover fallbacks `||` desnecessarios (as chaves agora existem)
- KPI cards: trocar `bg-card` por `glass-panel-subtle` para glassmorphism
- Quick actions: trocar `bg-card` por `glass-panel-subtle`
- Job timeline cards: adicionar glassmorphism sutil
- Header: substituir texto "Dashboard" fixo por `t('nav.dashboard')`

### Arquivo 3: `src/components/layout/BottomNavRouter.tsx`
- Simplificar o design: remover ripple effects excessivos, dot indicator, e glow effect
- Usar icones mais finos (strokeWidth 1.5) e labels menores
- Aplicar glassmorphism mais forte com `backdrop-blur-2xl` e `bg-white/60`
- Garantir `fixed bottom-0` com safe-area-inset-bottom para iPhones
- Reduzir padding vertical para ficar mais compacto e moderno

### Arquivo 4: `src/index.css` (se necessario)
- Verificar se `.glass-panel-subtle` ja existe; se nao, ajustar para garantir que funcione nos KPI cards

---

### Arquivos a editar

| Arquivo | Mudanca |
|---|---|
| `src/contexts/LanguageContext.tsx` | Adicionar ~13 chaves de traducao ausentes (en + pt) |
| `src/views/DashboardView.tsx` | Labels curtos, glassmorphism nos cards, remover fallbacks |
| `src/components/layout/BottomNavRouter.tsx` | Design minimalista, glassmorphism mais forte, compacto |

