import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '@/api';
import { toast } from 'sonner';

export default function AgentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await adminApi.agents.update(id!, {});
        toast.success('Agent updated successfully');
      } else {
        await adminApi.agents.create({
          fullName: '',
          businessName: '',
          email: '',
          phone: '',
          password: '',
          status: 'ACTIVE',
        });
        toast.success('Agent created successfully');
      }
      navigate('/admin/agents');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update agent' : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Agent' : 'Create Agent'}</h1>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground mb-4">Agent form will be implemented with React Hook Form and Zod validation.</p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </div>
  );
}
