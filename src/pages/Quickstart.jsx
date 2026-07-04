export default function Quickstart() {
  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <h1>Get started in 5 minutes</h1>

      <h2>1. Get your API key</h2>
      <p>Go to <a href="/keys">API Keys</a> and click "Create new key". Copy it now — it's only shown once.</p>

      <h2>2. Make your first call</h2>
      <p>Try extracting a product or article page:</p>

      <h3>curl</h3>
      <pre style={codeBlockStyle}>{`curl -X POST https://api.datarey.com/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/some-article"}'`}</pre>

      <h3>Node.js</h3>
      <pre style={codeBlockStyle}>{`const res = await fetch('https://api.datarey.com/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com/some-article' }),
});
const data = await res.json();
console.log(data);`}</pre>

      <h3>Python</h3>
      <pre style={codeBlockStyle}>{`import requests

response = requests.post(
    "https://api.datarey.com/v1/extract",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"url": "https://example.com/some-article"},
)
print(response.json())`}</pre>

      <h2>3. Understand the response</h2>
      <p>You'll get back structured fields depending on page type:</p>
      <ul>
        <li><strong>page_type</strong> — "product", "article", or "other"</li>
        <li><strong>fields</strong> — the extracted data (title, price, author, etc.)</li>
        <li><strong>cached</strong> — whether this was served from cache (doesn't consume a credit)</li>
      </ul>

      <h2>Common errors</h2>
      <table style={{ width: '100%', marginTop: 10 }}>
        <thead><tr><th>Code</th><th>Meaning</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>401</td><td>Invalid/missing API key</td><td>Check your Authorization header</td></tr>
          <tr><td>429</td><td>Rate limit or quota exceeded</td><td>Check the Retry-After header, or your usage page</td></tr>
          <tr><td>502</td><td>Upstream fetch/extraction failure</td><td>The target site may be blocking bots — try a different URL</td></tr>
        </tbody>
      </table>

      <p style={{ marginTop: 30 }}>
        Full interactive API reference: <a href="http://localhost:3000/docs" target="_blank" rel="noreferrer">API Docs</a>
      </p>
    </div>
  );
}

const codeBlockStyle = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: 15,
  borderRadius: 5,
  overflowX: 'auto',
  fontSize: 14,
};