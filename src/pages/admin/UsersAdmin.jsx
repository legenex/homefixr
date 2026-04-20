import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { UserPlus, Shield, User, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersAdmin() {
  useEffect(() => { document.title = "Users — HomeFixr Admin"; }, []);
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      setInviteMsg("Failed to send invite. Try again.");
    }
    setInviting(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-white/40 text-sm mt-1">Manage team access to the admin panel</p>
      </div>

      {/* Invite */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-secondary" /> Invite user</h2>
        <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-white/40 mb-1.5 block">Email address</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Role</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="h-11 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="h-11 px-5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Send invite
          </button>
        </form>
        {inviteMsg && <p className="text-xs mt-3 text-secondary">{inviteMsg}</p>}
      </div>

      {/* Users list */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white/80">{users.length} team members</h2>
        </div>
        {isLoading ? (
          <div className="py-10 text-center text-white/30">Loading...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-sm font-bold">
                    {u.full_name?.[0] || u.email?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.full_name || "—"}</p>
                    <p className="text-xs text-white/40 flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${u.role === "admin" ? "bg-secondary/10 text-secondary" : "bg-white/8 text-white/40"}`}>
                    {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {u.role}
                  </span>
                  <span className="text-xs text-white/20">{format(new Date(u.created_date), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}