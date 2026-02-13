import { KPI } from '@/lib/types';

export function KpiCard({ title, value, hint }: KPI) {
  return (
    <article className="card animate-float p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </article>
  );
}
