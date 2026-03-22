'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/Select';
import { useWorkspace } from '@/libs/hooks/useWorkspace';
import { X } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  required?: boolean;
}

type WorkspaceType = "Construction" | "Software" | "Event" | "Other";

const workspaceTypes: { value: WorkspaceType; label: string }[] = [
  { value: 'Construction', label: 'Construction' },
  { value: 'Software', label: 'Software' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];

export default function CreateWorkspaceModal({ isOpen, onClose, required = false }: CreateWorkspaceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Software' as WorkspaceType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createWorkspace, switchWorkspace } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newWorkspace = await createWorkspace(formData);
      setFormData({ name: '', description: '', type: 'Software' });
      onClose();
      // automatically switch so the dashboard refreshes correctly
      switchWorkspace(newWorkspace);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{required ? 'Create Your First Workspace' : 'Create New Workspace'}</h2>
          {!required && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Workspace Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter workspace name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter workspace description"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkspaceType })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workspaceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            {!required && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}