## CSRF
Not applicable in current architecture — all state-changing requests use Bearer token 
auth (Supabase session JWT or API key) via Authorization header, never cookies. 
CSRF specifically requires ambient cookie-based auth, which this app doesn't use.
Re-evaluate if cookie-based sessions are ever introduced.

## Session storage
Using Supabase Auth's default localStorage-based session storage, not HttpOnly cookies.
This means our XSS protections (React's auto-escaping, verified in Step 7 test) are the 
primary defense against session theft. If this were ever a higher-stakes app, migrating 
to HttpOnly cookie-based sessions would be the more defense-in-depth choice.

## Content-Security-Policy (deployment TODO)
Not yet configured — must be set at the hosting/CDN layer once deployed 
(e.g., Vercel headers config, or Nginx if self-hosted). Add before public launch:
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';