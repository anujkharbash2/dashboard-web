import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const GATEWAY_URL = 'http://localhost:3000';

export default function Dashboard() {
  const { session } = useAuth();
  const [account, setAccount] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!session) return;
    supabase.from('accounts').select('*').single().then(({ data }) => setAccount(data));

    supabase.auth.getSession().then(async ({ data }) => {
      const res = await fetch(`${GATEWAY_URL}/v1/usage`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      setUsage(await res.json());
    });
  }, [session]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Overview</h1>
        <Badge variant="secondary" className="capitalize">
          {account?.plan || '...'} plan
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Credits used</p>
            <p className="text-2xl font-medium">
              {usage?.used ?? '—'}
              <span className="text-sm text-muted-foreground font-normal">
                {' '}/ {usage?.quota === Infinity ? '∞' : usage?.quota ?? '—'}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Recent requests</p>
            <p className="text-2xl font-medium">{usage?.recentRequests?.length ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Logged in as</p>
            <p className="text-sm font-medium mt-1.5 truncate">{session?.user?.email}</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mb-2">Recent activity</p>
      <Card>
        <CardContent className="p-0">
          {usage?.recentRequests?.length ? (
            usage.recentRequests.map((r) => (
              <div
                key={r.request_id}
                className="flex items-center justify-between px-4 py-2.5 text-sm border-b last:border-0"
              >
                <span className="truncate max-w-[380px]">{r.url}</span>
                <span className={r.fetch_status_code === 200 ? 'text-green-600' : 'text-destructive'}>
                  {r.fetch_status_code || 'error'}
                </span>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No requests yet. Try the Playground to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        size="sm"
        className="mt-4 text-muted-foreground"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </Button>
    </div>
  );
}