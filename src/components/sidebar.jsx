// ============================================================================
// Sidebar.jsx
//
// Primary left-hand navigation for the DataRey brand-monitoring product.
// This REPLACES the old general-purpose API dashboard nav (Playground, API
// keys, Usage, Collections) per the founder's pivot to a dedicated PR/media
// monitoring product. Those old pages/routes still exist in the codebase and
// still work (nothing was deleted from the backend) — they're just no longer
// surfaced in the primary nav, since the product is now scoped to exactly
// the 4 launch-day items below.
//
// Per founder's spec, launch-day scope is strictly these 4 things:
//   1. Entity setup       -> /entities
//   2. Mentions feed       -> /mentions   (the default/home screen)
//   3. Digest settings     -> /digest-settings
//   4. Slack alerts        -> /slack-alerts
// A "Trends" tab appeared in the founder's own mockup but was NOT in his
// written 4-item scope memo. Per explicit decision, we are deliberately
// NOT building Trends right now — flagged back to the founder separately.
// ============================================================================

import { NavLink } from 'react-router-dom';
import { List, Tags, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Nav item definitions, in the exact order shown in the founder's mockup.
// `icon` is a lucide-react component reference (not JSX yet) so we can
// render it dynamically with a consistent size/style below.
const navItems = [
  { to: '/mentions', label: 'Mentions', icon: List },
  { to: '/entities', label: 'Entities', icon: Tags },
  { to: '/digest-settings', label: 'Digest settings', icon: Mail },
  { to: '/slack-alerts', label: 'Slack alerts', icon: MessageSquare },
];

export function Sidebar() {
  return (
    // Fixed-width sidebar, matches the ~160px width in the founder's mockup.
    // `shrink-0` prevents flexbox from squeezing it when main content is wide.
    <aside className="w-40 border-r bg-muted/40 p-3 shrink-0">
      {/* Product name/logo area — kept as "DataRey" (our existing brand),
          not "Loomwatch" from the mockup, since that appeared to be a
          placeholder/working title in the founder's mockup rather than a
          confirmed rename. Flag with founder if a rename is actually intended. */}
      <p className="text-sm font-medium px-2 pb-4">DataRey</p>

      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            // NavLink's isActive render-prop lets us style the current
            // page differently (matches the highlighted "Mentions" state
            // in the founder's mockup).
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-background font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}