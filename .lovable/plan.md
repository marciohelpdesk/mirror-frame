

## Plano: Corrigir espaçamento excessivo no topo e conteudo cortado

### Problema identificado

Analisando o codigo, encontrei **3 causas** para o espaço excessivo no topo e o conteudo parecer "cortado":

1. **Duplo padding de safe-area**: O `.mobile-frame` ja aplica `padding-top: env(safe-area-inset-top)` (linha 301 do index.css), e o `<main>` dentro dele tambem aplica `pt-safe` (que e o mesmo `env(safe-area-inset-top)`). No celular com notch, isso duplica o espaço — ~47px + ~47px = ~94px de padding no topo.

2. **`min-h-screen` no `<main>`**: O `<main>` tem `min-h-screen` (100vh), mas esta dentro do `.mobile-frame` que ja tem `height: 100dvh`. Isso faz o conteudo interno ser mais alto que o container, causando scroll desnecessario e sensacao de que o app esta "mais curto".

3. **Gota hero 3D a `top: 60px`**: A gota de vidro ocupa 140px de altura comecando a 60px do topo, empurrando visualmente o conteudo para baixo e sobrepondo o header.

### Mudancas

#### 1. Remover `pt-safe` duplicado (`src/components/layout/MobileLayout.tsx`)
- Remover `pt-safe` da classe do `<main>` — o `.mobile-frame` ja cuida do safe-area
- Trocar `min-h-screen` por `min-h-full` ou `flex-1` para que o conteudo preencha o frame sem exceder

#### 2. Ajustar gota hero (`src/components/BackgroundEffects.tsx`)
- Reduzir `top` de `60px` para `20px`
- Reduzir tamanho de `140px` para `100px`
- Isso evita sobreposicao com o header e reduz espaco "morto" no topo

#### 3. Reduzir padding do `.mobile-frame` se necessario (`src/index.css`)
- Manter `padding-top: env(safe-area-inset-top)` apenas no `.mobile-frame`
- Confirmar que nao ha outro padding duplicado

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/components/layout/MobileLayout.tsx` | Remover `pt-safe` e `min-h-screen` do `<main>` |
| `src/components/BackgroundEffects.tsx` | Gota hero menor (100px) e mais alta (top: 20px) |

Nenhuma logica ou funcionalidade sera alterada.

