import { DashboardConfigState } from "@/features/dashboard/components/dashboard-config-state";

export default function NotFound() {
  return (
    <DashboardConfigState
      title="That dashboard view does not exist"
      message="The link points to an agent or improvement that the current snapshot cannot find."
    />
  );
}
