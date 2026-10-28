import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api";
import type { ActivityLog } from "@/types";
import { TablePagination } from "@/components/common";

export default function AdminActivity() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    data: activityResult,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-activity", page, limit],
    queryFn: () => adminApi.activity.list({ page, limit }),
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
        {isError ? (
          <p className="text-destructive">Activity log could not be loaded.</p>
        ) : activityResult?.data.length ? (
          <ul className="divide-y">
            {activityResult.data.map((activity: ActivityLog) => (
              <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                <p className="font-medium">
                  {activity.action.replace(/_/g, " ")} {activity.entity.toLowerCase()}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {typeof activity.actorId === "object" && activity.actorId?.fullName
                    ? `${activity.actorId.fullName} · `
                    : ""}
                  {activity.metadata?.["agentName"]
                    ? `${String(activity.metadata["agentName"])} · `
                    : ""}
                  {new Date(activity.createdAt).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No administrative activity has been recorded.</p>
        )}
        {!isError && activityResult && (
          <TablePagination
            page={activityResult.pagination.page}
            limit={activityResult.pagination.limit}
            total={activityResult.pagination.total}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
