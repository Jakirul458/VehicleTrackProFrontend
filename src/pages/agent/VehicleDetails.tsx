import { useParams, Link } from 'react-router-dom';

export default function VehicleDetails() {
  const { id } = useParams();

  return (
    <div>
      <Link to="/agent/vehicles" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
        ← Back to Vehicles
      </Link>
      <h1 className="text-3xl font-bold mb-8">Vehicle Details</h1>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Vehicle details with document expiry tracking will be displayed here.</p>
      </div>
    </div>
  );
}
