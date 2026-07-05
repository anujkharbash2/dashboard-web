import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const GATEWAY_URL = 'http://localhost:3000';

export default function Playground() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' };
  }

  async function loadCollections() {
    const headers = await authHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/collections`, { headers });
    const data = await res.json();
    setCollections(data.collections || []);
  }

  useEffect(() => { loadCollections(); }, []);

  async function handleExtract(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const headers = await authHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/playground/extract`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Extraction failed');
    } else {
      setResult(data);
      setHistory([{ url, status: data.fetchMeta?.statusCode, at: new Date() }, ...history].slice(0, 10));
    }
    setLoading(false);
  }

  async function handleSave(collectionId) {
    if (!collectionId) return;
    const headers = await authHeader();
    await fetch(`${GATEWAY_URL}/v1/collections/${collectionId}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, page_type: result.page_type, fields: result.fields }),
    });
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }

  async function handleNewCollection() {
    const name = prompt('Collection name:');
    if (!name) return;
    const headers = await authHeader();
    await fetch(`${GATEWAY_URL}/v1/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    });
    loadCollections();
  }

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <h1>Playground</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Paste a URL and see what DataRey extracts — no code required.
      </p>

      <form onSubmit={handleExtract} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="url"
          placeholder="https://example.com/product/123"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: 1, padding: 10 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Extracting...' : 'Extract'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fee', padding: 12, borderRadius: 6, marginBottom: 20, color: '#900' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ background: '#e6f4ea', color: '#1a7f37', padding: '3px 10px', borderRadius: 4, fontSize: 12 }}>
              {result.page_type} · {result.confidence} confidence
            </span>
            <span style={{ fontSize: 12, color: '#888' }}>
              {result.fetchMeta?.renderTimeMs}ms · {result.cached ? 'cached' : 'fresh'}
            </span>
          </div>

          {result.fields?.title && <p style={{ fontWeight: 600, marginBottom: 4 }}>{result.fields.title}</p>}
          {result.fields?.description && <p style={{ color: '#555', fontSize: 14 }}>{result.fields.description}</p>}

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13, color: '#666' }}>View raw JSON</summary>
            <pre style={{ background: '#f6f6f6', padding: 10, fontSize: 12, overflowX: 'auto' }}>
              {JSON.stringify(result.fields, null, 2)}
            </pre>
          </details>

          <div style={{ borderTop: '1px solid #eee', marginTop: 14, paddingTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <select onChange={(e) => handleSave(e.target.value)} defaultValue="">
              <option value="" disabled>Save to collection...</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" onClick={handleNewCollection}>+ New collection</button>
            {saveStatus && <span style={{ fontSize: 13, color: 'green' }}>{saveStatus}</span>}
          </div>
        </div>
      )}

      <h3>Recent extractions</h3>
      <div style={{ border: '1px solid #eee', borderRadius: 6 }}>
        {history.length === 0 && <p style={{ padding: 12, color: '#999', fontSize: 13 }}>Nothing yet.</p>}
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
            <span>{h.url}</span>
            <span style={{ color: h.status === 200 ? 'green' : 'red' }}>{h.status || 'error'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}