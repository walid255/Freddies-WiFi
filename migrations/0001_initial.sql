PRAGMA foreign_keys = ON;

CREATE TABLE tenants (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  plan TEXT NOT NULL DEFAULT 'starter',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT REFERENCES tenants(id),
  access_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'tenant_admin', 'end_user')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (tenant_id, id),
  CHECK ((role = 'super_admin' AND tenant_id IS NULL) OR (role != 'super_admin' AND tenant_id IS NOT NULL))
);
CREATE INDEX users_tenant_role_idx ON users(tenant_id, role, is_active);

CREATE TABLE subscribers (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (tenant_id, user_id),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)
);
CREATE INDEX subscribers_tenant_status_idx ON subscribers(tenant_id, status);

CREATE TABLE active_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subscriber_id TEXT NOT NULL REFERENCES subscribers(id),
  device_label TEXT,
  status TEXT NOT NULL CHECK (status IN ('online', 'ended')),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  FOREIGN KEY (tenant_id, subscriber_id) REFERENCES subscribers(tenant_id, id)
);
CREATE INDEX active_sessions_tenant_status_idx ON active_sessions(tenant_id, status, started_at);

CREATE TABLE vouchers (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'redeemed', 'expired', 'revoked')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX vouchers_tenant_status_idx ON vouchers(tenant_id, status);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subscriber_id TEXT NOT NULL REFERENCES subscribers(id),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'paid', 'void', 'overdue')),
  due_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (tenant_id, subscriber_id) REFERENCES subscribers(tenant_id, id)
);
CREATE INDEX invoices_tenant_status_idx ON invoices(tenant_id, status);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT REFERENCES tenants(id),
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX audit_events_tenant_created_idx ON audit_events(tenant_id, created_at);
