
# Plano: Corrigir Erro de Inventory Undefined no InventoryCheckStep

## Problema Identificado

O componente `InventoryCheckStep` esta quebrando porque tenta acessar propriedades de `inventory` (como `.filter`, `.find`, `.length`) sem verificar se a variavel e `undefined` antes.

### Locais com Problema:

1. **Linha 31** - `handleQuantityChange`: `inventory.find(i => i.id === itemId)` - nao tem verificacao
2. **Linha 176** - Renderizacao: `inventory.length === 0` - nao tem verificacao

## Solucao

Adicionar verificacoes de seguranca em todos os locais onde `inventory` e acessado diretamente.

## Alteracoes Necessarias

### Arquivo: `src/components/execution/InventoryCheckStep.tsx`

**1. Funcao handleQuantityChange (linha 30-46)**

Adicionar verificacao de seguranca no inicio da funcao:

```typescript
const handleQuantityChange = (itemId: string, delta: number) => {
  if (!inventory) return; // ADICIONAR
  
  const item = inventory.find(i => i.id === itemId);
  if (!item) return;
  // ... resto do codigo
};
```

**2. Verificacao de lista vazia (linha 176)**

Trocar `inventory.length === 0` por verificacao segura:

```typescript
// DE:
{inventory.length === 0 && (

// PARA:
{(!inventory || inventory.length === 0) && (
```

## Resumo das Mudancas

```text
+---------------------------------------+----------------------------------+
| Local                                 | Mudanca                          |
+---------------------------------------+----------------------------------+
| handleQuantityChange (linha 30)       | Adicionar: if (!inventory) return|
| Renderizacao (linha 176)              | Verificacao: !inventory || ...   |
+---------------------------------------+----------------------------------+
```

## Resultado Esperado

Apos estas correcoes, o componente:
- Nao quebrara se `inventory` for undefined
- Mostrara a mensagem "Nenhum item de inventario cadastrado" quando nao houver dados
- Funcionara normalmente quando os dados estiverem disponiveis

## Tempo Estimado

Aproximadamente 2 minutos para implementar.
