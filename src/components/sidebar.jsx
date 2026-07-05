import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, Key, BarChart3, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/playground', label: 'Playground', icon: PlayCircle },
  { to: '/keys', label: 'API keys', icon: Key },
  { to: '/usage', label: 'Usage', icon: BarChart3 },
  { to: '/collections', label: 'Collections', icon: Folder },
];

export function Sidebar() {
  return (
    <aside className="w-44 border-r bg-muted/40 p-3 shrink-0">
      <p className="text-sm font-medium px-2 pb-4">DataRey</p>
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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