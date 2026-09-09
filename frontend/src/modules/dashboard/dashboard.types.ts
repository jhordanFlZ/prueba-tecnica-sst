export interface DashboardCaseCount {
  status: string;
  _count: number;
}

export interface DashboardSummary {
  employees: number;
  cases: DashboardCaseCount[];
  alertCount: number;
  absenceByDepartment: Record<string, number>;
}
