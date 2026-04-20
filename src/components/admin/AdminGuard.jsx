import { useEffect, useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function AdminGuard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-white/50 mb-6">Admin access required to view this page.</p>
          <a href="/" className="text-secondary hover:underline text-sm">← Back to site</a>
        </div>
      </div>
    );
  }

  return <AdminLayout user={user}><Outlet /></AdminLayout>;

}