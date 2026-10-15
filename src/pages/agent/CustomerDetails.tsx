import { useParams, Link } from 'react-router-dom';

export default function CustomerDetails() {
  const { id } = useParams();

  return (
    <div>
      <Link to="/agent/customers" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
        ← Back to Customers
      </Link>
      <h1 className="text-3xl font-bold mb-8">Customer Details</h1>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Customer details with vehicle list will be displayed here.</p>
      </div>
    </div>
  );
}
