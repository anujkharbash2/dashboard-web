// ============================================================================
// Mentions.jsx
//
// The primary landing screen of the product (per founder's spec: "That's
// the core screen customers land on after login"). Layout and content
// structure are matched directly to the founder's HTML mockup:
//   - header row: "This week" title + entity count/freshness + entity filter
//   - 4 stat cards: total mentions, % positive, % negative, new sources
//   - a feed of individual mention cards, each showing title, source,
//     time-ago, matched search term, and a colored sentiment badge
//
// IMPORTANT: this page will render correctly but show EMPTY data until the
// RSS discovery pipeline (next build step) actually populates the
// `mentions` table. This is expected at this stage - the UI and backend
// contract are being built and verified first, real data comes next.
// ============================================================================

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const GATEWAY_URL = 'http://localhost:3000';

// Maps a sentiment value to the Tailwind classes that reproduce the
// founder's mockup colors exactly: green bg/text for positive, red for
// negative, neutral gray for neutral. Centralized here so both the stat
// cards and the individual mention badges stay visually consistent.
const SENTIMENT_STYLES = {
  positive: 'bg-green-50 text-green-700',
  negative: 'bg-red-50 text-red-700',
  neutral: 'bg-muted text-muted-foreground',
};

// Small helper to render "2 hours ago" / "yesterday" style relative
// timestamps, matching the mockup's copy exactly rather than a raw
// ISO date, which would be much harder for a PR analyst to scan quickly.
function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export default function Mentions() {
  // Full list of the customer's tracked entities, used to populate the
  // filter dropdown - fetched once on load from the existing /v1/entities
  // endpoint built in the previous step.
  const [entities, setEntities] = useState([]);

  // Which entity is currently selected in the filter dropdown.
  // 'all' is our sentinel value for "no filter, show everything".
  const [selectedEntity, setSelectedEntity] = useState('all');

  // The actual feed data + computed stats returned by GET /v1/mentions.
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Builds the Authorization header from the current Supabase session -
  // same pattern used across every other authenticated page in this app.
  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session.access_token}` };
  }

  // Loads the customer's tracked entities (for the filter dropdown).
  // Runs once on mount - entity list rarely changes within a session.
  async function loadEntities() {
    const headers = await authHeader();
    const res = await fetch(`${GATEWAY_URL}/v1/entities`, { headers });
    const data = await res.json();
    setEntities(data.entities || []);
  }

  // Loads the mentions feed + stats, re-running whenever the selected
  // entity filter changes (so switching the dropdown re-fetches
  // filtered results from the server, rather than filtering client-side -
  // this keeps the stat percentages correct for the filtered subset too).
  async function loadMentions() {
    setLoading(true);
    const headers = await authHeader();

    // Only append the entity_id query param when a specific entity is
    // selected - omitting it entirely means "all entities" server-side.
    const url = selectedEntity === 'all'
      ? `${GATEWAY_URL}/v1/mentions`
      : `${GATEWAY_URL}/v1/mentions?entity_id=${selectedEntity}`;

    const res = await fetch(url, { headers });
    const data = await res.json();
    setFeedData(data);
    setLoading(false);
  }

  useEffect(() => { loadEntities(); }, []);
  useEffect(() => { loadMentions(); }, [selectedEntity]);

  return (
    <div>
      {/* Header row: title + freshness summary + entity filter dropdown,
          matching the founder's mockup layout exactly */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium text-base">This week</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {entities.length} tracked entit{entities.length === 1 ? 'y' : 'ies'} · updated just now
          </p>
        </div>

        <Select value={selectedEntity} onValueChange={setSelectedEntity}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {entities.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4 stat cards - total mentions, positive %, negative %, new sources.
          Values come straight from the backend's computed `stats` object,
          not calculated client-side, so the numbers stay correct even
          when the entity filter changes the underlying dataset. */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Total mentions</p>
            <p className="text-2xl font-medium">{feedData?.stats?.total_mentions ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Positive</p>
            <p className="text-2xl font-medium text-green-600">
              {feedData?.stats?.positive_pct ?? '—'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Negative</p>
            <p className="text-2xl font-medium text-red-600">
              {feedData?.stats?.negative_pct ?? '—'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">New sources</p>
            <p className="text-2xl font-medium">{feedData?.stats?.new_sources ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* The mentions feed itself - one card per mention, matching the
          founder's mockup: title, "Source · time ago · matched 'term'",
          and a colored sentiment badge on the right. */}
      <p className="text-xs text-muted-foreground mb-2">Recent mentions</p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : feedData?.mentions?.length === 0 ? (
        // Empty state - expected right now since the discovery pipeline
        // hasn't been built yet. Once Step 2 (RSS discovery) ships, this
        // will populate automatically with no changes needed here.
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No mentions found yet. Once discovery is running, new mentions
              for your tracked entities will show up here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {feedData.mentions.map((m) => (
            <div key={m.id} className="border rounded-xl px-3.5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-1 truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.source_name || 'Unknown source'} · {timeAgo(m.discovered_at)}
                    {m.matched_term && ` · matched "${m.matched_term}"`}
                  </p>
                </div>
                <Badge className={`shrink-0 capitalize ${SENTIMENT_STYLES[m.sentiment]}`}>
                  {m.sentiment}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}