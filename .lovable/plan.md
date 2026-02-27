

## Plano: Tornar enderecos clicaveis para abrir no Google Maps

Todas as exibicoes de endereco no app serao transformadas em links clicaveis que abrem o Google Maps com o endereco pre-preenchido. Funciona em qualquer dispositivo — no mobile, o sistema oferece abrir no Google Maps ou Waze automaticamente.

### Implementacao

1. **Criar helper `openAddressInMaps`** (`src/lib/utils.ts`)
   - Funcao que recebe o endereco como string
   - Abre `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(address)}` em nova aba
   - No mobile, o OS automaticamente oferece abrir no Google Maps ou Waze se instalados

2. **Tornar endereco clicavel nos seguintes componentes:**

| Componente | Linha aprox. | Mudanca |
|---|---|---|
| `src/views/PropertyDetailsView.tsx` | ~190 | Wrap `<p>` do address em link clicavel com icone ExternalLink |
| `src/components/PropertyCard.tsx` | ~86-89 | Tornar o `<p>` do address clicavel (com stopPropagation para nao abrir o card) |
| `src/components/JobCard.tsx` | ~62-65 | Tornar address clicavel |
| `src/components/dashboard/NextJobCard.tsx` | ~97-100 | Tornar address clicavel |
| `src/components/calendar/CalendarJobItem.tsx` | ~126-128 | Tornar address clicavel no item expandido |
| `src/views/DashboardView.tsx` | ~267-269 | Tornar address clicavel |
| `src/views/AgendaView.tsx` | ~322-324 | Tornar address clicavel |

3. **Estilo visual**: texto do endereco ganha `underline decoration-dotted cursor-pointer hover:text-primary` para indicar que e clicavel, com pequeno icone de ExternalLink ao lado.

