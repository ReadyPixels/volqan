'use client';

import * as React from 'react';
import { BarChart2, Users, FileText, Image, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  period: { days: number; since: string };
  totals: { apiRequests: number; newUsers: number; newContent: number; newMedia: number };
  topActions: { action: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
          <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [days, setDays] = React.useState(30);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.data ?? null);
        setError(null);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [days]);

  const maxDaily = data ? Math.max(1, ...data.dailyActivity.map((d) => d.count)) : 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" /> Analytics
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Activity overview for your Volqan installation</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error && <p className="text-[hsl(var(--destructive))] text-sm">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-[hsl(var(--muted))] rounded-lg p-6" /></Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Activity}  label="API Requests"    value={data.totals.apiRequests} color="bg-violet-500" />
            <StatCard icon={Users}     label="New Users"       value={data.totals.newUsers}    color="bg-sky-500" />
            <StatCard icon={FileText}  label="Content Created" value={data.totals.newContent}  color="bg-emerald-500" />
            <StatCard icon={Image}     label="Media Uploaded"  value={data.totals.newMedia}    color="bg-amber-500" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Daily Activity</CardTitle></CardHeader>
              <CardContent>
                {data.dailyActivity.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No activity in this period.</p>
                ) : (
                  <div className="flex items-end gap-1 h-32">
                    {data.dailyActivity.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.date}: ${d.count}`}>
                        <div
                          className="w-full rounded-sm bg-[hsl(var(--primary))] opacity-80 group-hover:opacity-100 transition-all"
                          style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Top Actions</CardTitle></CardHeader>
              <CardContent>
                {data.topActions.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No actions recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.topActions.map((a) => {
                      const pct = Math.round((a.count / data.totals.apiRequests) * 100) || 0;
                      return (
                        <li key={a.action} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{a.action}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--muted))]">
                              <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-[hsl(var(--muted-foreground))]">{a.count}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
