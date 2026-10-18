import React, { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import base44 from '@/api/apiClient';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.User.list().then((u) => { setUsers(u || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Users</h1>
      <div className="relative mb-5 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" /></div>
      {loading ? <div className="h-32 animate-pulse rounded-2xl bg-muted" /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="hidden p-3 sm:table-cell">Role</th><th className="hidden p-3 md:table-cell">Joined</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="p-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{(u.full_name || u.email || 'U').charAt(0).toUpperCase()}</span><span className="font-medium">{u.full_name || '—'}</span></div></td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="hidden p-3 sm:table-cell"><span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', u.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{u.role || 'user'}</span></td>
                  <td className="hidden p-3 md:table-cell text-muted-foreground">{new Date(u.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}