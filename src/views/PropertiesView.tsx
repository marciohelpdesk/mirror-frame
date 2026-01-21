import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { AddPropertyModal } from '@/components/AddPropertyModal';

interface PropertiesViewProps {
  properties: Property[];
  onViewProperty: (id: string) => void;
  onAddProperty: (property: Property) => void;
}

export const PropertiesView = ({ properties, onViewProperty, onAddProperty }: PropertiesViewProps) => {
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
        title="Properties"
        subtitle="Manage Locations"
      />
      
      <div className="px-6 relative z-10">
        {/* Search Bar */}
        <div className="glass-panel flex items-center gap-3 px-4 py-3 mb-6">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-4">
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
              className="glass-panel p-8 text-center"
            >
              <p className="text-muted-foreground">No properties found</p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-secondary text-secondary-foreground rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 md:right-[calc(50%-187.5px+24px)]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={onAddProperty}
      />
    </div>
  );
};
