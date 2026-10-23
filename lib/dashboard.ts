import { redirect } from "next/navigation";
import type { DashboardDTO, DashboardMetricsDTO, UserDTO } from "@/lib/dto";
import { AuthorizationError, requireProcedure } from "@/lib/auth";

type TenantRow = { name: string };
type MetricRow = {
  activeSubscribers: number;
  onlineSessions: number;
  openInvoices: number;
  activeVouchers: number;
};

async function getMetrics(db: D1Database, tenantId?: string) {
  const query = tenantId
    ? `SELECT
        (SELECT COUNT(*) FROM subscribers WHERE tenant_id = ?1 AND status = 'active') AS activeSubscribers,
        (SELECT COUNT(*) FROM active_sessions WHERE tenant_id = ?1 AND status = 'online') AS onlineSessions,
        (SELECT COUNT(*) FROM invoices WHERE tenant_id = ?1 AND status = 'open') AS openInvoices,
        (SELECT COUNT(*) FROM vouchers WHERE tenant_id = ?1 AND status = 'active') AS activeVouchers`
    : `SELECT
        (SELECT COUNT(*) FROM subscribers WHERE status = 'active') AS activeSubscribers,
        (SELECT COUNT(*) FROM active_sessions WHERE status = 'online') AS onlineSessions,
        (SELECT COUNT(*) FROM invoices WHERE status = 'open') AS openInvoices,
        (SELECT COUNT(*) FROM vouchers WHERE status = 'active') AS activeVouchers`;
  const statement = db.prepare(query);
  return (tenantId ? statement.bind(tenantId) : statement).first<MetricRow>();
}

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getDashboardData(): Promise<DashboardDTO> {
  let context;
  try {
    context = await requireProcedure(["tenant_admin", "super_admin"]);
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) redirect("/login");
    if (error instanceof AuthorizationError) redirect("/forbidden");
    throw error;
  }
  const { db, user } = context;
  if (!user.tenantId && user.role !== "super_admin") redirect("/forbidden");

  const [tenant, metrics] = await Promise.all([
    user.tenantId
      ? db
          .prepare("SELECT name FROM tenants WHERE id = ?1 LIMIT 1")
          .bind(user.tenantId)
          .first<TenantRow>()
      : Promise.resolve({ name: "All tenants" }),
    getMetrics(db, user.tenantId ?? undefined),
  ]);

  if (!tenant || !metrics) {
    throw new Error("Dashboard data is unavailable");
  }

  const displayName = user.displayName.trim();
  const nameParts = displayName.split(/\s+/);
  const tenantName = tenant.name;
  const roleLabel = user.role === "super_admin" ? "Super administrator" : "Tenant administrator";
  const userDTO: UserDTO = {
    displayName,
    firstName: nameParts[0] || "there",
    initials: getInitials(displayName),
    roleLabel,
    tenantName,
    tenantInitial: getInitials(tenantName).slice(0, 1),
  };
  const metricsDTO: DashboardMetricsDTO = {
    activeSubscribers: metrics.activeSubscribers,
    onlineSessions: metrics.onlineSessions,
    openInvoices: metrics.openInvoices,
    activeVouchers: metrics.activeVouchers,
  };

  return { user: userDTO, metrics: metricsDTO };
}
