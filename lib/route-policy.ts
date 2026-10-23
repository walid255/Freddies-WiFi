const publicPaths = new Set([
  "/login",
  "/api/health",
  "/api/webhooks",
  "/service-worker.js",
  "/icon.svg",
]);

export function isPublicPath(pathname: string) {
  return publicPaths.has(pathname) || pathname.startsWith("/api/webhooks/");
}
