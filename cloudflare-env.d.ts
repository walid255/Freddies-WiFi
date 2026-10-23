interface CloudflareEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  MEDIA: R2Bucket;
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
}
