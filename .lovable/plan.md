

## Diagnóstico Completo

### Problema 1: Tabelas e Storage Bucket nao existem no Supabase

Todas as requisicoes de rede retornam **404** com `"Could not find the table 'public.profiles' in the schema cache"` (e o mesmo para `properties`, `jobs`, `employees`, `cleaning_reports`). O upload de fotos retorna `"Bucket not found"`.

Isso confirma que o projeto Supabase `okgqcakjjkbijcuaevgx` esta **vazio** -- as migrations nunca foram aplicadas nele. O login funciona (autenticacao OK), mas nenhuma tabela ou bucket de storage existe.

### Problema 2: Modais de formulario sem glassmorphism

Os modais `EditProfileModal` e `AddJobModal` usam estilos padrao sem o visual glassmorphism que ja existe no `AddPropertyModal`.

---

## Plano de Implementacao

### Passo 1 -- Criar migration unificada para provisionar o banco

Criar uma **nova migration** que consolida todo o schema necessario (com `IF NOT EXISTS` / `ON CONFLICT` para ser idempotente):

- Tabelas: `user_roles`, `profiles`, `properties`, `jobs`, `employees`, `inventory`, `cleaning_reports`, `report_rooms`, `report_photos`
- Colunas extras de jobs: `checkout_time`, `checkin_deadline`, `report_pdf_url`
- Trigger `handle_new_user` (auto-cria profile + role no signup)
- Trigger `update_updated_at_column`
- Todas as RLS policies
- Storage buckets: `cleaning-photos` e `report-photos` (publicos)
- Storage RLS policies
- Indices

Isso resolve todos os erros 404 de tabelas e "Bucket not found" de uma so vez.

### Passo 2 -- Melhorar visual do EditProfileModal

Aplicar o mesmo padrao glassmorphism do `AddPropertyModal`:
- `glass-panel border-0 max-w-[95%] max-h-[90vh] rounded-2xl p-0 overflow-hidden` no DialogContent
- Header com icone gradiente
- Campos com `rounded-xl bg-card/50 border-muted`
- Botoes com gradiente e sombra
- Secoes agrupadas em `glass-panel`

### Passo 3 -- Melhorar visual do AddJobModal

Mesmo tratamento:
- DialogContent com `glass-panel border-0 rounded-2xl`
- Header com icone Briefcase em container gradiente
- Botoes estilizados com sombra e gradiente
- Max-width ajustado para `max-w-[95%]` (consistente com outros modais)

### Passo 4 -- Melhorar visual do JobFormFields

Revisar os campos do formulario de agendamento para usar:
- Inputs com `h-11 rounded-xl bg-card/50 border-muted`
- Labels com icones
- Secoes agrupadas em `glass-panel`

---

### Arquivos a serem criados/editados

| Arquivo | Acao |
|---|---|
| `supabase/migrations/20260226030000_provision_full_schema.sql` | **Criar** -- migration completa |
| `src/components/EditProfileModal.tsx` | **Editar** -- glassmorphism |
| `src/components/AddJobModal.tsx` | **Editar** -- glassmorphism |
| `src/components/JobFormFields.tsx` | **Editar** -- campos estilizados |

### Detalhes tecnicos

A migration usara `CREATE TABLE IF NOT EXISTS` e `INSERT ... ON CONFLICT DO NOTHING` para buckets, garantindo que possa rodar em qualquer estado do banco. As policies usam `DROP POLICY IF EXISTS` antes de `CREATE POLICY` para evitar conflitos. O trigger `handle_new_user` usa `CREATE OR REPLACE` e `DROP TRIGGER IF EXISTS` seguido de `CREATE TRIGGER`.

