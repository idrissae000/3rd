import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { createCampaign } from '@/app/actions';
import { requireUser } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export default async function CampaignsPage({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase, user } = await requireUser();
  const artistPromise = supabase.from('artists').select('id,name').eq('owner_id', user.id).order('name');
  let query = supabase.from('campaigns').select('*,artists(name)').eq('owner_id', user.id).order('created_at', { ascending: false });
  if (searchParams.status) query = query.eq('status', searchParams.status);
  const [{ data: artists }, { data: campaigns }] = await Promise.all([artistPromise, query]);

  return (
    <AppShell>
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <form method="GET"><select name="status" className="input" defaultValue={searchParams.status ?? ''}><option value="">All</option><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option></select></form>
        </div>
        <form action={createCampaign} className="grid gap-2 md:grid-cols-4">
          <select className="input" name="artist_id" required>{artists?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input className="input" name="package_name" placeholder="Package" required />
          <input className="input" name="start_date" type="date" required />
          <input className="input" name="end_date" type="date" required />
          <input className="input" name="budget_total" type="number" min="0" step="0.01" placeholder="Budget" required />
          <input className="input" name="my_cut_percent" type="number" min="0" max="1" step="0.01" defaultValue="0.35" />
          <select className="input" name="status" defaultValue="draft"><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option></select>
          <button className="btn-primary">Create campaign</button>
        </form>
        {!campaigns?.length ? <EmptyState title="No campaigns" description="Create one to assign edits and track payouts." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-400"><th>Artist</th><th>Package</th><th>Status</th><th>Budget</th><th /></tr></thead><tbody>{campaigns.map((c) => <tr className="border-t border-white/10" key={c.id}><td className="py-2">{(c.artists as {name:string}|null)?.name}</td><td>{c.package_name}</td><td>{c.status}</td><td>{formatCurrency(Number(c.budget_total))}</td><td><Link className="text-neonMint" href={`/campaigns/${c.id}`}>Open</Link></td></tr>)}</tbody></table></div>
        )}
      </section>
    </AppShell>
  );
}
