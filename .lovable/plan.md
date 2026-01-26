
# Plano: Manter Background e Efeitos Apenas Dentro do Mobile-Frame

## Problema Identificado

Conforme a imagem, o background gradient "Florida Sky" e os efeitos "mercury drops" estao aparecendo **fora** do mobile-frame:
- Topo: area rosa visivel acima do frame
- Inferior: area ciano visivel abaixo do frame

O design deveria ter o background e efeitos **apenas dentro** do mobile-frame, com a area externa sendo neutra (ou transparente).

## Solucao

Mover o background gradient e os efeitos para **dentro** do mobile-frame, e deixar a area externa com uma cor neutra.

## Mudancas Necessarias

### 1. Arquivo: src/pages/Index.tsx

Remover o `bg-florida-sky-fixed` externo e deixar o background neutro fora do frame:

**De:**
```tsx
return (
  <>
    <div className="bg-florida-sky-fixed" />
    <div className="min-h-screen relative z-10 flex items-center justify-center">
      <LoginView ... />
    </div>
  </>
);
```

**Para:**
```tsx
return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center">
    <LoginView ... />
  </div>
);
```

### 2. Arquivo: src/views/LoginView.tsx

O `mobile-frame` ja esta sendo usado e contera o background internamente. Precisamos adicionar o background gradient **dentro** do frame:

**De:**
```tsx
<div className="mobile-frame relative flex flex-col">
  <BackgroundEffects />
  ...
```

**Para:**
```tsx
<div className="mobile-frame relative flex flex-col bg-florida-sky">
  <BackgroundEffects />
  ...
```

### 3. Arquivo: src/components/BackgroundEffects.tsx

Mudar os efeitos de `fixed` para `absolute` para ficarem contidos no mobile-frame:

**De:**
```tsx
<div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
```

**Para:**
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
```

### 4. Arquivo: src/index.css

Garantir que o mobile-frame tenha `overflow: hidden` para cortar qualquer conteudo que saia:

```css
.mobile-frame {
  @apply relative flex flex-col w-full h-full;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(40px);
  overflow: hidden; /* Corta conteudo que sair do frame */
}
```

---

## Resultado Visual Esperado

```text
+------------------------------------+
|                                    |
|      Fundo Neutro (slate-100)      |
|                                    |
|     +------------------------+     |
|     |   MOBILE FRAME         |     |
|     |   (bg-florida-sky)     |     |
|     |   Rosa -> Ciano        |     |
|     |                        |     |
|     |   [Logo]               |     |
|     |   [Login Card]         |     |
|     |   [Mercury Drops]      |     |
|     |                        |     |
|     +------------------------+     |
|                                    |
|      Fundo Neutro (slate-100)      |
|                                    |
+------------------------------------+
```

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| src/pages/Index.tsx | Remover bg-florida-sky-fixed, usar bg-slate-100 externo |
| src/views/LoginView.tsx | Adicionar bg-florida-sky no mobile-frame |
| src/components/BackgroundEffects.tsx | Mudar fixed para absolute |
| src/index.css | Ajustar overflow do mobile-frame |

## Observacao

Sera necessario aplicar a mesma logica nas outras views do app (Dashboard, Agenda, etc.) para manter consistencia.
