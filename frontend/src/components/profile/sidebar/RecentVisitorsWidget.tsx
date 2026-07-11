import { Eye } from "lucide-react";

/** No visitor-tracking endpoint exists on the backend yet — shown honestly as a coming-soon state rather than fabricated data. */
export const RecentVisitorsWidget = () => (
  <div className="card p-5">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
      <Eye size={15} className="text-muted" /> Recent Visitors
    </h4>
    <p className="text-xs text-muted">Visitor tracking is coming soon.</p>
  </div>
);
