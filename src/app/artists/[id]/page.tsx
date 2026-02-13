import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { requireUser } from '@/lib/data';

export default async function ArtistDetailPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const [{ data: artist }, { data: conversations }, { data: campaigns }] = await Promise.all([
    supabase.from('artists').select('*').eq('owner_id', user.id).eq('id', params.id).single(),
    supabase.from('conversations').select('*').eq('owner_id', user.id).eq('artist_id', params.id).order('created_at', { ascending: false }),
    supabase.from('campaigns').select('*').eq('owner_id', user.id).eq('artist_id', params.id).order('created_at', { ascending: false })
  ]);

  return (
    <AppShell>
      <section className="card p-5">
        <h2 className="text-xl font-semibold">{artist?.name ?? 'Artist not found'}</h2>
        <p className="text-sm text-slate-400">{artist?.platform} · {artist?.handle} · {artist?.genre}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h3 className="mb-3 font-semibold">Conversations</h3>
          {!conversations?.length ? <EmptyState title="No outreach logs" description="Track DMs, email replies, and follow-up dates here." /> : (
            <ul className="space-y-2 text-sm">
              {conversations.map((row) => <li key={row.id} className="rounded-xl border border-white/10 p-3">{row.channel}: {row.message_sent}</li>)}
            </ul>
          )}
        </article>
        <article className="card p-5">
          <h3 className="mb-3 font-semibold">Campaigns</h3>
          {!campaigns?.length ? <EmptyState title="No campaigns" description="Launch the first package from campaigns page." /> : (
            <ul className="space-y-2 text-sm">
              {campaigns.map((row) => (
                <li key={row.id} className="rounded-xl border border-white/10 p-3">
                  <Link href={`/campaigns/${row.id}`} className="text-neonMint">{row.package_name}</Link> · {row.status}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </AppShell>
  );
}
