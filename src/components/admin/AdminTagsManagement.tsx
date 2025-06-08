
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { Tag } from '@/lib/types';
import apiClient from '@/services/api-service';
import { useToast } from '@/hooks/use-toast';

const AdminTagsManagement = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.post('/tags', newTag);
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
      setNewTag({ name: '', color: '#3B82F6', description: '' });
      setIsAdding(false);
      loadTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updatedTag: Partial<Tag>) => {
    try {
      await apiClient.put(`/tags/${id}`, updatedTag);
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
      setEditingTag(null);
      loadTags();
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await apiClient.delete(`/tags/${id}`);
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tags Management
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <Input
                placeholder="Tag name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
              <Input
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreate} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(false)} 
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  {editingTag === tag.id ? (
                    <Input
                      defaultValue={tag.name}
                      onBlur={(e) => handleUpdate(tag.id, { ...tag, name: e.target.value })}
                    />
                  ) : (
                    <span 
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: tag.color }}
                  />
                </TableCell>
                <TableCell>{tag.description}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingTag(editingTag === tag.id ? null : tag.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminTagsManagement;
