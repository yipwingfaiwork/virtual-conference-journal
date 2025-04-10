
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { useRecords } from '@/hooks/use-records';
import { useCreatorNames } from '@/hooks/use-creator-names';
import RecordHeader from '@/components/records/RecordHeader';
import RecordSearchBar from '@/components/records/RecordSearchBar';
import RecordsTable from '@/components/records/RecordsTable';
import { ConferenceRecord } from '@/lib/types';

const RecordsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<ConferenceRecord[]>([]);
  
  // Fetch records from API using our hook
  const { records, isLoading, error } = useRecords({
    department: departmentFilter !== 'all' ? departmentFilter : undefined
  });
  
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
    
    fetchUser();
    
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search, navigate]);
  
  // Filter records when search/filters change
  useEffect(() => {
    if (!records) {
      setFilteredRecords([]);
      return;
    }
    
    let results = [...records];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => 
        record.title.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term) ||
        record.textRecord.toLowerCase().includes(term)
      );
    }
    
    setFilteredRecords(results);
  }, [records, searchTerm]);
  
  if (!user) {
    return null;
  }
  
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <RecordHeader />
      
      <RecordSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
      />
      
      <RecordsTable 
        records={filteredRecords}
        isLoading={isLoading}
        error={error}
        getCreatorName={getCreatorName}
      />
    </div>
  );
};

export default RecordsPage;
