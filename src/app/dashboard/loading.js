export default function DashboardLoading() {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border spinner-border-sm text-muted" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
