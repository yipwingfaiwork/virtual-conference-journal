
import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Calendar, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchFilters, Tag as TagType, FinancialPeriod, User } from '@/lib/types';

interface EnhancedRecordSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  clearFilters: () => void;
  tags: TagType[];
  financialPeriods: FinancialPeriod[];
  users: User[];
  onCalendarView: () => void;
}

const EnhancedRecordSearchBar = ({
  filters,
  onFiltersChange,
  showFilters,
  setShowFilters,
  clearFilters,
  tags,
  financialPeriods,
  users,
  onCalendarView
}: EnhancedRecordSearchBarProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

  // Sync selectedTags with filters.tags when filters change
  useEffect(() => {
    setSelectedTags(filters.tags || []);
  }, [filters.tags]);

  const handleTagToggle = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    console.log('Tag toggle:', { tagId, newTags });
    setSelectedTags(newTags);
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleSearchChange = (value: string) => {
    console.log('Search term changed:', value);
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    console.log('Filter changed:', { key, value });
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search" 
              placeholder="Search by title, content, keywords..." 
              className="pl-8"
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className={showFilters ? "bg-teal/10" : ""}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={onCalendarView}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button 
            variant="secondary"
            onClick={clearFilters}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={filters.department || ''} 
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creator">Created By</Label>
                <Select 
                  value={filters.createdBy || ''} 
                  onValueChange={(value) => handleFilterChange('createdBy', value)}
                >
                  <SelectTrigger id="creator">
                    <SelectValue placeholder="Select creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financial-period">Financial Period</Label>
                <Select 
                  value={filters.financialPeriod || ''} 
                  onValueChange={(value) => handleFilterChange('financialPeriod', value)}
                >
                  <SelectTrigger id="financial-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Periods</SelectItem>
                    {financialPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-level">Access Level</Label>
                <Select 
                  value={filters.accessLevel || ''} 
                  onValueChange={(value) => handleFilterChange('accessLevel', value)}
                >
                  <SelectTrigger id="access-level">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="DEPARTMENT">Department</SelectItem>
                    <SelectItem value="RESTRICTED">Restricted</SelectItem>
                    <SelectItem value="CONFIDENTIAL">Confidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="datetime-local"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="datetime-local"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <Label>Tags</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRecordSearchBar;
