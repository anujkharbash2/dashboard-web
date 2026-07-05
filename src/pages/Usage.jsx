import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';

const GATEWAY_URL = 'http://localhost:3000';

export default function Usage() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`${GATEWAY_URL}/v1/usage`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      setUsage(await res.json());
    }
    load();
  }, []);

  if (!usage) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const percentUsed = usage.quota === Infinity ? 0 : Math.round((usage.used / usage.quota) * 100);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium mb-6">Usage</h1>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm text-muted-foreground capitalize">{usage.plan} plan</p>
            <p className="text-sm">
              <span className="font-medium">{usage.used}</span>
              <span className="text-muted-foreground"> / {usage.quota === Infinity ? 'Unlimited' : usage.quota} credits</span>
            </p>
          </div>
          {usage.quota !== Infinity && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${percentUsed > 90 ? 'bg-destructive' : 'bg-foreground'}`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mb-2">Recent requests</p>
      <Card>
        <CardContent className="p-0">
          {usage.recentRequests?.length ? (
            usage.recentRequests.map((r) => (
              <div key={r.request_id} className="flex items-center justify-between px-4 py-2.5 text-sm border-b last:border-0">
                <span className="truncate max-w-[300px]">{r.url}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{r.page_type || '—'}</span>
                  <span className={r.fetch_status_code === 200 ? 'text-green-600' : 'text-destructive'}>
                    {r.fetch_status_code || 'error'}
                  </span>
                  <span>{r.cached ? 'cached' : 'fresh'}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">No requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}