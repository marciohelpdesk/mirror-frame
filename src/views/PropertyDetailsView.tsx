import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Key, 
  Wifi, 
  FileText, 
  MapPin, 
  Home, 
  Edit2, 
  Save, 
  X,
  Bed,
  Bath,
  Square,
  Package,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Mail,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Property } from '@/types';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PropertyDetailsViewProps {
  property: Property;
  onBack: () => void;
  onUpdate: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

export const PropertyDetailsView = ({ property, onBack, onUpdate, onDelete }: PropertyDetailsViewProps) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property>(property);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(property.id);
  };

  const handleSave = () => {
    onUpdate(editedProperty);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProperty(property);
    setIsEditing(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors: Record<Property['status'], string> = {
    'READY': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'NEEDS_CLEANING': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'OCCUPIED': 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  };

  const statusLabels: Record<Property['status'], string> = {
    'READY': 'Ready',
    'NEEDS_CLEANING': 'Needs Cleaning',
    'OCCUPIED': 'Occupied'
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-panel border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          
          <h1 className="text-lg font-semibold text-foreground">Property Details</h1>
          
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={handleCancel}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                <Save size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Edit2 size={20} className="text-secondary" />
            </button>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-4 relative z-10">
        {/* Property Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel overflow-hidden"
        >
          {property.photo ? (
            <div className="h-48 bg-gradient-to-br from-secondary/20 to-accent/20 relative">
              <img src={property.photo} alt={property.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProperty.name}
                    onChange={(e) => setEditedProperty({...editedProperty, name: e.target.value})}
                    className="text-2xl font-bold text-white bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 w-full border border-white/30 focus:outline-none focus:border-secondary"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{property.name}</h2>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center relative">
              <Home size={64} className="text-secondary/50" />
              <div className="absolute bottom-4 left-4 right-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProperty.name}
                    onChange={(e) => setEditedProperty({...editedProperty, name: e.target.value})}
                    className="text-2xl font-bold text-white bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 w-full border border-white/30 focus:outline-none focus:border-secondary"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{property.name}</h2>
                )}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start gap-2 mb-3">
              <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedProperty.address}
                  onChange={(e) => setEditedProperty({...editedProperty, address: e.target.value})}
                  className="flex-1 text-sm text-muted-foreground bg-white/10 rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:border-secondary"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{property.address}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {isEditing ? (
                <div className="w-full space-y-3">
                  {/* Status Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">{t('propertyDetails.status')}</label>
                    <select
                      value={editedProperty.status}
                      onChange={(e) => setEditedProperty({...editedProperty, status: e.target.value as Property['status']})}
                      className="bg-background/80 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    >
                      <option value="READY">{t('propertyDetails.statusReady')}</option>
                      <option value="NEEDS_CLEANING">{t('propertyDetails.statusNeedsCleaning')}</option>
                      <option value="OCCUPIED">{t('propertyDetails.statusOccupied')}</option>
                    </select>
                  </div>
                  {/* Property Type Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">{t('propertyDetails.propertyType')}</label>
                    <select
                      value={editedProperty.type}
                      onChange={(e) => setEditedProperty({...editedProperty, type: e.target.value as Property['type']})}
                      className="bg-background/80 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    >
                      <option value="Apartment">{t('propertyDetails.typeApartment')}</option>
                      <option value="House">{t('propertyDetails.typeHouse')}</option>
                      <option value="Villa">{t('propertyDetails.typeVilla')}</option>
                      <option value="Loft">{t('propertyDetails.typeLoft')}</option>
                      <option value="Studio">{t('propertyDetails.typeStudio')}</option>
                    </select>
                  </div>
                  {/* Service Type Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">{t('propertyDetails.serviceType')}</label>
                    <select
                      value={editedProperty.serviceType}
                      onChange={(e) => setEditedProperty({...editedProperty, serviceType: e.target.value as Property['serviceType']})}
                      className="bg-background/80 rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    >
                      <option value="House Cleaning">{t('propertyDetails.serviceHouseCleaning')}</option>
                      <option value="Deep Cleaning">{t('propertyDetails.serviceDeepCleaning')}</option>
                      <option value="Airbnb Cleaning">{t('propertyDetails.serviceAirbnbCleaning')}</option>
                      <option value="Move in/Out">{t('propertyDetails.serviceMoveInOut')}</option>
                      <option value="Recurring Cleaning">{t('propertyDetails.serviceRecurringCleaning')}</option>
                      <option value="Commercial Cleaning">{t('propertyDetails.serviceCommercialCleaning')}</option>
                      <option value="Office Cleaning">{t('propertyDetails.serviceOfficeCleaning')}</option>
                      <option value="Post Construction">{t('propertyDetails.servicePostConstruction')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[property.status]}`}>
                    {statusLabels[property.status]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
                    {property.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                    {property.serviceType}
                  </span>
                </>
              )}
            </div>
            
            {/* Property Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              {isEditing ? (
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Bed size={12} /> {t('propertyDetails.beds')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editedProperty.bedrooms || ''}
                      onChange={(e) => setEditedProperty({...editedProperty, bedrooms: parseInt(e.target.value) || undefined})}
                      className="bg-background/80 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Bath size={12} /> {t('propertyDetails.baths')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editedProperty.bathrooms || ''}
                      onChange={(e) => setEditedProperty({...editedProperty, bathrooms: parseInt(e.target.value) || undefined})}
                      className="bg-background/80 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Square size={12} /> {t('propertyDetails.sqft')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editedProperty.sqft || ''}
                      onChange={(e) => setEditedProperty({...editedProperty, sqft: parseInt(e.target.value) || undefined})}
                      className="bg-background/80 rounded-lg px-2 py-1.5 text-sm border border-white/20 focus:outline-none focus:border-secondary text-foreground"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Bed size={16} className="text-secondary" />
                      <span className="text-sm text-foreground">{property.bedrooms} {t('propertyDetails.beds').toLowerCase()}</span>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Bath size={16} className="text-secondary" />
                      <span className="text-sm text-foreground">{property.bathrooms} {t('propertyDetails.baths').toLowerCase()}</span>
                    </div>
                  )}
                  {property.sqft !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Square size={16} className="text-secondary" />
                      <span className="text-sm text-foreground">{property.sqft} {t('propertyDetails.sqft').toLowerCase()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Access Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Key size={20} className="text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Access Code</h3>
              <p className="text-xs text-muted-foreground">Door lock or keypad code</p>
            </div>
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editedProperty.accessCode || ''}
              onChange={(e) => setEditedProperty({...editedProperty, accessCode: e.target.value})}
              placeholder="Enter access code..."
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
            />
          ) : property.accessCode ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 font-mono text-foreground">
                {showAccessCode ? property.accessCode : '••••••'}
              </div>
              <button 
                onClick={() => setShowAccessCode(!showAccessCode)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {showAccessCode ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
              </button>
              <button 
                onClick={() => copyToClipboard(property.accessCode!, 'access')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {copiedField === 'access' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-muted-foreground" />}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No access code set</p>
          )}
        </motion.div>
        
        {/* WiFi Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wifi size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">WiFi Password</h3>
              <p className="text-xs text-muted-foreground">Network credentials</p>
            </div>
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editedProperty.wifiPassword || ''}
              onChange={(e) => setEditedProperty({...editedProperty, wifiPassword: e.target.value})}
              placeholder="Enter WiFi password..."
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
            />
          ) : property.wifiPassword ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 font-mono text-foreground">
                {showWifiPassword ? property.wifiPassword : '••••••••'}
              </div>
              <button 
                onClick={() => setShowWifiPassword(!showWifiPassword)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {showWifiPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
              </button>
              <button 
                onClick={() => copyToClipboard(property.wifiPassword!, 'wifi')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {copiedField === 'wifi' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-muted-foreground" />}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No WiFi password set</p>
          )}
        </motion.div>
        
        {/* Supplies Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Package size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Supplies Location</h3>
              <p className="text-xs text-muted-foreground">Where to find cleaning supplies</p>
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={editedProperty.suppliesLocation || ''}
              onChange={(e) => setEditedProperty({...editedProperty, suppliesLocation: e.target.value})}
              placeholder="Describe where supplies are located..."
              rows={2}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary resize-none"
            />
          ) : property.suppliesLocation ? (
            <p className="text-sm text-foreground">{property.suppliesLocation}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No location specified</p>
          )}
        </motion.div>
        
        {/* Cleaning Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FileText size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Cleaning Notes</h3>
              <p className="text-xs text-muted-foreground">Special instructions & reminders</p>
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={editedProperty.notes || ''}
              onChange={(e) => setEditedProperty({...editedProperty, notes: e.target.value})}
              placeholder="Add cleaning notes and special instructions..."
              rows={4}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary resize-none"
            />
          ) : property.notes ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{property.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes added</p>
          )}
        </motion.div>
        
        {/* Client Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Mail size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Email do Cliente</h3>
              <p className="text-xs text-muted-foreground">Para envio de relatórios</p>
            </div>
          </div>
          
          {isEditing ? (
            <input
              type="email"
              value={editedProperty.clientEmail || ''}
              onChange={(e) => setEditedProperty({...editedProperty, clientEmail: e.target.value})}
              placeholder="cliente@email.com"
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
            />
          ) : property.clientEmail ? (
            <p className="text-sm text-foreground">{property.clientEmail}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum email cadastrado</p>
          )}
        </motion.div>
        
        {(property.manualUrl || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ExternalLink size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">House Manual</h3>
                <p className="text-xs text-muted-foreground">External documentation link</p>
              </div>
            </div>
            
            {isEditing ? (
              <input
                type="url"
                value={editedProperty.manualUrl || ''}
                onChange={(e) => setEditedProperty({...editedProperty, manualUrl: e.target.value})}
                placeholder="https://..."
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
              />
            ) : property.manualUrl ? (
              <a 
                href={property.manualUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary hover:underline"
              >
                <span className="text-sm truncate">{property.manualUrl}</span>
                <ExternalLink size={14} />
              </a>
            ) : null}
          </motion.div>
        )}
        
        {/* Base Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{t('propertyDetails.basePrice')}</h3>
              <p className="text-xs text-muted-foreground">{t('propertyDetails.standardRate')}</p>
            </div>
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-foreground">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedProperty.basePrice || ''}
                onChange={(e) => setEditedProperty({...editedProperty, basePrice: parseFloat(e.target.value) || undefined})}
                placeholder="0.00"
                className="flex-1 bg-background/80 rounded-lg px-3 py-2 text-foreground border border-white/20 focus:outline-none focus:border-secondary"
              />
            </div>
          ) : property.basePrice ? (
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-400">${property.basePrice.toFixed(2)}</p>
              {property.lastCleaned && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('propertyDetails.lastCleaned')}</p>
                  <p className="text-sm font-medium text-foreground">{property.lastCleaned}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t('propertyDetails.noPrice')}</p>
          )}
        </motion.div>

        {/* Delete Property Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full py-4 text-destructive font-bold text-xs uppercase tracking-widest hover:text-destructive/80 transition-colors flex items-center justify-center gap-2 glass-panel"
          >
            <Trash2 size={16} />
            Delete Property
          </button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-panel border-destructive/20 max-w-[340px] mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-foreground">Delete Property?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to delete <span className="font-semibold text-foreground">{property.name}</span>? 
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Property
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-0 bg-muted text-foreground hover:bg-muted/80">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
