import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

interface DbEmployee {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

const mapDbToEmployee = (db: DbEmployee): Employee => ({
  id: db.id,
  name: db.name,
  avatar: db.avatar_url || '',
});

export const useEmployees = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['employees', userId],
    queryFn: async (): Promise<Employee[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data as DbEmployee[]).map(mapDbToEmployee);
    },
    enabled: !!userId,
  });

  const addEmployee = useMutation({
    mutationFn: async (employee: Omit<Employee, 'id'>) => {
      if (!userId) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('employees')
        .insert({
          user_id: userId,
          name: employee.name,
          avatar_url: employee.avatar || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToEmployee(data as DbEmployee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', userId] });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', userId] });
    },
  });

  return {
    employees: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addEmployee: addEmployee.mutate,
    deleteEmployee: deleteEmployee.mutate,
    isAdding: addEmployee.isPending,
    isDeleting: deleteEmployee.isPending,
  };
};
