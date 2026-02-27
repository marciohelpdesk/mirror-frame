
Objetivo: corrigir definitivamente para exibir sempre o nome completo **“Kamila Petters”** no relatório (novo e já existente), sem depender do nome curto salvo no perfil.

1) Diagnóstico confirmado
- A causa é que o sistema ainda prioriza `profile?.name` ao gerar relatório.
- No banco, os registros atuais estão com `cleaner_name = 'Kamila'` (3) e `cleaner_name = 'Cleaner'` (2), então o fallback nunca resolve os antigos.

2) Implementação (código)
- `src/pages/Execution.tsx`
  - Trocar:
    - `cleaner_name: profile?.name || 'Kamila Petters'` → `cleaner_name: 'Kamila Petters'`
    - `responsibleName: profile?.name || 'Kamila Petters'` → `responsibleName: 'Kamila Petters'`
- `src/pages/Reports.tsx`
  - Trocar:
    - `cleaner_name: profile?.name || 'Kamila Petters'` → `cleaner_name: 'Kamila Petters'`

3) Correção dos relatórios já gerados (backend)
- Executar atualização única nos dados existentes:
```sql
update public.cleaning_reports
set cleaner_name = 'Kamila Petters',
    updated_at = now()
where lower(trim(cleaner_name)) in ('kamila', 'camila', 'cleaner');
```
- Isso corrige imediatamente os links públicos já publicados (`/r/:token`) sem precisar recriar cada relatório.

4) Validação (primeiro item: teste ponta a ponta)
- Testar ponta a ponta:
  - concluir um job novo e gerar relatório;
  - abrir o link público;
  - confirmar que aparece **Kamila Petters** no título/hero e metadados;
  - abrir um relatório antigo e confirmar que também foi corrigido.

Seção técnica (resumo de arquivos afetados)
- `src/pages/Execution.tsx` (2 substituições)
- `src/pages/Reports.tsx` (1 substituição)
- 1 update SQL em `cleaning_reports` para backfill
