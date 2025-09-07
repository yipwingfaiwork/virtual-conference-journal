
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SearchFilters, Tag, FinancialPeriod } from '@/lib/types';

interface User {
  id: string;
  name: string;
  departmentName: string;
  isManager?: boolean;
}

interface RecordsSubMenuProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  tags: Tag[];
  financialPeriods: FinancialPeriod[];
  users: User[];
  departments: { id: string; name: string; }[];
}

const RecordsSubMenu = ({
  filters,
  onFiltersChange,
  tags,
  financialPeriods,
  users,
  departments
}: RecordsSubMenuProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['departments']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof SearchFilters];
    onFiltersChange(newFilters);
  };

  const getDateRangeFilters = () => [
    { label: 'Today', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { dateFrom: `${today}T00:00`, dateTo: `${today}T23:59` };
    }},
    { label: 'This Week', getValue: () => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
      return {
        dateFrom: startOfWeek.toISOString().split('T')[0] + 'T00:00',
        dateTo: endOfWeek.toISOString().split('T')[0] + 'T23:59'
      };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        dateFrom: startOfMonth.toISOString().split('T')[0] + 'T00:00',
        dateTo: endOfMonth.toISOString().split('T')[0] + 'T23:59'
      };
    }}
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filter Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 border-b">
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => clearFilter(key)}
                  >
                    {key}: {Array.isArray(value) ? value.join(', ') : String(value)} ×
                  </Badge>
                )
              ))}
            </div>
          )}

          {/* Date Range Filters */}
          <Collapsible 
            open={openSections.includes('dates')} 
            onOpenChange={() => toggleSection('dates')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-medium">Date Range</span>
                {openSections.includes('dates') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {getDateRangeFilters().map((dateFilter) => (
                <Button
                  key={dateFilter.label}
                  variant="outline"
                  size="sm"
                  className="mr-2 mb-2"
                  onClick={() => onFiltersChange({ ...filters, ...dateFilter.getValue() })}
                >
                  {dateFilter.label}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Departments */}
          <Collapsible 
            open={openSections.includes('departments')} 
            onOpenChange={() => toggleSection('departments')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-medium">Departments</span>
                {openSections.includes('departments') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={filters.department === dept.id ? "default" : "outline"}
                  size="sm"
                  className="mr-2 mb-2"
                  onClick={() => handleFilterChange('department', 
                    filters.department === dept.id ? undefined : dept.id
                  )}
                >
                  {dept.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Users */}
          <Collapsible 
            open={openSections.includes('users')} 
            onOpenChange={() => toggleSection('users')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-medium">Created By</span>
                {openSections.includes('users') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant={filters.createdBy === user.id ? "default" : "outline"}
                  size="sm"
                  className="mr-2 mb-2"
                  onClick={() => handleFilterChange('createdBy', 
                    filters.createdBy === user.id ? undefined : user.id
                  )}
                >
                  {user.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Tags */}
          {tags.length > 0 && (
            <Collapsible 
              open={openSections.includes('tags')} 
              onOpenChange={() => toggleSection('tags')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="font-medium">Tags</span>
                  {openSections.includes('tags') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={filters.tags?.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    className="mr-2 mb-2"
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      const newTags = currentTags.includes(tag.id)
                        ? currentTags.filter(id => id !== tag.id)
                        : [...currentTags, tag.id];
                      handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Financial Periods */}
          {financialPeriods.length > 0 && (
            <Collapsible 
              open={openSections.includes('periods')} 
              onOpenChange={() => toggleSection('periods')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="font-medium">Financial Periods</span>
                  {openSections.includes('periods') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {financialPeriods.map((period) => (
                  <Button
                    key={period.id}
                    variant={filters.financialPeriod === period.id ? "default" : "outline"}
                    size="sm"
                    className="mr-2 mb-2"
                    onClick={() => handleFilterChange('financialPeriod', 
                      filters.financialPeriod === period.id ? undefined : period.id
                    )}
                  >
                    {period.name}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordsSubMenu;
