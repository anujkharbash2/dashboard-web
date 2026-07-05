import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Key, PlayCircle, Code2, ArrowRight } from 'lucide-react';

export default function Quickstart() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-medium mb-2">Get started in 5 minutes</h1>
      <p className="text-muted-foreground mb-10">
        Two ways to use DataRey — pick whichever fits how you work.
      </p>

      {/* Two paths */}
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        <Card>
          <CardContent className="p-4">
            <PlayCircle className="size-5 mb-2 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">No code — use the Playground</p>
            <p className="text-xs text-muted-foreground mb-3">
              Paste a URL, see the extracted data instantly, save it to a collection.
            </p>
            <Button variant="outline" size="sm" asChild={false} onClick={() => window.location.href = '/playground'}>
              Open Playground <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Code2 className="size-5 mb-2 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">Code — use the API</p>
            <p className="text-xs text-muted-foreground mb-3">
              Call <code>/v1/extract</code> from your own app, script, or pipeline.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/keys'}>
              Get an API key <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Step 1 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">1</Badge>
          <h2 className="font-medium">Get your API key</h2>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          Go to <a href="/keys" className="underline">API keys</a> and create one.
          Copy it now — it's only shown once.
        </p>
      </section>

      {/* Step 2 - code tabs */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">2</Badge>
          <h2 className="font-medium">Make your first call</h2>
        </div>
        <Tabs defaultValue="curl" className="ml-7">
          <TabsList>
            <TabsTrigger value="curl">curl</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          <TabsContent value="curl">
            <pre className="bg-neutral-950 text-neutral-200 rounded-md p-4 text-xs overflow-x-auto">
{`curl -X POST https://api.datarey.com/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/some-article"}'`}
            </pre>
          </TabsContent>
          <TabsContent value="node">
            <pre className="bg-neutral-950 text-neutral-200 rounded-md p-4 text-xs overflow-x-auto">
{`const res = await fetch('https://api.datarey.com/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com/some-article' }),
});
const data = await res.json();
console.log(data);`}
            </pre>
          </TabsContent>
          <TabsContent value="python">
            <pre className="bg-neutral-950 text-neutral-200 rounded-md p-4 text-xs overflow-x-auto">
{`import requests

response = requests.post(
    "https://api.datarey.com/v1/extract",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"url": "https://example.com/some-article"},
)
print(response.json())`}
            </pre>
          </TabsContent>
        </Tabs>
      </section>

      {/* Step 3 - response shape */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">3</Badge>
          <h2 className="font-medium">Understand the response</h2>
        </div>
        <div className="ml-7 space-y-2">
          {[
            ['request_id', 'unique ID for this call, useful for support and idempotency'],
            ['page_type', '"product", "article", or "other"'],
            ['confidence', 'how sure we are about the page_type, 0 to 1'],
            ['extraction_method', '"json_ld", "open_graph", "fallback", or "none"'],
            ['fields', 'the actual extracted data — shape depends on page_type'],
            ['cached', 'true if served from cache — doesn\'t consume a credit'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-start gap-3 text-sm">
              <code className="shrink-0 bg-muted px-1.5 py-0.5 rounded text-xs">{key}</code>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Step 4 - errors */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">4</Badge>
          <h2 className="font-medium">Common errors</h2>
        </div>
        <Card className="ml-7">
          <CardContent className="p-0">
            {[
              ['401', 'Invalid or missing API key', 'Check your Authorization header'],
              ['429', 'Rate limit or monthly quota exceeded', 'Check Retry-After header, or your Usage page'],
              ['502 · FETCH', 'Could not fetch the URL', 'Target may block bots, use robots.txt, or be down — check the error field: TIMEOUT, BLOCKED, CAPTCHA, DNS_FAIL, ROBOTS_DISALLOWED'],
              ['502 · EXTRACT', 'Fetched fine, but extraction failed', 'Page may have unusual structure — try the Playground to inspect it'],
            ].map(([code, meaning, fix]) => (
              <div key={code} className="px-4 py-3 text-sm border-b last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{code}</code>
                  <span className="font-medium">{meaning}</span>
                </div>
                <p className="text-xs text-muted-foreground">{fix}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Full interactive API reference:{' '}
          <a href="http://localhost:3000/docs" target="_blank" rel="noreferrer" className="underline">
            Swagger docs
          </a>
        </p>
      </div>
    </div>
  );
}