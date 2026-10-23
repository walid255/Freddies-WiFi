import assert from "node:assert/strict";
import test from "node:test";
import { isPublicPath } from "../lib/route-policy.ts";

test("only explicitly public routes bypass the authentication gate", () => {
  const publicPaths = [
    "/login",
    "/api/health",
    "/api/webhooks",
    "/api/webhooks/mobile-money",
    "/service-worker.js",
    "/icon.svg",
  ];
  for (const path of publicPaths) assert.equal(isPublicPath(path), true, path);

  const protectedPaths = [
    "/",
    "/dashboard",
    "/dashboard/subscribers",
    "/dashboard/subscribers/123",
    "/api/v1/sessions",
    "/login/reset",
    "/api/health/details",
    "/api/webhooks-old",
    "/service-worker.js.map",
  ];
  for (const path of protectedPaths) assert.equal(isPublicPath(path), false, path);
});
