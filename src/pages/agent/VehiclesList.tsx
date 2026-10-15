import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Shield, Edit } from 'lucide-react';
import { vehicleApi } from '@/api';
import { StatusBadge } from '@/components/common';
import { formatDate, getExpiryStatus } from '@/lib/expiry';
import type { Vehicle } from '@/types';

export default function VehiclesList() {
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.list(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Link
          to="/agent/vehicles/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Vehicle</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Insurance</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Tax</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles && vehicles.length > 0 ? (
                vehicles.map((vehicle) => {
                  const insuranceStatus = getExpiryStatus(vehicle.documents.insuranceExpiryDate);
                  const taxStatus = getExpiryStatus(vehicle.documents.roadTaxExpiryDate);
                  
                  return (
                    <tr key={vehicle.id} className="border-t">
                      <td className="px-6 py-4">
                        <div className="font-medium">{vehicle.registrationNumber}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.vehicleMake} {vehicle.vehicleModel}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{vehicle.ownerName}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span>{formatDate(vehicle.documents.insuranceExpiryDate)}</span>
                            <StatusBadge status={insuranceStatus} label={insuranceStatus === 'INCOMPLETE' ? 'Not set' : undefined} />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.documents.insuranceProvider || 'No Provider'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Mobile: {vehicle.documents.insuranceMobileNo || 'N/A'}
                          </div>
                          <div className="text-xs space-x-2">
                            <span>Premium: ₹{vehicle.documents.insurancePremium || 0}</span>
                            <span>Paid: ₹{vehicle.documents.insuranceCustomerPaid || 0}</span>
                            <span>Comm: ₹{vehicle.documents.insuranceCommission || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span>{formatDate(vehicle.documents.roadTaxExpiryDate)}</span>
                            <StatusBadge status={taxStatus} label={taxStatus === 'INCOMPLETE' ? 'Not set' : undefined} />
                          </div>
                          <div className="text-xs space-x-2">
                            <span>Amount: ₹{vehicle.documents.roadTaxAmount || 0}</span>
                            <span>Paid: ₹{vehicle.documents.roadTaxCustomerPaid || 0}</span>
                            <span>Profit: ₹{vehicle.documents.roadTaxProfit || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/agent/vehicles/${vehicle.id}`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="View"
                          >
                            <Shield className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/agent/vehicles/${vehicle.id}/edit`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No vehicles found. Add your first vehicle to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
