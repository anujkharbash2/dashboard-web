import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:3000';

export default function Entities() {
  const [entities, setEntities] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('brand');
  const [terms, setTerms] = useState('');

  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' };
  }

  async function load() {
    const headers = await authHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/entities`, { headers });
    const data = await res.json();
    setEntities(data.entities || []);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const headers = await authHeader();
    await fetch(`${GATEWAY_URL}/v1/entities`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        entity_type: type,
        search_terms: terms.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });
    setName(''); setTerms('');
    load();
  }

  async function handleRemove(id) {
    const headers = await authHeader();
    await fetch(`${GATEWAY_URL}/v1/entities/${id}`, { method: 'DELETE', headers });
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium mb-1">Tracked entities</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Add the brands you want mentions monitored for.
      </p>

      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Flipkart" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Search terms (comma-separated)</label>
              <Input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Flipkart, Flipkart India" required />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Own brand</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="sm:col-span-3 w-fit">
              <Plus className="size-4 mr-1.5" /> Add entity
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {entities.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">No entities tracked yet.</p>
          ) : (
            entities.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3 text-sm border-b last:border-0">
                <div>
                  <span className="font-medium">{e.name}</span>{' '}
                  <Badge variant="secondary" className="ml-1 capitalize text-xs">{e.entity_type}</Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.search_terms.join(', ')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(e.id)}>
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}