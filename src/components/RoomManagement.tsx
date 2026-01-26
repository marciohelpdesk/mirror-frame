import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Bed, 
  Bath, 
  UtensilsCrossed, 
  Sofa, 
  Utensils,
  Briefcase,
  WashingMachine,
  Car,
  LayoutGrid,
  X
} from 'lucide-react';
import { Room, RoomType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomManagementProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
  isEditing: boolean;
}

const ROOM_TYPES: { type: RoomType; icon: React.ElementType }[] = [
  { type: 'bedroom', icon: Bed },
  { type: 'bathroom', icon: Bath },
  { type: 'kitchen', icon: UtensilsCrossed },
  { type: 'living_room', icon: Sofa },
  { type: 'dining_room', icon: Utensils },
  { type: 'office', icon: Briefcase },
  { type: 'laundry', icon: WashingMachine },
  { type: 'garage', icon: Car },
  { type: 'other', icon: LayoutGrid },
];

const getRoomIcon = (type: RoomType) => {
  const roomType = ROOM_TYPES.find(rt => rt.type === type);
  return roomType?.icon || LayoutGrid;
};

export const RoomManagement = ({ rooms, onRoomsChange, isEditing }: RoomManagementProps) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    type: 'bedroom',
    name: '',
    size: undefined,
    notes: '',
  });

  const handleAddRoom = () => {
    if (!newRoom.name?.trim()) return;

    const room: Room = {
      id: `room-${Date.now()}`,
      type: newRoom.type || 'bedroom',
      name: newRoom.name.trim(),
      size: newRoom.size,
      notes: newRoom.notes?.trim() || undefined,
    };

    onRoomsChange([...rooms, room]);
    setNewRoom({ type: 'bedroom', name: '', size: undefined, notes: '' });
    setIsAdding(false);
  };

  const handleRemoveRoom = (roomId: string) => {
    onRoomsChange(rooms.filter(r => r.id !== roomId));
  };

  // Group rooms by type
  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.type]) {
      acc[room.type] = [];
    }
    acc[room.type].push(room);
    return acc;
  }, {} as Record<RoomType, Room[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <LayoutGrid size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('rooms.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('rooms.subtitle')}</p>
          </div>
        </div>
        {isEditing && !isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1"
          >
            <Plus size={14} />
            {t('rooms.add')}
          </Button>
        )}
      </div>

      {/* Add Room Form */}
      <AnimatePresence>
        {isAdding && isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-muted/30 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">{t('rooms.add')}</h4>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Room Type Selection */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">{t('propertyDetails.propertyType')}</p>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPES.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setNewRoom(prev => ({ ...prev, type }))}
                    className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-colors ${
                      newRoom.type === type
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-muted bg-muted/50 text-muted-foreground hover:border-secondary/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate w-full text-center">{t(`rooms.type.${type}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Name */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">{t('rooms.name')}</p>
              <Input
                value={newRoom.name || ''}
                onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t(`rooms.type.${newRoom.type || 'bedroom'}`)}
                className="bg-card/50 border-muted"
              />
            </div>

            {/* Room Size */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">{t('rooms.size')}</p>
              <Input
                type="number"
                min="0"
                value={newRoom.size || ''}
                onChange={(e) => setNewRoom(prev => ({ ...prev, size: parseInt(e.target.value) || undefined }))}
                placeholder="0"
                className="bg-card/50 border-muted"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddRoom}
                disabled={!newRoom.name?.trim()}
                className="flex-1 bg-secondary text-secondary-foreground"
              >
                {t('common.add')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room List */}
      {rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4">
          {t('rooms.empty')}
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedRooms).map(([type, typeRooms]) => {
            const Icon = getRoomIcon(type as RoomType);
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t(`rooms.type.${type}`)} ({typeRooms.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {typeRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 bg-card/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-secondary" />
                        <span className="text-sm text-foreground">{room.name}</span>
                        {room.size && (
                          <span className="text-xs text-muted-foreground">
                            ({room.size} sqft)
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveRoom(room.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
