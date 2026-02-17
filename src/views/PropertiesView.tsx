import { useState } from 'react';
import { Plus, Search, LayoutGrid, Map, SlidersHorizontal } from 'lucide-react';
import { Property } from '@/types';
import { PropertyCard } from '@/components/PropertyCard';
import { AddPropertyModal } from '@/components/AddPropertyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertiesViewProps {
  properties: Property[];
  onViewProperty: (id: string) => void;
  onAddProperty: (property: Property) => void;
}

type FilterType = 'all' | 'READY' | 'NEEDS_CLEANING' | 'OCCUPIED';

export const PropertiesView = ({ properties, onViewProperty, onAddProperty }: PropertiesViewProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showSearch, setShowSearch] = useState(false);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'READY').length,
    maintenance: properties.filter(p => p.status === 'NEEDS_CLEANING').length,
  };

  const filters: { key: FilterType; label: string; dotColor?: string }[] = [
    { key: 'all', label: t('properties.all') || 'Todas' },
    { key: 'READY', label: t('properties.active') || 'Ativas', dotColor: 'bg-emerald-500' },
    { key: 'NEEDS_CLEANING', label: t('properties.maintenance') || 'Manutenção', dotColor: 'bg-amber-500' },
    { key: 'OCCUPIED', label: t('properties.occupied') || 'Ocupadas', dotColor: 'bg-rose-500' },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('properties.manage') || 'Gerenciar'}</p>
            <h1 className="font-bold text-foreground text-2xl">{t('properties.title')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:shadow-xl transition"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search bar (collapsible) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl">
                <Search size={16} className="text-muted-foreground" />
                <input 
                  type="text"
                  placeholder={t('properties.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-2xl p-3 border border-border/30">
            <p className="text-[10px] text-muted-foreground mb-1">Total</p>
            <p className="text-xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 border border-border/30">
            <p className="text-[10px] text-muted-foreground mb-1">{t('properties.active') || 'Ativas'}</p>
            <p className="text-xl font-bold text-primary">{stats.active}</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 border border-border/30">
            <p className="text-[10px] text-muted-foreground mb-1">{t('properties.today') || 'Hoje'}</p>
            <p className="text-xl font-bold text-warning">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-6 py-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${activeFilter === filter.key
                  ? 'bg-gradient-to-r from-primary to-teal-600 text-white scale-105 shadow-md shadow-primary/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {filter.dotColor && (
                <span className={`inline-block w-2 h-2 rounded-full ${filter.dotColor} mr-1.5`} />
              )}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="px-6 space-y-4">
        <AnimatePresence>
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              property={property}
              onClick={onViewProperty}
            />
          ))}
        </AnimatePresence>
        
        {filteredProperties.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">{t('properties.noProperties')}</h3>
            <p className="text-muted-foreground text-sm mb-6">Tente ajustar os filtros ou adicione uma nova propriedade.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-teal-600 text-white font-semibold shadow-lg shadow-primary/30"
            >
              <Plus size={16} className="inline mr-2" /> Adicionar Propriedade
            </button>
          </motion.div>
        )}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={onAddProperty}
        userId={user?.id}
      />
    </div>
  );
};
