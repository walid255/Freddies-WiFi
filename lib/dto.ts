export type UserDTO = {
  displayName: string;
  firstName: string;
  initials: string;
  roleLabel: string;
  tenantName: string;
  tenantInitial: string;
};

export type DashboardMetricsDTO = {
  activeSubscribers: number;
  onlineSessions: number;
  openInvoices: number;
  activeVouchers: number;
};

export type DashboardDTO = {
  user: UserDTO;
  metrics: DashboardMetricsDTO;
};
