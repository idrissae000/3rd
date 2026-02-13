import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { markPayoutPaid } from '@/app/actions';
import { requireUser } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export default async function PayoutsPage() {
  const { supabase, user } = await requireUser();
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*,editors(name),edits(video_link)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell>
      <section className="card p-5">
        <h2 className="mb-4 text-lg font-semibold">Payout Queue</h2>
        {!payouts?.length ? (
          <EmptyState title="No payouts" description="Compute payouts from campaign edits to populate this queue." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400"><th>Editor</th><th>Amount</th><th>Status</th><th /></tr></thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="py-2">{(p.editors as {name:string}|null)?.name}</td>
                    <td>{formatCurrency(p.amount_cents / 100)}</td>
                    <td className="capitalize">{p.status}</td>
                    <td>
                      {p.status !== 'paid' ? (
                        <form action={markPayoutPaid}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="btn-secondary">Mark paid</button>
                        </form>
                      ) : (
                        'Done'
                      )}
                    </td>
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
