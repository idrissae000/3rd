'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';

async function currentUser() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect('/auth/login');
  }
  return { supabase, user: data.user };
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/auth/login?error=1');
  redirect('/dashboard');
}

export async function createArtist(formData: FormData) {
  const { supabase, user } = await currentUser();
  const payload = {
    owner_id: user.id,
    name: String(formData.get('name')),
    platform: String(formData.get('platform')),
    handle: String(formData.get('handle')),
    genre: String(formData.get('genre')),
    status: String(formData.get('status')),
    notes: String(formData.get('notes') || '')
  };
  await supabase.from('artists').insert(payload);
  revalidatePath('/artists');
}

export async function createConversation(formData: FormData) {
  const { supabase, user } = await currentUser();
  await supabase.from('conversations').insert({
    owner_id: user.id,
    artist_id: String(formData.get('artist_id')),
    channel: String(formData.get('channel')),
    message_sent: String(formData.get('message_sent')),
    response: String(formData.get('response') || ''),
    outcome: String(formData.get('outcome') || ''),
    next_followup_at: String(formData.get('next_followup_at') || '') || null
  });
  revalidatePath('/conversations');
}

export async function createCampaign(formData: FormData) {
  const { supabase, user } = await currentUser();
  await supabase.from('campaigns').insert({
    owner_id: user.id,
    artist_id: String(formData.get('artist_id')),
    package_name: String(formData.get('package_name')),
    start_date: String(formData.get('start_date')),
    end_date: String(formData.get('end_date')),
    budget_total: Number(formData.get('budget_total')),
    my_cut_percent: Number(formData.get('my_cut_percent') || 0.35),
    status: String(formData.get('status')),
    notes: String(formData.get('notes') || '')
  });
  revalidatePath('/campaigns');
}

export async function createEditor(formData: FormData) {
  const { supabase, user } = await currentUser();
  await supabase.from('editors').insert({
    owner_id: user.id,
    name: String(formData.get('name')),
    payment_handle: String(formData.get('payment_handle') || ''),
    notes: String(formData.get('notes') || '')
  });
  revalidatePath('/editors');
}

export async function createEdit(formData: FormData) {
  const { supabase, user } = await currentUser();
  await supabase.from('edits').insert({
    owner_id: user.id,
    campaign_id: String(formData.get('campaign_id')),
    editor_id: String(formData.get('editor_id')),
    video_link: String(formData.get('video_link')),
    views: Number(formData.get('views') || 0),
    due_date: String(formData.get('due_date') || '') || null,
    status: String(formData.get('status'))
  });
  revalidatePath('/campaigns');
}

export async function createPayoutForEdit(editId: string) {
  const { supabase, user } = await currentUser();
  await supabase.rpc('create_or_refresh_payout_for_edit', { p_owner: user.id, p_edit_id: editId });
  revalidatePath('/payouts');
}

export async function markPayoutPaid(formData: FormData) {
  const { supabase } = await currentUser();
  await supabase
    .from('payouts')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', String(formData.get('id')));
  revalidatePath('/payouts');
}
