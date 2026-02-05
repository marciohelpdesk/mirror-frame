import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { AddPropertyModal } from '@/components/AddPropertyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

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
      <PageHeader 
        title={t('properties.title')}
        subtitle={t('properties.subtitle')}
      />
      
      <div className="px-6 relative z-10">
        {/* Search Bar */}
        <div className="glass-panel flex items-center gap-3 px-4 py-3 mb-6">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text"
            placeholder={t('properties.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              property={property}
              onClick={onViewProperty}
            />
          ))}
          
          {filteredProperties.length === 0 && (
            <div className="glass-panel p-8 text-center">
              <p className="text-muted-foreground">{t('properties.noProperties')}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-primary/40 active:scale-95 z-50 md:right-[calc(50%-187.5px+24px)]"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

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
