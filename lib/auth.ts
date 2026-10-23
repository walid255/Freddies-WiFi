import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createRemoteJWKSet, errors as joseErrors, jwtVerify } from "jose";
import { headers } from "next/headers";

export type Role = "super_admin" | "tenant_admin" | "end_user";

export type AuthenticatedUser = {
  id: string;
  tenantId: string | null;
  role: Role;
  displayName: string;
  email: string;
};

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

const jwksByDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  let jwks = jwksByDomain.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
    );
    jwksByDomain.set(teamDomain, jwks);
  }
  return jwks;
}

export async function requireProcedure(allowedRoles?: readonly Role[]) {
  const requestHeaders = await headers();
  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) throw new AuthorizationError("Authentication required", 401);

  const { env } = await getCloudflareContext({ async: true });
  const domain = env.CF_ACCESS_TEAM_DOMAIN;
  const audience = env.CF_ACCESS_AUD;
  if (
    !domain ||
    !audience ||
    !/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain) ||
    audience.includes("REPLACE_WITH")
  ) {
    throw new Error("Cloudflare Access is not configured");
  }

  let subject: string;
  try {
    const { payload } = await jwtVerify(token, getJwks(domain), {
      issuer: `https://${domain}`,
      audience,
    });
    if (!payload.sub) throw new AuthorizationError("Invalid identity token", 401);
    subject = payload.sub;
  } catch (error) {
    if (error instanceof AuthorizationError) throw error;
    if (error instanceof joseErrors.JOSEError) {
      throw new AuthorizationError("Invalid identity token", 401);
    }
    throw error;
  }

  const result = await env.DB
    .prepare(
      `SELECT id, tenant_id AS tenantId, role, display_name AS displayName, email
       FROM users
       WHERE access_sub = ?1 AND is_active = 1
       LIMIT 1`,
    )
    .bind(subject)
    .first<{
      id: string;
      tenantId: string | null;
      role: string;
      displayName: string;
      email: string;
    }>();

  if (!result || !["super_admin", "tenant_admin", "end_user"].includes(result.role)) {
    throw new AuthorizationError("Access denied", 403);
  }

  const role = result.role;
  if (role !== "super_admin" && role !== "tenant_admin" && role !== "end_user") {
    throw new AuthorizationError("Access denied", 403);
  }
  const user: AuthenticatedUser = {
    id: result.id,
    tenantId: result.tenantId,
    role,
    displayName: result.displayName,
    email: result.email,
  };

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthorizationError("Insufficient permissions", 403);
  }

  return { db: env.DB, user };
}
