import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AuthorizationError, requireProcedure } from "@/lib/auth";

const sections: Record<string, string> = {
  subscribers: "Subscribers",
  network: "Network",
  billing: "Billing & vouchers",
  portal: "Captive portal",
  campaigns: "Campaigns",
  activity: "Activity",
  settings: "Settings",
  support: "Support",
};

export default async function WorkspaceSectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  try {
    await requireProcedure(["tenant_admin", "super_admin"]);
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) redirect("/login");
    if (error instanceof AuthorizationError) redirect("/forbidden");
    throw error;
  }

  const { section } = await params;
  const title =
    section[0] === "subscribers" && section[1] === "new"
      ? "Add subscriber"
      : sections[section[0]];
  if (!title) notFound();

  return (
    <main className="module-page">
      <div className="module-content">
        <p className="eyebrow">WORKSPACE MODULE</p>
        <h1>{title}</h1>
        <p className="muted">This area is not connected yet.</p>
        <div className="module-notice">
          <span className="module-notice-icon" aria-hidden="true">⌁</span>
          <div>
            <strong>Setup required</strong>
            <p>Provider credentials, business rules, and tenant workflows must be configured before this module can be enabled.</p>
          </div>
        </div>
        <Link className="text-link" href="/dashboard">← Back to overview</Link>
      </div>
    </main>
  );
}
