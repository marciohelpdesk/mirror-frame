import { MapPin, Bed, Bath, Heart, ChevronRight, CalendarCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

export const PropertyCard = forwardRef<HTMLDivElement, PropertyCardProps>(
  ({ property, onClick }, ref) => {
    const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
      READY: { label: 'Ativa', color: 'bg-success', icon: '✓' },
      NEEDS_CLEANING: { label: 'Manutenção', color: 'bg-warning', icon: '⚠' },
      OCCUPIED: { label: 'Ocupada', color: 'bg-destructive', icon: '●' },
    };

    const status = statusConfig[property.status] || statusConfig.READY;

    return (
      <motion.article
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50 cursor-pointer group hover:-translate-y-2 hover:shadow-xl transition-all duration-400"
        onClick={() => onClick(property.id)}
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {property.photo ? (
            <img 
              src={property.photo} 
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 flex items-center justify-center">
              <span className="text-5xl">🏠</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-full ${status.color} text-primary-foreground text-xs font-semibold shadow-lg flex items-center gap-1`}>
              {status.icon} {status.label}
            </span>
          </div>

          {/* Property specs overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            {property.bedrooms !== undefined && (
              <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-foreground flex items-center gap-1">
                <Bed size={12} /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms !== undefined && (
              <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-foreground flex items-center gap-1">
                <Bath size={12} /> {property.bathrooms}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-lg mb-1 truncate">{property.name}</h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="truncate">{property.address}</span>
              </p>
            </div>
            {property.basePrice && (
              <div className="text-right shrink-0 ml-3">
                <p className="text-2xl font-bold text-primary">${property.basePrice}</p>
                <p className="text-[10px] text-muted-foreground">por limpeza</p>
              </div>
            )}
          </div>

          {/* Next cleaning info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/5 to-success/5 border border-primary/10 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shrink-0">
              <CalendarCheck size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Status</p>
              <p className="font-semibold text-foreground text-sm truncate">
                {property.serviceType}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm">
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                <Clock size={12} /> {property.type}
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
