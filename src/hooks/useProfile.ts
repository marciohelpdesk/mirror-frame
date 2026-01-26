import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

interface DbProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const mapDbToProfile = (db: DbProfile): UserProfile => ({
  name: db.name,
  email: db.email,
  phone: db.phone || '',
  avatar: db.avatar_url || '',
  role: 'Cleaner', // Role comes from user_roles table
});

export const useProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return mapDbToProfile(data as DbProfile);
    },
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          avatar_url: profile.avatar,
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};
