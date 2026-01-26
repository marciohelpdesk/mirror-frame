import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Minus, Plus, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InventoryItem, InventoryUsage } from '@/types';

interface InventoryCheckStepProps {
  inventory: InventoryItem[];
  inventoryUsed: InventoryUsage[];
  onInventoryUsedChange: (usage: InventoryUsage[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const InventoryCheckStep = ({
  inventory,
  inventoryUsed,
  onInventoryUsedChange,
  onNext,
  onBack,
}: InventoryCheckStepProps) => {
  const [usages, setUsages] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    inventoryUsed.forEach(u => {
      initial[u.itemId] = u.quantityUsed;
    });
    return initial;
  });

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const currentUsed = usages[itemId] || 0;
    const newUsed = Math.max(0, Math.min(item.quantity, currentUsed + delta));
    
    const newUsages = { ...usages, [itemId]: newUsed };
    setUsages(newUsages);

    // Convert to InventoryUsage array
    const usageArray: InventoryUsage[] = Object.entries(newUsages)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, quantityUsed]) => ({ itemId, quantityUsed }));
    
    onInventoryUsedChange(usageArray);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => {
      const used = usages[item.id] || 0;
      const remaining = item.quantity - used;
      return remaining <= item.threshold;
    });
  };

  const lowStockItems = getLowStockItems();

  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Inventário</h2>
            <p className="text-xs text-muted-foreground">
              Registre os itens utilizados na limpeza
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        {/* Low Stock Warning */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-3 mb-4 border-l-4 border-l-amber-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Estoque Baixo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => {
                const remaining = item.quantity - (usages[item.id] || 0);
                return (
                  <span 
                    key={item.id}
                    className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs"
                  >
                    {item.name}: {remaining} {item.unit}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Inventory List by Category */}
        {Object.entries(groupedInventory).map(([category, items], catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="mb-4"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {category}
            </h3>
            <div className="glass-panel divide-y divide-white/10">
              {items.map(item => {
                const used = usages[item.id] || 0;
                const remaining = item.quantity - used;
                const isLow = remaining <= item.threshold;
                
                return (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Disponível: {item.quantity} {item.unit}</span>
                        {used > 0 && (
                          <span className={isLow ? 'text-amber-400' : 'text-secondary'}>
                            (usado: {used})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={used === 0}
                        className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <span className={`w-8 text-center text-sm font-semibold ${used > 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                        {used}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={used >= item.quantity}
                        className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {inventory.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum item de inventário cadastrado</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
