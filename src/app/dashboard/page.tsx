import { AppShell } from '@/components/app-shell';
import { KpiCard } from '@/components/kpi-card';
import { requireUser } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [campaigns, leads, payouts, profitability] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'active'),
    supabase
      .from('artists')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .in('status', ['new', 'contacted']),
    supabase.from('payouts').select('amount_cents,status').eq('owner_id', user.id).neq('status', 'paid'),
    supabase.from('campaign_profitability').select('*').eq('owner_id', user.id)
  ]);

  const pendingPayouts = (payouts.data ?? []).reduce((acc, p) => acc + p.amount_cents / 100, 0);
  const profit = (profitability.data ?? []).reduce((acc, row) => acc + Number(row.profit_estimate ?? 0), 0);

  const kpis = [
    { title: 'Active Campaigns', value: String(campaigns.count ?? 0) },
    { title: 'New / Warm Leads', value: String(leads.count ?? 0) },
    { title: 'Payouts Due', value: formatCurrency(pendingPayouts) },
    { title: 'Profit Estimate', value: formatCurrency(profit) }
  ];

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>
      <section className="card p-5">
        <h2 className="text-lg font-semibold">HQ Pulse</h2>
        <p className="mt-2 text-sm text-slate-400">
          Track campaign progress, outreach touchpoints, and payout status at a glance. Use the sidebar to jump into each workflow lane.
        </p>
      </section>
    </AppShell>
  );
}
