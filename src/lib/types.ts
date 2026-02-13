export type KPI = {
  title: string;
  value: string;
  hint?: string;
};

export type ArtistStatus = 'new' | 'contacted' | 'negotiating' | 'active' | 'paused' | 'closed';
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type PayoutStatus = 'pending' | 'approved' | 'paid';
