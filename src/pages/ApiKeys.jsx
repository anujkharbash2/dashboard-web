import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Key, Trash2 } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:3000';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getAuthHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session.access_token}` };
  }

  async function fetchKeys() {
    const headers = await getAuthHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/keys`, { headers });
    const data = await res.json();
    setKeys(data.keys || []);
  }

  async function createKey() {
    setLoading(true);
    const headers = await getAuthHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/keys`, { method: 'POST', headers });
    const data = await res.json();
    setNewKey(data.rawKey);
    setLoading(false);
    fetchKeys();
  }

  async function revokeKey(keyId) {
    if (!confirm('Revoke this key? This cannot be undone.')) return;
    const headers = await getAuthHeader();
    await fetch(`${GATEWAY_URL}/v1/keys/${keyId}`, { method: 'DELETE', headers });
    fetchKeys();
  }

  useEffect(() => { fetchKeys(); }, []);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">API keys</h1>
        <Button size="sm" onClick={createKey} disabled={loading}>
          <Plus className="size-4 mr-1.5" />
          {loading ? 'Creating...' : 'Create key'}
        </Button>
      </div>

      {newKey && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertDescription>
            <p className="font-medium text-sm mb-2">Save this key now — it won't be shown again.</p>
            <code className="block bg-background rounded-md px-3 py-2 text-xs break-all mb-2">
              {newKey}
            </code>
            <Button size="sm" variant="outline" onClick={() => setNewKey(null)}>I've saved it</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between px-4 py-3 text-sm border-b last:border-0">
                <div className="flex items-center gap-2.5">
                  <Key className="size-4 text-muted-foreground" />
                  <code>{k.key_prefix}••••••••</code>
                  <Badge variant={k.is_active ? 'secondary' : 'outline'} className="text-xs">
                    {k.is_active ? 'Active' : 'Revoked'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(k.created_at).toLocaleDateString()}
                  </span>
                  {k.is_active && (
                    <Button variant="ghost" size="sm" onClick={() => revokeKey(k.id)}>
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}