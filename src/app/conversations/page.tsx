import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { createConversation } from '@/app/actions';
import { requireUser } from '@/lib/data';

export default async function ConversationsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: artists }, { data: rows }] = await Promise.all([
    supabase.from('artists').select('id,name').eq('owner_id', user.id).order('name'),
    supabase.from('conversations').select('*,artists(name)').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(50)
  ]);

  return (
    <AppShell>
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Outreach Log</h2>
        <form action={createConversation} className="grid gap-2 md:grid-cols-4">
          <select className="input" name="artist_id" required>{artists?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input className="input" name="channel" placeholder="IG DM / Email" required />
          <input className="input" name="message_sent" placeholder="Message sent" required />
          <input className="input" name="response" placeholder="Response" />
          <input className="input" name="outcome" placeholder="Outcome" />
          <input className="input" name="next_followup_at" type="datetime-local" />
          <button className="btn-primary">Save touchpoint</button>
        </form>
        {!rows?.length ? <EmptyState title="No conversations yet" description="Log outreach to track follow-ups and outcomes." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-400"><th>Artist</th><th>Channel</th><th>Outcome</th><th>Follow-up</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-white/10"><td className="py-2">{(r.artists as {name:string} | null)?.name}</td><td>{r.channel}</td><td>{r.outcome || '—'}</td><td>{r.next_followup_at ? new Date(r.next_followup_at).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>
        )}
      </section>
    </AppShell>
  );
}
