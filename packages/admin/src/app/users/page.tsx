'use client';

/**
 * @file app/users/page.tsx
 * @description User list with role badges, invite user, and edit roles.
 */

import * as React from 'react';
import { UserPlus, MoreHorizontal, Trash2, Edit, Mail, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited' | 'inactive';
  lastSeen: string;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'super_admin', status: 'active', lastSeen: 'Just now' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'admin', status: 'active', lastSeen: '5m ago' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@example.com', role: 'editor', status: 'active', lastSeen: '2h ago' },
  { id: '4', name: 'Diana Chen', email: 'diana@example.com', role: 'editor', status: 'active', lastSeen: '1d ago' },
  { id: '5', name: 'Eve Wilson', email: 'eve@example.com', role: 'viewer', status: 'invited', lastSeen: 'Never' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'viewer', status: 'inactive', lastSeen: '30d ago' },
];

const ROLE_BADGE: Record<UserRole, React.ReactNode> = {
  super_admin: <Badge variant="destructive">Super Admin</Badge>,
  admin: <Badge variant="default">Admin</Badge>,
  editor: <Badge variant="info">Editor</Badge>,
  viewer: <Badge variant="secondary">Viewer</Badge>,
};

const STATUS_BADGE = {
  active: <Badge variant="success">Active</Badge>,
  invited: <Badge variant="warning">Invited</Badge>,
  inactive: <Badge variant="secondary">Inactive</Badge>,
};

// ---------------------------------------------------------------------------
// Invite dialog
// ---------------------------------------------------------------------------

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('editor');
  const [sending, setSending] = React.useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    onOpenChange(false);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Send an invitation email to a new team member.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            placeholder="teammate@example.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'editor', 'viewer', 'super_admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    'px-3 py-2 rounded-md text-xs font-medium border transition-colors text-left',
                    role === r
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                  )}
                >
                  {r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={sending} onClick={handleInvite}>
            <Mail className="w-4 h-4" />
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const [users, setUsers] = React.useState(USERS);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (!confirm('Remove this user from the team?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Users</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {users.filter((u) => u.status === 'active').length} active of {users.length} total members
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([['super_admin', 'Super Admin'], ['admin', 'Admin'], ['editor', 'Editor'], ['viewer', 'Viewer']] as const).map(
          ([role, label]) => (
            <Card key={role}>
              <CardContent className="p-4 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[hsl(var(--primary)/0.6)]" />
                <div>
                  <p className="text-xl font-bold">{users.filter((u) => u.role === role).length}</p>
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Last seen</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar alt={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">{user.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{ROLE_BADGE[user.role]}</td>
                    <td className="px-4 py-3">{STATUS_BADGE[user.status]}</td>
                    <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{user.lastSeen}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" aria-label="Edit user">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-[hsl(var(--destructive))]"
                          aria-label="Remove user"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
