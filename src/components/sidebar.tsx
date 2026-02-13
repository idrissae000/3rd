import Link from 'next/link';
import { LayoutDashboard, Users, MessageCircle, Briefcase, Scissors, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/artists', label: 'Artists', icon: Users },
  { href: '/conversations', label: 'Conversations', icon: MessageCircle },
  { href: '/campaigns', label: 'Campaigns', icon: Briefcase },
  { href: '/editors', label: 'Editors', icon: Scissors },
  { href: '/payouts', label: 'Payouts', icon: Wallet }
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="card sticky top-6 h-fit p-4">
      <h1 className="mb-6 text-lg font-semibold">Idriss Music Promos HQ</h1>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
              pathname.startsWith(href) ? 'bg-white/15 text-neonMint' : 'text-slate-300 hover:bg-white/10'
            )}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
