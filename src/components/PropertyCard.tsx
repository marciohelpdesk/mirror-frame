import { MapPin, Bed, Bath } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '@/types';

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
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
      className="glass-panel overflow-hidden cursor-pointer group"
      onClick={() => onClick(property.id)}
    >
      <div className="relative h-32 overflow-hidden">
        {property.photo ? (
          <motion.img 
            src={property.photo} 
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 flex items-center justify-center">
            <motion.span 
              className="text-4xl"
              animate={{ 
                y: [0, -4, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🏠
            </motion.span>
          </div>
        )}
        <motion.div 
          className={`absolute top-3 right-3 w-3 h-3 rounded-full ${statusColors[property.status]} shadow-lg`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors duration-200">
          {property.name}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
          <MapPin size={14} className="group-hover:text-primary/60 transition-colors" />
          <span className="truncate">{property.address}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms && (
            <motion.div 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Bed size={14} />
              <span>{property.bedrooms}</span>
            </motion.div>
          )}
          {property.bathrooms && (
            <motion.div 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Bath size={14} />
              <span>{property.bathrooms}</span>
            </motion.div>
          )}
          {property.basePrice && (
            <motion.span 
              className="ml-auto font-semibold text-primary"
              whileHover={{ scale: 1.05 }}
            >
              ${property.basePrice}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
