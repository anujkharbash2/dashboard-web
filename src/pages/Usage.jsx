import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

  if (!usage) return <p style={{ padding: 40 }}>Loading...</p>;

  const percentUsed = usage.quota === Infinity ? 0 : Math.round((usage.used / usage.quota) * 100);

  return (
    <div style={{ padding: 40 }}>
      <h1>Usage</h1>
      <p>Plan: <strong>{usage.plan}</strong></p>
      <p>
        {usage.used} / {usage.quota === Infinity ? 'Unlimited' : usage.quota} credits used this month
      </p>
      {usage.quota !== Infinity && (
        <div style={{ background: '#eee', height: 10, borderRadius: 5, overflow: 'hidden', width: 300 }}>
          <div style={{ width: `${percentUsed}%`, background: percentUsed > 90 ? '#e74c3c' : '#3498db', height: '100%' }} />
        </div>
      )}

      <h2 style={{ marginTop: 30 }}>Recent requests</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>URL</th><th>Type</th><th>Status</th><th>Cached</th><th>When</th></tr>
        </thead>
        <tbody>
          {usage.recentRequests.map(r => (
            <tr key={r.request_id}>
              <td>{r.url}</td>
              <td>{r.page_type || '—'}</td>
              <td style={{ color: r.fetch_status_code === 200 ? 'green' : 'red' }}>{r.fetch_status_code || 'error'}</td>
              <td>{r.cached ? 'Yes' : 'No'}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}