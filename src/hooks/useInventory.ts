import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';

interface DbInventory {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
  reorder_photo: string | null;
  created_at: string;
  updated_at: string;
}

const mapDbToInventory = (db: DbInventory): InventoryItem => ({
  id: db.id,
  name: db.name,
  quantity: db.quantity,
  unit: db.unit,
  threshold: db.threshold,
  category: db.category,
  reorderPhoto: db.reorder_photo || undefined,
});

export const useInventory = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inventory', userId],
    queryFn: async (): Promise<InventoryItem[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return (data as DbInventory[]).map(mapDbToInventory);
    },
    enabled: !!userId,
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id'>) => {
      if (!userId) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          user_id: userId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          threshold: item.threshold,
          category: item.category,
          reorder_photo: item.reorderPhoto || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToInventory(data as DbInventory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('inventory')
        .update({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          threshold: item.threshold,
          category: item.category,
          reorder_photo: item.reorderPhoto || null,
        })
        .eq('id', item.id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  return {
    inventory: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
    isAdding: addItem.isPending,
    isUpdating: updateItem.isPending,
    isDeleting: deleteItem.isPending,
  };
};
