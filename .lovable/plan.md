

## Plano: Fallback do nome 'Cleaner' → 'Kamila Petters'

O nome "Cleaner" aparece no relatório porque `profile?.name` está vazio/null e o fallback é `'Cleaner'`. Preciso trocar o fallback em dois arquivos.

### Mudanças

| Arquivo | Linha | De | Para |
|---|---|---|---|
| `src/pages/Reports.tsx` | 73 | `profile?.name \|\| 'Cleaner'` | `profile?.name \|\| 'Kamila Petters'` |
| `src/pages/Execution.tsx` | 111 | `profile?.name \|\| 'Cleaner'` | `profile?.name \|\| 'Kamila Petters'` |
| `src/pages/Execution.tsx` | 129 | `profile?.name \|\| 'Cleaner'` | `profile?.name \|\| 'Kamila Petters'` |

3 substituições em 2 arquivos.

