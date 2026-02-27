

## Plano: Corrigir e modernizar checklist de execucao

### Problemas identificados

1. **Botoes com texto gigante** — as chaves `exec.checklist.pause`, `exec.checklist.nextRoom`, `exec.checklist.finalize` nao existem no LanguageContext, entao exibem a chave inteira como texto (ex: "exec.checklist.pause")
2. **Delete de itens/ambientes inacessivel no mobile** — o botao de remover item usa `opacity-0 group-hover:opacity-100`, que nao funciona em toque
3. **Cards espremidos** — gap e padding insuficientes no layout dos itens
4. **Ondas do LiquidProgressBubble pouco fluidas** — apenas 2 camadas de onda com paths retos demais
5. **Lentidao ao clicar** — animacoes de delay (`delay: index * 0.03`) somam em listas grandes

### Mudancas

#### 1. Adicionar traducoes faltantes (`src/contexts/LanguageContext.tsx`)

Adicionar ao EN e PT:
- `exec.checklist.pause` → "Pause" / "Pausar"
- `exec.checklist.nextRoom` → "Next Room" / "Proxima Sala"
- `exec.checklist.finalize` → "Finish" / "Finalizar"

#### 2. Corrigir ChecklistStep (`src/components/execution/ChecklistStep.tsx`)

**Botoes inferiores:**
- Reduzir tamanho de texto para `text-sm`
- Usar traducoes corretas

**Cards de item:**
- Remover `delay: index * 0.03` para resposta instantanea
- Tornar botao de delete sempre visivel no mobile (remover `opacity-0 group-hover:opacity-100`, usar sempre visivel com opacidade reduzida)
- Aumentar padding interno e gap entre elementos
- Melhorar glassmorphism com `backdrop-blur-xl` e bordas mais refinadas

**Fotos do ambiente:**
- Dar mais espaco ao grid de fotos (gap-4)
- Botoes Camera/Galeria com labels maiores

**Add/Remove Room:**
- Garantir que swipe ou botao de lixeira funcione no mobile para remover ambiente

#### 3. Melhorar ondas do LiquidProgressBubble (`src/components/LiquidProgressBubble.tsx`)

- Adicionar 3a camada de onda com velocidade diferente
- Usar paths com curvas mais organicas (bezier mais suaves)
- Adicionar mais particulas de bolha com tamanhos variados
- Aumentar amplitude das ondas para efeito mais dramatico

### Arquivos a editar

| Arquivo | Mudanca |
|---|---|
| `src/contexts/LanguageContext.tsx` | Adicionar 3 traducoes faltantes |
| `src/components/execution/ChecklistStep.tsx` | Fix botoes, delete mobile, performance, glassmorphism |
| `src/components/LiquidProgressBubble.tsx` | Ondas mais fluidas e organicas |

