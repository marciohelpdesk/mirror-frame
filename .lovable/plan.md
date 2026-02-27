

## Plano: Cabeçalho, rodapé e categorias interativas

### 1. Cabeçalho estilo referência (`src/views/DashboardView.tsx`)
Na imagem de referência, o header tem:
- **Avatar à ESQUERDA** ao lado da saudação (não à direita como está agora)
- **Ícone de sino/notificação à DIREITA**
- **Data com ícone de calendário** abaixo da saudação ("21 Juillet 2025")
- Gradiente verde suave de fundo

Mudanças:
- Mover avatar para a esquerda, ao lado do texto de saudação
- Adicionar ícone de sino (Bell) à direita
- Adicionar ícone de calendário (Calendar) antes da data formatada
- Remover logo do header (já está na tela de login)

### 2. Rodapé estilo referência (`src/components/layout/BottomNavRouter.tsx`)
Na imagem de referência, o rodapé tem:
- Todos os ícones dentro de **círculos iguais** (não apenas o Home elevado)
- Ícone ativo fica **destacado com fundo colorido** (verde)
- Sem elevação especial para nenhum ícone — todos no mesmo nível
- Ícones: Home, Agenda, Checklist, Properties, Grid/More

Mudanças:
- Remover tratamento especial do Home (sem `-mt-6` e sem círculo elevado)
- Todos os ícones ficam dentro de círculos de fundo suave
- Ícone ativo: fundo `bg-primary/15` com cor `text-primary`
- Ícone inativo: fundo transparente com `text-muted-foreground`
- Remover o dot animado abaixo

### 3. Categorias clicáveis (`src/views/DashboardView.tsx`)
Ao clicar numa categoria, abrir um **modal/sheet** com informações:
- **Airbnb**: Limpeza profissional para propriedades de aluguel por temporada
- **Residencial**: Limpeza regular de casas e apartamentos
- **Pós-obra**: Limpeza especializada após reformas e construções
- **Comercial**: Limpeza de escritórios e espaços comerciais

Usar componente `Sheet` (vaul drawer) para exibir descrição, ícone e um botão para criar job dessa categoria.

### Arquivos a alterar

| Arquivo | Mudança |
|---|---|
| `src/views/DashboardView.tsx` | Header: avatar à esquerda, sino à direita, data com ícone calendário. Categorias clicáveis com Sheet informativo |
| `src/components/layout/BottomNavRouter.tsx` | Todos ícones iguais em círculos, ativo com destaque, sem elevação especial |

