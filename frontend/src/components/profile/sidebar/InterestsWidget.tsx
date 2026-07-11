import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Send } from "lucide-react";
import { api } from "../../../lib/axios";

export const InterestsWidget = () => {
  const { data: received } = useQuery({
    queryKey: ["interests-received"],
    queryFn: async () => (await api.get("/interests?direction=received")).data.data.interests as any[],
  });
  const { data: sent } = useQuery({
    queryKey: ["interests-sent"],
    queryFn: async () => (await api.get("/interests?direction=sent")).data.data.interests as any[],
  });

  return (
    <div className="card p-5">
      <div className="grid grid-cols-2 divide-x divide-line text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-maroon">
            <Heart size={15} /> {received?.length ?? 0}
          </div>
          <div className="text-[11px] font-semibold text-muted">Received</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-forest">
            <Send size={15} /> {sent?.length ?? 0}
          </div>
          <div className="text-[11px] font-semibold text-muted">Sent</div>
        </div>
      </div>
      <Link to="/dashboard" className="mt-3 block text-center text-xs font-bold text-maroon">View all →</Link>
    </div>
  );
};
