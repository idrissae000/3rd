import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from './supabase-server';

export async function requireUser() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/auth/login');
  return { supabase, user: data.user };
}
