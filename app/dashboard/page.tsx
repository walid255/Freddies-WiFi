import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";
import type { DashboardMetricsDTO } from "@/lib/dto";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "◫", active: true },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: "♙" },
  { href: "/dashboard/network", label: "Network", icon: "⌁" },
  { href: "/dashboard/billing", label: "Billing & vouchers", icon: "▤" },
  { href: "/dashboard/portal", label: "Captive portal", icon: "▣" },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "◇" },
];

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`} aria-hidden="true">{icon}</div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function Metrics({ metrics }: { metrics: DashboardMetricsDTO }) {
  return (
    <div className="metric-grid">
      <MetricCard label="Active subscribers" value={formatCount(metrics.activeSubscribers)} detail="Currently authorized" icon="♙" tone="mint" />
      <MetricCard label="Online sessions" value={formatCount(metrics.onlineSessions)} detail="Live network sessions" icon="⌁" tone="blue" />
      <MetricCard label="Open invoices" value={formatCount(metrics.openInvoices)} detail="Awaiting payment" icon="▤" tone="amber" />
      <MetricCard label="Active vouchers" value={formatCount(metrics.activeVouchers)} detail="Ready to redeem" icon="◇" tone="violet" />
    </div>
  );
}

export default async function DashboardPage() {
  const { user, metrics } = await getDashboardData();
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date()).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span><strong>freddies</strong><small>NETWORK CONSOLE</small></span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-avatar" aria-hidden="true">{user.tenantInitial}</span>
          <span className="workspace-copy"><strong>{user.tenantName}</strong><small>ISP workspace</small></span>
          <span className="chevron" aria-hidden="true">⌄</span>
        </div>
        <p className="nav-heading">WORKSPACE</p>
        <nav aria-label="Main navigation" className="primary-nav">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-link${item.active ? " active" : ""}`} aria-current={item.active ? "page" : undefined}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/dashboard/subscribers" && <span className="nav-count">{formatCount(metrics.activeSubscribers)}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="support-card">
          <div className="support-symbol" aria-hidden="true">?</div>
          <strong>Need a hand?</strong>
          <p>Our network team is here to help.</p>
          <Link href="/dashboard/support">Contact support <span aria-hidden="true">→</span></Link>
        </div>
        <Link href="/dashboard/settings" className="nav-link settings-link"><span className="nav-icon" aria-hidden="true">⚙</span>Settings</Link>
        <div className="profile-row">
          <span className="profile-avatar" aria-hidden="true">{user.initials}</span>
          <span className="profile-copy"><strong>{user.displayName}</strong><small>{user.roleLabel}</small></span>
          <span className="profile-menu" aria-hidden="true">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span aria-hidden="true">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="system-status">Operations console</span>
            <button className="icon-button" type="button" aria-label="Notifications">♧<span className="notification-dot" /></button>
            <span className="topbar-avatar" aria-label={user.displayName}>{user.initials}</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">{today}</p>
              <h1>Good morning, {user.firstName}<span className="wave" aria-hidden="true">✳</span></h1>
              <p className="muted">Here’s what’s happening across your network today.</p>
            </div>
            <Link className="button button-primary" href="/dashboard/subscribers/new"><span aria-hidden="true">＋</span> Add subscriber</Link>
          </section>

          <section aria-label="Network summary" className="overview-section">
            <div className="section-heading"><div><h2>Network at a glance</h2><p>Your workspace, right now</p></div><span className="period-chip">Current snapshot</span></div>
            <Metrics metrics={metrics} />
          </section>

          <section className="lower-grid">
            <article className="panel activity-panel">
              <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest changes in your workspace</p></div><Link href="/dashboard/activity" className="text-link">View all <span aria-hidden="true">→</span></Link></div>
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">⌁</span>
                <strong>You’re all caught up</strong>
                <p>New subscriber, network, and billing activity will show up here.</p>
              </div>
            </article>
            <article className="panel health-panel">
              <div className="panel-heading"><div><h2>Network health</h2><p>Controller connectivity</p></div><span className="health-badge unavailable">Not connected</span></div>
              <div className="health-placeholder">
                <div className="health-orbit orbit-one" /><div className="health-orbit orbit-two" />
                <div className="health-center"><span aria-hidden="true">⌁</span></div>
                <div className="health-caption"><strong>Controller data not configured</strong><span>Connect an Omada controller to see live site health.</span></div>
              </div>
            </article>
          </section>

          <footer className="page-footer"><span>Freddies WiFi <span aria-hidden="true">·</span> Secure network operations</span><span>Help center&nbsp;&nbsp;·&nbsp;&nbsp;Status</span></footer>
        </div>
      </main>
    </div>
  );
}
