import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/api';
import { toast } from 'sonner';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerId: '',
    registrationNumber: '',
    vehicleType: 'CAR' as const,
    vehicleMake: '',
    vehicleModel: '',
    vehicleVariant: '',
    manufacturingYear: new Date().getFullYear(),
    fuelType: 'PETROL' as const,
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    // Insurance fields
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceStartDate: '',
    insuranceExpiryDate: '',
    insuranceMobileNo: '',
    insurancePremium: '',
    insurancePayToPortal: '',
    insuranceCustomerPaid: '',
    insuranceCommission: '',
    // Tax fields
    roadTaxStartDate: '',
    roadTaxExpiryDate: '',
    roadTaxAmount: '',
    roadTaxCustomerPaid: '',
    roadTaxProfit: '',
    // PUC fields
    pucNumber: '',
    pucStartDate: '',
    pucExpiryDate: '',
    // Fitness fields
    fitnessStartDate: '',
    fitnessExpiryDate: '',
    // Permit fields
    permitNumber: '',
    permitStartDate: '',
    permitExpiryDate: '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEdit) {
        return vehicleApi.update(id!, data);
      }
      return vehicleApi.create(data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Vehicle updated successfully' : 'Vehicle created successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      navigate('/agent/vehicles');
    },
    onError: () => {
      toast.error(isEdit ? 'Failed to update vehicle' : 'Failed to create vehicle');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-lg p-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select Customer</option>
                {/* Customer options will be loaded */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Registration Number *</label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="WB 56 AB 1234"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Type *</label>
              <select
                required
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="THREE_WHEELER">Three Wheeler</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Make *</label>
              <input
                type="text"
                required
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Maruti"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input
                type="text"
                required
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Swift"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Variant</label>
              <input
                type="text"
                value={formData.vehicleVariant}
                onChange={(e) => setFormData({ ...formData, vehicleVariant: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="LXi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Manufacturing Year *</label>
              <input
                type="number"
                required
                min={1900}
                max={new Date().getFullYear() + 1}
                value={formData.manufacturingYear}
                onChange={(e) => setFormData({ ...formData, manufacturingYear: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fuel Type *</label>
              <select
                required
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="CNG">CNG</option>
                <option value="HYBRID">Hybrid</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Chassis Number *</label>
              <input
                type="text"
                required
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="MA3EBJ123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Engine Number *</label>
              <input
                type="text"
                required
                value={formData.engineNumber}
                onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="G12B1234567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="John Doe"
              />
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Insurance Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Provider</label>
              <input
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="ICICI Lombard"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Policy Number</label>
              <input
                type="text"
                value={formData.insurancePolicyNumber}
                onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="POL123456789"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.insuranceStartDate}
                onChange={(e) => setFormData({ ...formData, insuranceStartDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.insuranceExpiryDate}
                onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mobile No</label>
              <input
                type="text"
                value={formData.insuranceMobileNo}
                onChange={(e) => setFormData({ ...formData, insuranceMobileNo: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="9876543210"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Premium (₹)</label>
              <input
                type="number"
                value={formData.insurancePremium}
                onChange={(e) => setFormData({ ...formData, insurancePremium: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pay to Portal (₹)</label>
              <input
                type="number"
                value={formData.insurancePayToPortal}
                onChange={(e) => setFormData({ ...formData, insurancePayToPortal: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="4500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Customer Paid (₹)</label>
              <input
                type="number"
                value={formData.insuranceCustomerPaid}
                onChange={(e) => setFormData({ ...formData, insuranceCustomerPaid: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="4800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Commission (₹)</label>
              <input
                type="number"
                value={formData.insuranceCommission}
                onChange={(e) => setFormData({ ...formData, insuranceCommission: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="300"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Tax Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.roadTaxStartDate}
                onChange={(e) => setFormData({ ...formData, roadTaxStartDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.roadTaxExpiryDate}
                onChange={(e) => setFormData({ ...formData, roadTaxExpiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tax Amount (₹)</label>
              <input
                type="number"
                value={formData.roadTaxAmount}
                onChange={(e) => setFormData({ ...formData, roadTaxAmount: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="2000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Customer Paid (₹)</label>
              <input
                type="number"
                value={formData.roadTaxCustomerPaid}
                onChange={(e) => setFormData({ ...formData, roadTaxCustomerPaid: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="1800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Profit (₹)</label>
              <input
                type="number"
                value={formData.roadTaxProfit}
                onChange={(e) => setFormData({ ...formData, roadTaxProfit: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="200"
              />
            </div>
          </div>
        </div>

        {/* Other Documents */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Other Documents</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PUC Number</label>
              <input
                type="text"
                value={formData.pucNumber}
                onChange={(e) => setFormData({ ...formData, pucNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">PUC Start Date</label>
              <input
                type="date"
                value={formData.pucStartDate}
                onChange={(e) => setFormData({ ...formData, pucStartDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">PUC Expiry Date</label>
              <input
                type="date"
                value={formData.pucExpiryDate}
                onChange={(e) => setFormData({ ...formData,pucExpiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fitness Start Date</label>
              <input
                type="date"
                value={formData.fitnessStartDate}
                onChange={(e) => setFormData({ ...formData, fitnessStartDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fitness Expiry Date</label>
              <input
                type="date"
                value={formData.fitnessExpiryDate}
                onChange={(e) => setFormData({ ...formData, fitnessExpiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Permit Number</label>
              <input
                type="text"
                value={formData.permitNumber}
                onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Permit Start Date</label>
              <input
                type="date"
                value={formData.permitStartDate}
                onChange={(e) => setFormData({ ...formData, permitStartDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Permit Expiry Date</label>
              <input
                type="date"
                value={formData.permitExpiryDate}
                onChange={(e) => setFormData({ ...formData, permitExpiryDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/agent/vehicles')}
            className="px-6 py-2 border rounded-md hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
