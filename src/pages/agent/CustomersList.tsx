import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function CustomersList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link
          to="/agent/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Customer list with search and filtering will be implemented here.</p>
      </div>
    </div>
  );
}
