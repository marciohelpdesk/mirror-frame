
# Plano: Mobile-Frame Ocupar 100% da Tela em Modo Mobile

## Problema Identificado

Na visualizacao mobile (telas < 769px), o mobile-frame nao esta ocupando toda a altura da tela:

- O container pai usa `flex items-center justify-center` que centraliza o frame
- Isso cria espacos vazios no topo e na parte inferior
- O background gradient aparece nessas faixas (circuladas em vermelho na imagem)

## Causa Raiz

```text
+------------------------------+
|  bg-florida-sky-fixed        |  <- Gradiente rosa (visivel - ERRO)
|------------------------------|
|                              |
|      mobile-frame            |  <- Centralizado verticalmente
|      (nao ocupa 100%)        |
|                              |
|------------------------------|
|  bg-florida-sky-fixed        |  <- Gradiente ciano (visivel - ERRO)
+------------------------------+
```

O CSS atual:
```css
.mobile-frame {
  @apply relative flex flex-col w-full h-full;  /* h-full depende do pai */
}
```

O pai tem `min-h-screen flex items-center justify-center` - isso centraliza mas NAO forca altura 100%.

## Solucao

Em modo mobile (telas < 769px), o mobile-frame deve ocupar **100% da viewport** (`100vh`), sem centralizacao vertical.

## Mudancas Necessarias

### 1. Arquivo: src/index.css

Ajustar o `.mobile-frame` para ter altura 100vh em mobile:

```css
/* Mobile Frame */
.mobile-frame {
  @apply relative flex flex-col w-full;
  height: 100vh;  /* Ocupar toda a viewport em mobile */
  height: 100dvh; /* Dynamic viewport height (melhor para mobile) */
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(40px);
  overflow-y: auto;
  overflow-x: hidden;
}

@media (min-width: 769px) {
  .mobile-frame {
    @apply w-[375px] max-h-[95vh] rounded-[40px];
    height: 812px;  /* Altura fixa apenas em desktop */
    /* ... resto igual */
  }
}
```

### 2. Arquivo: src/pages/Index.tsx

Remover a centralizacao vertical em mobile, mantendo apenas em desktop:

**De:**
```tsx
<div className="min-h-screen relative z-10 flex items-center justify-center">
  <LoginView ... />
</div>
```

**Para:**
```tsx
<div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
  <LoginView ... />
</div>
```

Isso aplica `flex items-center justify-center` apenas em telas >= 768px (desktop).

### 3. Opcional: Remover bg-florida-sky-fixed em mobile

Como o mobile-frame ocupara 100% da tela, podemos esconder o background externo em mobile:

```css
.bg-florida-sky-fixed {
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, hsl(var(--sky-pink)) 0%, hsl(var(--sky-blue)) 100%);
  z-index: 0;
}

@media (max-width: 768px) {
  .bg-florida-sky-fixed {
    display: none;  /* Nao precisa em mobile - frame cobre tudo */
  }
}
```

## Resultado Visual Esperado

### Mobile (< 769px):
```text
+------------------------+
|                        |
|     MOBILE FRAME       |  <- Ocupa 100vh
|     (100% da tela)     |
|                        |
|     [Logo]             |
|     [Login Card]       |
|     [Mercury Drops]    |
|                        |
+------------------------+
   Sem faixas visiveis!
```

### Desktop (>= 769px):
```text
+------------------------------------+
|      bg-florida-sky-fixed          |
|                                    |
|     +------------------------+     |
|     |   MOBILE FRAME         |     |
|     |   (375px x 812px)      |     |
|     |   Centralizado         |     |
|     +------------------------+     |
|                                    |
+------------------------------------+
```

## Resumo das Alteracoes

| Arquivo | Mudanca |
|---------|---------|
| src/index.css | mobile-frame com height: 100dvh em mobile |
| src/index.css | bg-florida-sky-fixed com display:none em mobile |
| src/pages/Index.tsx | Centralizacao apenas em desktop (md:flex md:items-center md:justify-center) |

## Tempo Estimado

Aproximadamente 5 minutos para implementar.
