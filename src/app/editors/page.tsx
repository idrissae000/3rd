import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { createEditor } from '@/app/actions';
import { requireUser } from '@/lib/data';

export default async function EditorsPage() {
  const { supabase, user } = await requireUser();
  const { data: editors } = await supabase.from('editors').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });

  return (
    <AppShell>
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Editors</h2>
        <form action={createEditor} className="grid gap-2 md:grid-cols-4">
          <input className="input" name="name" placeholder="Editor name" required />
          <input className="input" name="payment_handle" placeholder="Payment handle" />
          <input className="input md:col-span-2" name="notes" placeholder="Notes" />
          <button className="btn-primary">Add editor</button>
        </form>
        {!editors?.length ? <EmptyState title="No editors yet" description="Add your preferred editors for deliverable assignment." /> : (
          <ul className="space-y-2">{editors.map((editor) => <li className="rounded-xl border border-white/10 p-3" key={editor.id}>{editor.name} · {editor.payment_handle || '—'}</li>)}</ul>
        )}
      </section>
    </AppShell>
  );
}
