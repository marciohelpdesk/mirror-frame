
# Plano: Corrigir Sobreposição com Safe Area do iOS

## Problema Identificado
O conteúdo do app está sobrepondo a barra de status do iOS (hora, sinal, bateria, etc.) porque:
1. O `index.html` usa `viewport-fit=cover` e `apple-mobile-web-app-status-bar-style="black-translucent"`
2. Isso permite que o conteúdo ocupe toda a tela, incluindo a área da barra de status
3. **Falta** o uso de `env(safe-area-inset-top)` no CSS para criar espaço seguro

## Solução

### Mudanças Necessárias

**1. Atualizar `src/index.css`**

Adicionar suporte a Safe Area Insets no CSS global:
- Criar uma variável CSS para o safe-area-inset-top
- Aplicar padding-top automático no container principal

```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-frame {
  padding-top: env(safe-area-inset-top, 0px);
}
```

**2. Atualizar `src/components/PageHeader.tsx`**

Adicionar padding-top seguro no header para empurrar o conteúdo para baixo da barra de status:

```tsx
<header className="flex justify-between items-start p-6 pb-4 pt-safe">
```

Onde `pt-safe` será uma classe utilitária que aplica `padding-top: env(safe-area-inset-top)`.

**3. Atualizar `src/views/ExecutionView.tsx`**

O header da ExecutionView usa `pt-4` diretamente. Precisamos adicionar o safe area inset:

```tsx
<div className="px-4 pt-4 pb-2">
// Muda para:
<div className="px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
```

### Implementação Técnica

**Arquivo: `src/index.css`**
- Adicionar variáveis CSS para safe-area-insets
- Criar classe utilitária `.pt-safe` 
- Aplicar `padding-top: env(safe-area-inset-top)` no `.mobile-frame`

**Arquivo: `src/components/PageHeader.tsx`**
- Modificar o padding-top do header para incluir safe-area

**Arquivo: `src/views/ExecutionView.tsx`**  
- Modificar o padding-top do header para incluir safe-area

### Resultado Esperado

```text
ANTES:                          DEPOIS:
┌───────────────────┐           ┌───────────────────┐
│00:19 📶 🔋        │           │00:19 📶 🔋        │ ← Status bar
│Good Morning ──────│ ← Overlap │───────────────────│ ← Safe area
│                   │           │Good Morning       │
│                   │           │                   │
└───────────────────┘           └───────────────────┘
```

O conteúdo será empurrado para baixo automaticamente em dispositivos com notch (iPhone X+) e barra de status, garantindo que todos os elementos interativos fiquem acessíveis.
