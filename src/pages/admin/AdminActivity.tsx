import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Download, Laptop, Search, ShieldAlert } from "lucide-react";
import { adminApi, type ListParams } from "@/api";
import type { ActivityLog, ActiveAuthSession, LoginLocation } from "@/types";
import { TablePagination } from "@/components/common";

type ActivityFilters = Pick<ListParams, "search" | "action" | "ip" | "from" | "to">;

const EMPTY_FILTERS: ActivityFilters = {
  search: "",
  action: undefined,
  ip: "",
  from: "",
  to: "",
};

function isLoginActivity(activity: ActivityLog) {
  return activity.entity === "SESSION" && ["LOGIN", "LOGIN_FAILED"].includes(activity.action);
}

function formatLocation(location: LoginLocation | undefined) {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return null;
  }
  return (
    <a
      className="text-primary underline-offset-4 hover:underline"
      href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
      target="_blank"
      rel="noreferrer"
    >
      {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (±
      {Math.round(location.accuracy)}m)
    </a>
  );
}

export default function AdminActivity() {
  const [view, setView] = useState<"activity" | "sessions">("activity");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterInput, setFilterInput] = useState<ActivityFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const queryClient = useQueryClient();
  const activityQuery = useQuery({
    queryKey: ["admin-activity", page, limit, filters],
    queryFn: () => adminApi.activity.list({ page, limit, ...filters }),
    enabled: view === "activity",
    refetchOnWindowFocus: false,
  });
  const sessionsQuery = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: adminApi.sessions.list,
    enabled: view === "sessions",
    refetchOnWindowFocus: false,
  });
  const revokeSession = useMutation({
    mutationFn: adminApi.sessions.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }),
  });
  const exportMutation = useMutation({
    mutationFn: () => adminApi.activity.export(filters),
    onSuccess: (response) => {
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000);
    },
  });

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters(
      Object.fromEntries(
        Object.entries(filterInput).filter(([, value]) => value !== ""),
      ) as ActivityFilters,
    );
  };

  const isLoading = view === "activity" ? activityQuery.isLoading : sessionsQuery.isLoading;
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Activity & Sessions</h1>
      <div className="mb-5 flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setView("activity")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            view === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Activity Log
        </button>
        <button
          type="button"
          onClick={() => setView("sessions")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            view === "sessions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Active Sessions
        </button>
      </div>

      {view === "activity" ? (
        <div className="space-y-4">
          <form
            onSubmit={applyFilters}
            className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
          >
            <label className="flex flex-col gap-1 text-xs text-muted-foreground lg:col-span-2">
              User name or email
              <input
                value={filterInput.search ?? ""}
                onChange={(event) => setFilterInput({ ...filterInput, search: event.target.value })}
                className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
                placeholder="Search user"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Activity
              <select
                value={filterInput.action ?? ""}
                onChange={(event) =>
                  setFilterInput({
                    ...filterInput,
                    action: (event.target.value || undefined) as ActivityFilters["action"],
                  })
                }
                className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
              >
                <option value="">All activity</option>
                <option value="LOGIN">Successful login</option>
                <option value="LOGIN_FAILED">Failed login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              IP address
              <input
                value={filterInput.ip ?? ""}
                onChange={(event) => setFilterInput({ ...filterInput, ip: event.target.value })}
                className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
                placeholder="Filter IP"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              From
              <input
                type="date"
                value={filterInput.from ?? ""}
                onChange={(event) => setFilterInput({ ...filterInput, from: event.target.value })}
                className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              To
              <input
                type="date"
                value={filterInput.to ?? ""}
                onChange={(event) => setFilterInput({ ...filterInput, to: event.target.value })}
                className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground"
              >
                <Search className="h-4 w-4" /> Apply filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterInput(EMPTY_FILTERS);
                  setFilters({});
                  setPage(1);
                }}
                className="h-9 rounded-md border px-3 text-sm"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate()}
                className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </form>

          <div className="rounded-lg border bg-card p-6">
            {activityQuery.isError ? (
              <p className="text-destructive">Activity log could not be loaded.</p>
            ) : activityQuery.data?.data.length ? (
              <ul className="divide-y">
                {activityQuery.data.data.map((activity) => (
                  <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {activity.action.replace(/_/g, " ")} {activity.entity.toLowerCase()}
                      </p>
                      {activity.metadata?.suspiciousLogin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          <ShieldAlert className="h-3.5 w-3.5" /> New IP/device
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {typeof activity.actorId === "object" && activity.actorId?.fullName
                        ? `${activity.actorId.fullName} · `
                        : activity.metadata?.attemptedEmail
                          ? `${activity.metadata.attemptedEmail} · `
                          : ""}
                      {activity.metadata?.browser
                        ? `${activity.metadata.browser} · ${activity.metadata.operatingSystem} · ${activity.metadata.deviceType} · `
                        : ""}
                      {new Date(activity.createdAt).toLocaleString("en-IN")}
                    </p>
                    {activity.action === "LOGIN_FAILED" && activity.metadata?.reason && (
                      <p className="mt-1 text-sm text-destructive">
                        {String(activity.metadata.reason).replace(/_/g, " ")}
                      </p>
                    )}
                    {isLoginActivity(activity) && (
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          IP:{" "}
                          <span className="font-mono text-foreground">
                            {activity.ipAddress || "Unavailable"}
                          </span>
                        </span>
                        <span>
                          Location: {formatLocation(activity.metadata?.location) ?? "Not shared"}
                        </span>
                        <span title="Web browsers do not expose device MAC addresses">
                          MAC address: Unavailable in browser
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No activity matches the selected filters.</p>
            )}
            {!activityQuery.isError && activityQuery.data && (
              <TablePagination
                page={activityQuery.data.pagination.page}
                limit={activityQuery.data.pagination.limit}
                total={activityQuery.data.pagination.total}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6">
          {sessionsQuery.isError ? (
            <p className="text-destructive">Active sessions could not be loaded.</p>
          ) : sessionsQuery.data?.length ? (
            <ul className="divide-y">
              {sessionsQuery.data.map((session: ActiveAuthSession) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {session.user?.fullName ?? "Deleted account"}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        · {session.user?.email ?? "Unknown email"} · {session.user?.role ?? ""}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Laptop className="h-4 w-4 shrink-0" />
                      {session.browser} · {session.operatingSystem} · {session.deviceType}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      IP: <span className="font-mono">{session.ipAddress ?? "Unavailable"}</span>
                      {" · "}Last active: {new Date(session.lastActivityAt).toLocaleString("en-IN")}
                    </p>
                    {session.location && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Location: {formatLocation(session.location)}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Expires: {new Date(session.expiresAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={revokeSession.isPending}
                    onClick={() => revokeSession.mutate(session.id)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Ban className="h-4 w-4" /> Revoke session
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No active login sessions.</p>
          )}
        </div>
      )}
    </div>
  );
}
