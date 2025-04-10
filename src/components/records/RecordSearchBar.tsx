
import { Search, Filter, RefreshCw } from 'lucide-react';
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

interface RecordSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  clearFilters: () => void;
}

const RecordSearchBar = ({
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  showFilters,
  setShowFilters,
  clearFilters
}: RecordSearchBarProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search" 
              placeholder="Search by title, content..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            variant="secondary"
            onClick={clearFilters}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={departmentFilter} 
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordSearchBar;
