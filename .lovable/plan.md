
# Plano: Reposicionar a Bolha de Progresso na ExecutionView

## Problema Identificado
A bolha de líquido está atualmente posicionada ao lado esquerdo do stepper (linha 134-150), criando um layout desalinhado e fora de contexto visual com os ícones circulares do stepper.

## Solução Proposta

### Opção Recomendada: Integrar a Bolha como Primeiro Step do Stepper
Transformar a bolha em parte visual do próprio stepper, como se fosse um "indicador de progresso geral" que acompanha os steps.

**Layout proposto:**
```text
┌─────────────────────────────────────────────┐
│ CLEANING NOW                            [X] │
│ Cliente Name                                │
├─────────────────────────────────────────────┤
│                                             │
│  📷 ─ 📋 ─ ⚠️ ─ 🔍 ─ 📦 ─ 📸 ─ 📄        │
│  Before Tasks Damages Found Inv After Sum   │
│                                             │
│                  ┌────┐                     │
│                  │~~~~│  ← Bolha centralizada│
│                  │~~~~│    abaixo do stepper │
│                  └────┘                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Mudanças no Layout

**Arquivo: `src/views/ExecutionView.tsx`**

1. **Remover** a bolha da posição atual (ao lado do stepper)
2. **Centralizar** a bolha abaixo do stepper em uma nova linha
3. Ajustar o tamanho para ~50px para ser discreto mas visível
4. Adicionar espaçamento apropriado

### Estrutura Final do Header
```text
Header
├── Título + Botão X (linha superior)
├── Stepper (ocupando toda a largura)
└── Bolha de Progresso (centralizada abaixo, menor)
```

## Detalhes Técnicos

### Novo Layout da Seção de Progresso
- O stepper volta a ocupar a largura total (`flex-1` sem concorrência)
- A bolha fica em uma `div` separada, centralizada
- Tamanho reduzido para 48-50px
- Margem superior sutil para separação visual

### Benefícios
- Stepper mantém alinhamento uniforme
- Bolha não compete visualmente com os ícones dos steps
- Layout mais limpo e contextualizado
- A bolha funciona como "resumo visual" do progresso do checklist
