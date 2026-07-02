'use client';

/**
 * @file app/users/page.tsx
 * @description User list with role badges, invite user, and delete actions.
 */

import * as React from 'react';
import { UserPlus, Trash2, Edit, Mail, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  emailVerified: string | null;
  createdAt: string;
}

const ROLE_BADGE: Record<UserRole, React.ReactNode> = {
  SUPER_ADMIN: <Badge variant="destructive">Super Admin</Badge>,
  ADMIN: <Badge variant="default">Admin</Badge>,
  EDITOR: <Badge variant="info">Editor</Badge>,
  VIEWER: <Badge variant="secondary">Viewer</Badge>,
};

function InviteDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('EDITOR');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleInvite = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to invite user.'); return; }
      onInvited();
      onOpenChange(false);
      setEmail('');
      setName('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Add a new team member to this installation.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Input label="Name" placeholder="Jane Smith" value={name} onChange={(e: any) => setName(e.target.value)} />
          <Input label="Email address" type="email" required placeholder="teammate@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ADMIN', 'EDITOR', 'VIEWER', 'SUPER_ADMIN'] as UserRole[]).map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={cn('px-3 py-2 rounded-md text-xs font-medium border transition-colors text-left',
                    role === r ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]')}>
                  {r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={sending} onClick={handleInvite} disabled={!email}>
            <Mail className="w-4 h-4" /> Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/users?perPage=100${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await fetch(url);
      const data = (await res.json()) as { data?: ApiUser[] };
      setUsers(data.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  React.useEffect(() => { loadUsers(); }, [loadUsers]);

  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; name: string | null } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDelete = (id: string, name: string | null) => setPendingDelete({ id, name });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/users/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('Could not remove this user. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const roleCounts = React.useMemo(() => {
    const counts: Record<UserRole, number> = { SUPER_ADMIN: 0, ADMIN: 0, EDITOR: 0, VIEWER: 0 };
    for (const u of users) { counts[u.role] = (counts[u.role] ?? 0) + 1; }
    return counts;
  }, [users]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Users</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {loading ? 'Loading…' : `${users.length} team member${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={loadUsers} aria-label="Refresh" className="w-8 h-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4" /> Invite User
          </Button>
        </div>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([['SUPER_ADMIN', 'Super Admin'], ['ADMIN', 'Admin'], ['EDITOR', 'Editor'], ['VIEWER', 'Viewer']] as const).map(
          ([role, label]) => (
            <Card key={role}>
              <CardContent className="p-4 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[hsl(var(--primary)/0.6)]" />
                <div>
                  <p className="text-xl font-bold">{roleCounts[role]}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {/* User table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Team Members</CardTitle>
            <Input
              placeholder="Search users…"
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">User</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Role</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Joined</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar alt={user.name ?? user.email} size="sm" />
                          <div>
                            <p className="font-medium text-[hsl(var(--foreground))]">{user.name ?? '—'}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{ROLE_BADGE[user.role]}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7" aria-label="Edit user">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="w-7 h-7 text-[hsl(var(--destructive))]"
                            aria-label="Remove user"
                            onClick={() => handleDelete(user.id, user.name)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvited={loadUsers} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove user"
        description={
          <>
            {pendingDelete?.name ?? 'This user'} will lose access to this installation immediately. This cannot be undone.
            {deleteError && <span role="alert" className="block mt-2 text-[hsl(var(--destructive))]">{deleteError}</span>}
          </>
        }
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
