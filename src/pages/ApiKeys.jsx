import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const GATEWAY_URL = 'http://localhost:3000';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState(null); // shown once, then cleared
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
    setNewKey(data.rawKey); // shown once
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
    <div style={{ padding: 40 }}>
      <h1>API Keys</h1>

      {newKey && (
        <div style={{ background: '#fffbe6', border: '1px solid #e6c200', padding: 15, marginBottom: 20 }}>
          <strong>Save this key now — it won't be shown again:</strong>
          <pre>{newKey}</pre>
          <button onClick={() => setNewKey(null)}>I've saved it</button>
        </div>
      )}

      <button onClick={createKey} disabled={loading}>
        {loading ? 'Creating...' : 'Create new key'}
      </button>

      <table style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr><th>Key</th><th>Status</th><th>Created</th><th>Action</th></tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id}>
              <td>{k.key_prefix}••••••••</td>
              <td>{k.is_active ? 'Active' : 'Revoked'}</td>
              <td>{new Date(k.created_at).toLocaleDateString()}</td>
              <td>{k.is_active && <button onClick={() => revokeKey(k.id)}>Revoke</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}