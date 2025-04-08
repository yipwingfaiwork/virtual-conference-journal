
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordsAPI } from '../services/api-service';
import { toast } from '@/hooks/use-toast';

export const useRecords = (filters = {}) => {
  const queryClient = useQueryClient();
  
  // Query for fetching all records
  const { data: records, isLoading, error } = useQuery({
    queryKey: ['records', filters],
    queryFn: () => RecordsAPI.getAll(filters),
  });
  
  // Mutation for creating a new record
  const createRecord = useMutation({
    mutationFn: (recordData: any) => RecordsAPI.create(recordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast({
        title: "Success",
        description: "Record created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create record",
        variant: "destructive",
      });
      console.error('Error creating record:', error);
    },
  });
  
  // Mutation for updating a record
  const updateRecord = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => RecordsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
      console.error('Error updating record:', error);
    },
  });
  
  // Mutation for deleting a record
  const deleteRecord = useMutation({
    mutationFn: (id: string) => RecordsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
      console.error('Error deleting record:', error);
    },
  });
  
  return {
    records,
    isLoading,
    error,
    createRecord: createRecord.mutate,
    updateRecord: updateRecord.mutate,
    deleteRecord: deleteRecord.mutate,
  };
};

// Hook for fetching a single record by ID
export const useRecord = (id: string) => {
  const { data: record, isLoading, error } = useQuery({
    queryKey: ['record', id],
    queryFn: () => RecordsAPI.getById(id),
    enabled: !!id,
  });
  
  return { record, isLoading, error };
};
