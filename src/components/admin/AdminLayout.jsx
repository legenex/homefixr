import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings,
  Sliders, Plug, ChevronRight, Menu, LogOut,
  BarChart2, MessageSquare, Globe, Share2, Radar
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/layout/Logo";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Leads", icon: MessageSquare, to: "/admin/leads" },
  { label: "Distribution", icon: Share2, to: "/admin/distribution" },
  { label: "Signal Engine", icon: Radar, to: "/admin/signals" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Quiz Settings", icon: Sliders, to: "/admin/quiz" },
  { label: "Pages & SEO", icon: Globe, to: "/admin/pages" },
  { label: "Integrations", icon: Plug, to: "/admin/integrations" },
  { label: "Analytics", icon: BarChart2, to: "/admin/analytics" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

export default function AdminLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (to) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const handleLogout = () => base44.auth.logout("/");

  return (
    <div className="min-h-screen bg-[#0f1623] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0f1623] border-r border-white/8 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center px-5 border-b border-white/8">
          <Logo light />
          <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-white/40 border border-white/20 rounded px-1.5 py-0.5">Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-secondary text-secondary-foreground" : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xs font-bold">
              {user?.full_name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || "Admin"}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-white/8 flex items-center px-5 gap-3 bg-[#0f1623]">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/8" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link to="/" target="_blank" className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> View site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}