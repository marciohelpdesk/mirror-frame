

## Plano: Substituir sino por logotipo Pur no header

### Mudança única

**Arquivo: `src/views/DashboardView.tsx`**
- Substituir o ícone `<Bell>` pelo logotipo Pur (`purLogo` já importado no projeto)
- Trocar o `<Bell size={20}>` por `<img src={purLogo} className="w-6 h-6 object-contain" />`
- Remover `Bell` do import do lucide-react (se não usado em outro lugar)

Nenhuma lógica alterada.

