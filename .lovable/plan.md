

## Plano: Corrigir layout do perfil, filtros das propriedades, traduções e uniformizar headers

### Problemas identificados

1. **Perfil (EditProfileModal)**: O PhotoUploader com `aspect-square` dentro de um container `w-28` com `rounded-full` faz os botões Camera/Gallery ficarem apertados dentro do circulo do avatar, cortados visualmente.

2. **Properties - Traduções faltando**: As chaves `properties.manage`, `properties.active`, `properties.today` não existem no `LanguageContext.tsx`, mostrando o texto bruto da chave (ex: "PROPERTIES.MANAGE", "properties.active").

3. **Properties - Filtros escondidos**: Os filter chips estão parcialmente escondidos atrás do header sticky com os stats.

4. **Headers inconsistentes**: Cada página tem um header diferente:
   - Dashboard: header custom com greeting + logo + avatar
   - Agenda: header custom com titulo bold + botão add
   - Properties: header custom com subtitle uppercase + titulo + stats
   - Reports: usa PageHeader com titulo + subtitle
   - Settings: usa PageHeader com titulo + subtitle

### Solução

#### 1. PhotoUploader no perfil - Separar botões do circulo

**`src/components/EditProfileModal.tsx`**: Mudar o layout do avatar para que o circulo mostre apenas a foto/placeholder, e os botões Camera/Gallery fiquem **abaixo** do circulo, fora dele. Remover o uso do PhotoUploader dentro do circulo e usar um avatar simples com botões separados.

#### 2. Adicionar traduções faltantes

**`src/contexts/LanguageContext.tsx`**: Adicionar as chaves:
- `properties.manage` → EN: "Manage" / PT: "Gerenciar"
- `properties.active` → EN: "Active" / PT: "Ativas"  
- `properties.today` → EN: "Today" / PT: "Hoje"

#### 3. Corrigir filtros cortados nas Properties

**`src/views/PropertiesView.tsx`**: Mover os filter chips para **dentro** do bloco sticky do header (antes do fechamento do div sticky), para que não fiquem escondidos atrás dele.

#### 4. Uniformizar headers de todas as páginas

Padronizar todos os headers com o mesmo formato:
- Linha 1: subtitle em uppercase pequeno (`text-[10px] font-bold uppercase tracking-wider text-muted-foreground`)
- Linha 2: titulo em `text-2xl font-bold`
- Direita: ações relevantes da página

Arquivos a ajustar:
- **DashboardView.tsx**: Já tem o padrão correto (subtitle "Painel" + greeting bold). Manter.
- **AgendaView.tsx**: Adicionar subtitle `t('agenda.subtitle')` acima do titulo.
- **Reports.tsx**: Mudar para usar o mesmo padrão sticky dos outros (bg-card + border-b), não o PageHeader solto.
- **SettingsView.tsx**: Mudar para usar o mesmo padrão sticky dos outros.

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `src/contexts/LanguageContext.tsx` | Adicionar chaves `properties.manage`, `properties.active`, `properties.today` |
| `src/components/EditProfileModal.tsx` | Separar botões de foto do circulo do avatar |
| `src/views/PropertiesView.tsx` | Mover filter chips para dentro do sticky header |
| `src/views/AgendaView.tsx` | Adicionar subtitle acima do titulo para consistência |
| `src/pages/Reports.tsx` | Uniformizar header com padrão sticky |
| `src/views/SettingsView.tsx` | Uniformizar header com padrão sticky |

