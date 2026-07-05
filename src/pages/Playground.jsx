import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, FolderPlus, Loader2 } from 'lucide-react';

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
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium mb-1">Playground</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Paste a URL and see what DataRey extracts — no code required.
      </p>

      <form onSubmit={handleExtract} className="flex gap-2 mb-6">
        <Input
          type="url"
          placeholder="https://example.com/product/123"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
          {loading ? 'Extracting' : 'Extract'}
        </Button>
      </form>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 mb-6">
          <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {result && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="capitalize">
                {result.page_type} · {result.confidence} confidence
              </Badge>
              <span className="text-xs text-muted-foreground">
                {result.fetchMeta?.renderTimeMs}ms · {result.cached ? 'cached' : 'fresh'}
              </span>
            </div>

            {result.fields?.title && <p className="font-medium mb-1">{result.fields.title}</p>}
            {result.fields?.description && (
              <p className="text-sm text-muted-foreground mb-3">{result.fields.description}</p>
            )}

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <ChevronDown className="size-3.5" />
                View raw JSON
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto mb-3">
                  {JSON.stringify(result.fields, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center gap-2 pt-3 border-t">
              <Select onValueChange={handleSave}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Save to collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={handleNewCollection}>
                <FolderPlus className="size-4 mr-1.5" />
                New
              </Button>
              {saveStatus && <span className="text-xs text-green-600">{saveStatus}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground mb-2">Recent extractions</p>
      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Nothing yet.</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm border-b last:border-0">
                <span className="truncate max-w-[380px]">{h.url}</span>
                <span className={h.status === 200 ? 'text-green-600' : 'text-destructive'}>
                  {h.status || 'error'}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}