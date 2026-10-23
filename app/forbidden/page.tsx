import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">ACCESS RESTRICTED</p>
        <h1>This account does not have workspace access.</h1>
        <p className="muted">Ask your organization administrator to verify your workspace membership and role.</p>
        <Link className="button button-primary login-button" href="/cdn-cgi/access/logout">
          Sign out
        </Link>
      </section>
    </main>
  );
}
