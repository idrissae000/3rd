import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { createEdit, createPayoutForEdit } from '@/app/actions';
import { requireUser } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const [{ data: campaign }, { data: editors }, { data: edits }, { data: payouts }] = await Promise.all([
    supabase.from('campaign_profitability').select('*').eq('owner_id', user.id).eq('campaign_id', params.id).single(),
    supabase.from('editors').select('id,name').eq('owner_id', user.id).order('name'),
    supabase.from('edits').select('*,editors(name)').eq('owner_id', user.id).eq('campaign_id', params.id).order('created_at', { ascending: false }),
    supabase.from('payouts').select('*').eq('owner_id', user.id).in('edit_id', (await supabase.from('edits').select('id').eq('owner_id', user.id).eq('campaign_id', params.id)).data?.map((e) => e.id) || [])
  ]);

  return (
    <AppShell>
      <section className="card p-5">
        <h2 className="text-xl font-semibold">{campaign?.package_name ?? 'Campaign'}</h2>
        <p className="text-sm text-slate-400">Budget {formatCurrency(Number(campaign?.budget_total ?? 0))} · Revenue {formatCurrency(Number(campaign?.my_revenue ?? 0))} · Profit {formatCurrency(Number(campaign?.profit_estimate ?? 0))}</p>
      </section>
      <section className="card p-5 space-y-4">
        <h3 className="font-semibold">Assign edit</h3>
        <form action={createEdit} className="grid gap-2 md:grid-cols-4">
          <input type="hidden" name="campaign_id" value={params.id} />
          <select className="input" name="editor_id" required>{editors?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <input className="input" name="video_link" placeholder="Video link" required />
          <input className="input" type="number" name="views" min="0" placeholder="Views" />
          <input className="input" name="due_date" type="date" />
          <select className="input" name="status" defaultValue="queued"><option value="queued">Queued</option><option value="editing">Editing</option><option value="delivered">Delivered</option></select>
          <button className="btn-primary">Save edit</button>
        </form>
        {!edits?.length ? <EmptyState title="No edits yet" description="Assign an editor and video deliverable." /> : (
          <div className="space-y-2">{edits.map((edit) => (
            <form key={edit.id} action={async () => { 'use server'; await createPayoutForEdit(edit.id); }} className="flex flex-wrap items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
              <div>{(edit.editors as {name:string}|null)?.name} · {edit.views} views · {edit.status}</div>
              <button className="btn-secondary" type="submit">Compute payout</button>
            </form>
          ))}</div>
        )}
      </section>
      <section className="card p-5">
        <h3 className="font-semibold">Payout summary</h3>
        <p className="mt-2 text-sm text-slate-400">{payouts?.length ?? 0} payouts linked to this campaign.</p>
      </section>
    </AppShell>
  );
}
