export class DashboardConfigError extends Error {
  code: string;

  constructor(message: string, code = "DASHBOARD_CONFIG_ERROR") {
    super(message);
    this.name = "DashboardConfigError";
    this.code = code;
  }
}

export class DashboardDataError extends Error {
  code: string;

  constructor(message: string, code = "DASHBOARD_DATA_ERROR") {
    super(message);
    this.name = "DashboardDataError";
    this.code = code;
  }
}
