import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { createArtist } from '@/app/actions';
import { requireUser } from '@/lib/data';

export default async function ArtistsPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string };
}) {
  const { supabase, user } = await requireUser();
  let query = supabase.from('artists').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`);
  const { data: artists } = await query;

  return (
    <AppShell>
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Artists / Leads</h2>
          <form className="flex gap-2" method="GET">
            <input name="q" placeholder="Search artist" className="input" defaultValue={searchParams.q} />
            <select name="status" className="input" defaultValue={searchParams.status ?? ''}>
              <option value="">All status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="negotiating">Negotiating</option>
              <option value="active">Active</option>
            </select>
            <button className="btn-secondary">Filter</button>
          </form>
        </div>

        <form action={createArtist} className="mb-4 grid gap-2 md:grid-cols-4">
          <input className="input" name="name" required placeholder="Artist name" />
          <input className="input" name="platform" required placeholder="Platform" />
          <input className="input" name="handle" required placeholder="Handle" />
          <input className="input" name="genre" required placeholder="Genre" />
          <select className="input" name="status" defaultValue="new">
            <option value="new">New</option><option value="contacted">Contacted</option><option value="negotiating">Negotiating</option><option value="active">Active</option>
          </select>
          <input className="input md:col-span-2" name="notes" placeholder="Notes" />
          <button className="btn-primary">Add Lead</button>
        </form>

        {!artists?.length ? (
          <EmptyState title="No artists yet" description="Add your first lead above to start your pipeline." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr><th>Name</th><th>Platform</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.id} className="border-t border-white/10">
                    <td className="py-2">{artist.name}</td>
                    <td>{artist.platform} · {artist.handle}</td>
                    <td className="capitalize">{artist.status}</td>
                    <td><Link href={`/artists/${artist.id}`} className="text-neonMint">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
