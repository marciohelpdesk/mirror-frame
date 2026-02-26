import { MapPin, Bed, Bath, ChevronRight, CalendarCheck, Clock } from 'lucide-react';
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
        className="glass-panel overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        onClick={() => onClick(property.id)}
      >
        {/* Image Section */}
        <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
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
          
          {/* Gradient overlay at bottom for readability */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full ${status.color} text-primary-foreground text-[10px] font-bold shadow-lg flex items-center gap-1 uppercase tracking-wider`}>
              {status.icon} {status.label}
            </span>
          </div>

          {/* Property specs overlay - positioned safely */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            {property.bedrooms !== undefined && (
              <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-foreground flex items-center gap-1 shadow-sm">
                <Bed size={11} /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms !== undefined && (
              <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-foreground flex items-center gap-1 shadow-sm">
                <Bath size={11} /> {property.bathrooms}
              </span>
            )}
            {property.basePrice && (
              <span className="ml-auto px-2.5 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-[11px] font-bold text-primary-foreground shadow-sm">
                ${property.basePrice}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-bold text-foreground text-base mb-1 truncate">{property.name}</h3>
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>

          {/* Service type info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/30 border border-primary/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shrink-0 shadow-md shadow-primary/20">
              <CalendarCheck size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Serviço</p>
              <p className="font-semibold text-foreground text-xs truncate">
                {property.serviceType}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-card/80 flex items-center justify-center text-primary shrink-0 shadow-sm border border-border/30">
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center mt-3">
            <span className="px-3 py-1.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold flex items-center gap-1.5 border border-primary/10">
              <Clock size={11} /> {property.type}
            </span>
          </div>
        </div>
      </motion.article>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
