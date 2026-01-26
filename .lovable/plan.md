
# Plano: Bolha de Líquido com Progresso Animado

## Resumo
Adicionar uma bolha decorativa com efeito de líquido animado no Dashboard, acima da seção "Today's Jobs". O líquido vai enchendo conforme as tarefas do checklist são concluídas, criando uma visualização impactante do progresso de "purificação" do dia.

## Visualização do Conceito

A bolha será inspirada na imagem fornecida:
- Uma esfera/círculo grande com borda sutil e fundo semi-transparente
- Líquido cyan/turquesa que preenche de baixo para cima
- Porcentagem grande centralizada
- Texto "PURIFICATION" acima
- Animação suave tipo onda no topo do líquido

## Arquivos a serem modificados/criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/LiquidProgressBubble.tsx` | Criar | Novo componente com a bolha de líquido animada |
| `src/views/DashboardView.tsx` | Modificar | Integrar a bolha acima da seção "Today's Jobs" |
| `src/index.css` | Modificar | Adicionar animação de onda para o líquido |
| `src/contexts/LanguageContext.tsx` | Modificar | Adicionar traduções para "Purification" |

## O que será criado

### 1. Componente LiquidProgressBubble
- Esfera glassmorphism de aproximadamente 200x200px
- Preenchimento de líquido animado com gradiente cyan
- Animação de onda no topo do líquido usando SVG path
- Porcentagem centralizada com tipografia elegante
- Texto "PURIFICATION" acima da bolha
- Transição suave quando a porcentagem muda

### 2. Cálculo do Progresso
O progresso será calculado baseado em:
- Total de itens do checklist de todos os jobs do dia que estão IN_PROGRESS
- Itens completados / Total de itens = Porcentagem
- Atualização em tempo real conforme tarefas são marcadas

### 3. Animação de Onda
```text
- SVG path curvo animado horizontalmente
- Movimento contínuo tipo "água mexendo"
- Amplitude reduz quando se aproxima de 100%
```

## Detalhes Técnicos

### Estrutura do Componente
```text
LiquidProgressBubble
├── Wrapper (relative container)
│   ├── Label "PURIFICATION" (acima)
│   └── Bubble Container (circular, glassmorphism)
│       ├── Liquid Fill (clip-path circular)
│       │   ├── Wave SVG (animado horizontalmente)
│       │   └── Solid Fill (abaixo da onda)
│       └── Percentage Text (centralizado, z-index alto)
```

### Props do Componente
```text
interface LiquidProgressBubbleProps {
  percentage: number;  // 0-100
  label?: string;      // default: "PURIFICATION"
  size?: number;       // default: 200px
}
```

### CSS para Animação de Onda
```text
@keyframes wave {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(-50%); }
}
```

### Integração no DashboardView
O componente será inserido antes do título "Today's Jobs":
1. Calcular progresso baseado nos jobs IN_PROGRESS
2. Se não houver jobs em progresso, mostrar 0%
3. Se houver jobs completados, considerar 100% para esses

### Novas Traduções
| Chave | EN | PT |
|-------|----|----|
| `dashboard.purification` | PURIFICATION | PURIFICAÇÃO |

## Estilo Visual
- Bolha: borda branca sutil, fundo branco semi-transparente (0.2)
- Líquido: gradiente cyan (#22d3ee) para turquesa (#06b6d4)
- Porcentagem: fonte Outfit, peso 200 (light), tamanho 48px
- Onda: animação suave de 4 segundos, loop infinito
