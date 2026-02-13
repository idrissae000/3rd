import { signInWithEmail } from '@/app/actions';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="card w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-slate-400">Sign in to Idriss Music Promos HQ.</p>
        {searchParams.error ? <p className="text-sm text-red-300">Invalid login credentials.</p> : null}
        <form action={signInWithEmail} className="space-y-3">
          <input className="input" name="email" type="email" placeholder="Email" required />
          <input className="input" name="password" type="password" placeholder="Password" required />
          <button className="btn-primary w-full" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
