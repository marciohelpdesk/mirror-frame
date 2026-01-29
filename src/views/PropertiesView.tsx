import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { AddPropertyModal } from '@/components/AddPropertyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, staggerItem, glassCardVariants } from '@/lib/animations';

interface PropertiesViewProps {
  properties: Property[];
  onViewProperty: (id: string) => void;
  onAddProperty: (property: Property) => void;
}

export const PropertiesView = ({ properties, onViewProperty, onAddProperty }: PropertiesViewProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title={t('properties.title')}
        subtitle={t('properties.subtitle')}
      />
      
      <div className="px-6 relative z-10">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex items-center gap-3 px-4 py-3 mb-6"
        >
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text"
            placeholder={t('properties.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </motion.div>
        
        {/* Properties Grid */}
        <motion.div 
          className="grid grid-cols-1 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          <AnimatePresence>
            {filteredProperties.map((property) => (
              <motion.div key={property.id} variants={staggerItem}>
                <PropertyCard 
                  property={property}
                  onClick={onViewProperty}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredProperties.length === 0 && (
            <motion.div 
              variants={glassCardVariants}
              initial="initial"
              animate="enter"
              className="glass-panel p-8 text-center"
            >
              <p className="text-muted-foreground">{t('properties.noProperties')}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* FAB */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.1, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-secondary text-secondary-foreground rounded-2xl shadow-xl flex items-center justify-center z-50 md:right-[calc(50%-187.5px+24px)]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

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
