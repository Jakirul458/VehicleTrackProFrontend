import { useNavigate, useParams } from 'react-router-dom';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Customer form with React Hook Form and Zod validation will be implemented here.</p>
        <button
          onClick={() => navigate('/agent/customers')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to Customers
        </button>
      </div>
    </div>
  );
}
