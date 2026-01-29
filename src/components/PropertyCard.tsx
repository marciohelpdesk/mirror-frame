import { MapPin, Bed, Bath } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '@/types';
import { staggerItem, cardHover } from '@/lib/animations';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const statusColors = {
    READY: 'bg-success',
    NEEDS_CLEANING: 'bg-warning',
    OCCUPIED: 'bg-muted-foreground',
  };

  return (
    <motion.div
      variants={{ ...staggerItem, ...cardHover }}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      layout
      className="glass-panel overflow-hidden cursor-pointer"
      onClick={() => onClick(property.id)}
    >
      <div className="relative h-32 overflow-hidden">
        {property.photo ? (
          <motion.img 
            src={property.photo} 
            alt={property.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span 
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            >
              🏠
            </motion.span>
          </motion.div>
        )}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
          className={`absolute top-3 right-3 w-3 h-3 rounded-full ${statusColors[property.status]} shadow-lg`} 
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-foreground text-lg leading-tight mb-1">
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
            <motion.span 
              className="ml-auto font-medium text-primary"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              ${property.basePrice}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
