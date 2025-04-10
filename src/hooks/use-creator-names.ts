
import { useState, useEffect } from 'react';
import apiClient from '@/services/api-service';
import { ConferenceRecord } from '@/lib/types';

interface UserResponse {
  name?: string;
  [key: string]: any;
}

export const useCreatorNames = (records: ConferenceRecord[] | undefined) => {
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchCreatorNames = async () => {
      if (!records) return;
      
      const uniqueCreatorIds = [...new Set(records.map(record => record.createdBy))];
      const names: Record<string, string> = {};
      
      await Promise.all(
        uniqueCreatorIds.map(async (creatorId) => {
          try {
            const response = await apiClient.get(`/users/${creatorId}`);
            const userData = response.data as UserResponse;
            names[creatorId] = userData?.name || 'Unknown';
          } catch (error) {
            console.error(`Error fetching user ${creatorId}:`, error);
            names[creatorId] = 'Unknown';
          }
        })
      );
      
      setCreatorNames(names);
    };
    
    fetchCreatorNames();
  }, [records]);

  const getCreatorName = (userId: string): string => {
    return creatorNames[userId] || 'Unknown';
  };

  return { creatorNames, getCreatorName };
};
