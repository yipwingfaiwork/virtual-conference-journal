
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { useRecords } from '@/hooks/use-records';
import { useCreatorNames } from '@/hooks/use-creator-names';
import { SearchFilters, Tag, FinancialPeriod, User, CalendarEvent } from '@/lib/types';
import apiClient from '@/services/api-service';
import RecordHeader from '@/components/records/RecordHeader';
import EnhancedRecordSearchBar from '@/components/records/EnhancedRecordSearchBar';
import RecordsTable from '@/components/records/RecordsTable';
import CalendarView from '@/components/records/CalendarView';

const RecordsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [tags, setTags] = useState<Tag[]>([]);
  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch records from API using our hook
  const { records, isLoading, error } = useRecords(filters);
  
  // Get creator names using our custom hook
  const { getCreatorName } = useCreatorNames(records);
  
  // Parse search query from URL
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
    };
    
    const fetchDropdownData = async () => {
      try {
        const [tagsRes, periodsRes, usersRes] = await Promise.all([
          apiClient.get('/tags'),
          apiClient.get('/financial-periods'),
          apiClient.get('/users')
        ]);
        
        setTags(tagsRes.data);
        setFinancialPeriods(periodsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    
    fetchUser();
    fetchDropdownData();
    
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    if (search) {
      setFilters(prev => ({ ...prev, searchTerm: search }));
    }
  }, [location.search, navigate]);
  
  if (!user) {
    return null;
  }
  
  const clearFilters = () => {
    setFilters({});
  };

  const handleCalendarView = () => {
    setViewMode(viewMode === 'calendar' ? 'table' : 'calendar');
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/records/${eventId}`);
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setFilters(prev => ({ 
      ...prev, 
      dateFrom: dateString + 'T00:00',
      dateTo: dateString + 'T23:59'
    }));
    setViewMode('table');
  };

  // Convert records to calendar events
  const calendarEvents: CalendarEvent[] = records ? records.map(record => ({
    id: record.id,
    title: record.title,
    date: record.date,
    duration: record.duration,
    department: record.department,
    tags: record.tags || [],
    accessLevel: record.accessLevel
  })) : [];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <RecordHeader />
      
      <EnhancedRecordSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        tags={tags}
        financialPeriods={financialPeriods}
        users={users}
        onCalendarView={handleCalendarView}
      />
      
      {viewMode === 'calendar' ? (
        <CalendarView 
          events={calendarEvents}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />
      ) : (
        <RecordsTable 
          records={records || []}
          isLoading={isLoading}
          error={error}
          getCreatorName={getCreatorName}
        />
      )}
    </div>
  );
};

export default RecordsPage;
