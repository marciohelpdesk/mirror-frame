import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, Room, ChecklistSection } from '@/types';
import { Json } from '@/integrations/supabase/types';

interface DbProperty {
  id: string;
  user_id: string;
  name: string;
  address: string;
  type: string;
  service_type: string;
  access_code: string | null;
  wifi_password: string | null;
  notes: string | null;
  supplies_location: string | null;
  photo_url: string | null;
  last_cleaned: string | null;
  base_price: number | null;
  status: string;
  manual_url: string | null;
  client_email: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  rooms: Json;
  checklist_template: Json;
  created_at: string;
  updated_at: string;
}

const mapDbToProperty = (db: DbProperty): Property => ({
  id: db.id,
  name: db.name,
  address: db.address,
  type: db.type as Property['type'],
  serviceType: db.service_type as Property['serviceType'],
  accessCode: db.access_code || undefined,
  wifiPassword: db.wifi_password || undefined,
  notes: db.notes || undefined,
  suppliesLocation: db.supplies_location || undefined,
  photo: db.photo_url || undefined,
  lastCleaned: db.last_cleaned || undefined,
  basePrice: db.base_price || undefined,
  status: db.status as Property['status'],
  manualUrl: db.manual_url || undefined,
  clientEmail: db.client_email || undefined,
  bedrooms: db.bedrooms || undefined,
  bathrooms: db.bathrooms || undefined,
  sqft: db.sqft || undefined,
  rooms: (db.rooms as unknown as Room[]) || [],
  checklistTemplate: (db.checklist_template as unknown as ChecklistSection[]) || [],
});

const mapPropertyToDb = (property: Partial<Property>, userId: string): Partial<DbProperty> => ({
  user_id: userId,
  name: property.name,
  address: property.address,
  type: property.type,
  service_type: property.serviceType,
  access_code: property.accessCode || null,
  wifi_password: property.wifiPassword || null,
  notes: property.notes || null,
  supplies_location: property.suppliesLocation || null,
  photo_url: property.photo || null,
  last_cleaned: property.lastCleaned || null,
  base_price: property.basePrice || null,
  status: property.status,
  manual_url: property.manualUrl || null,
  client_email: property.clientEmail || null,
  bedrooms: property.bedrooms || null,
  bathrooms: property.bathrooms || null,
  sqft: property.sqft || null,
  rooms: (property.rooms || []) as unknown as Json,
  checklist_template: (property.checklistTemplate || []) as unknown as Json,
});

export const useProperties = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['properties', userId],
    queryFn: async (): Promise<Property[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as DbProperty[]).map(mapDbToProperty);
    },
    enabled: !!userId,
  });

  const addProperty = useMutation({
    mutationFn: async (property: Omit<Property, 'id'>) => {
      if (!userId) throw new Error('No user ID');
      
      const dbData = mapPropertyToDb(property, userId);
      const { data, error } = await supabase
        .from('properties')
        .insert(dbData as any)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToProperty(data as DbProperty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', userId] });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async (property: Property) => {
      if (!userId) throw new Error('No user ID');
      
      const { id, ...rest } = property;
      const dbData = mapPropertyToDb(rest, userId);
      
      const { error } = await supabase
        .from('properties')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', userId] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', userId] });
    },
  });

  return {
    properties: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addProperty: addProperty.mutate,
    updateProperty: updateProperty.mutate,
    deleteProperty: deleteProperty.mutate,
    isAdding: addProperty.isPending,
    isUpdating: updateProperty.isPending,
    isDeleting: deleteProperty.isPending,
  };
};
