import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import type { ActivityLog } from '@/types';

export default function AdminActivity() {
  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['admin-activity'],
    queryFn: () => adminApi.activity.list(),
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
      <h1 className="text-3xl font-bold mb-8">Activity Log</h1>
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Activity log will display all administrative events.</p>
      </div>
    </div>
  );
}
