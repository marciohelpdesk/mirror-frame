import { MapPin, Bed, Bath } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

export const PropertyCard = forwardRef<HTMLDivElement, PropertyCardProps>(
  ({ property, onClick }, ref) => {
    const statusColors = {
      READY: 'bg-success',
      NEEDS_CLEANING: 'bg-warning',
      OCCUPIED: 'bg-muted-foreground',
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="glass-panel overflow-hidden cursor-pointer group"
        onClick={() => onClick(property.id)}
      >
        <div className="relative h-32 overflow-hidden">
          {property.photo ? (
            <img 
              src={property.photo} 
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
          )}
          <div 
            className={`absolute top-3 right-3 w-3 h-3 rounded-full ${statusColors[property.status]} shadow-lg`}
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
            <MapPin size={14} />
            <span className="truncate">{property.address}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath size={14} />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.basePrice && (
              <span className="ml-auto font-semibold text-primary">
                ${property.basePrice}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
