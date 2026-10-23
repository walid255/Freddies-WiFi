import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">F</div>
        <p className="eyebrow">FREDDIES WIFI</p>
        <h1 id="login-title">Network operations, in one place.</h1>
        <p className="muted">Sign in with your organization account to continue to the secure operator console.</p>
        <Link className="button button-primary login-button" href="/cdn-cgi/access/login">
          Continue with organization sign-in <span aria-hidden="true">→</span>
        </Link>
        <p className="login-footnote">Access is managed by your organization administrator.</p>
      </section>
    </main>
  );
}
