export type UserRole = 'citizen' | 'university' | 'industry' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization_name?: string;
  department?: string;
  district: string;
  state: string;
  language_pref: string;
}

export type ProblemCategory =
  | 'Water & Sanitation'
  | 'Healthcare & Nutrition'
  | 'Education & Skill Development'
  | 'Roads & Infrastructure'
  | 'Agriculture & Irrigation'
  | 'Waste & Environment'
  | 'Clean Energy'
  | 'Disaster & Safety';

export type ProblemStatus =
  | 'Submitted'
  | 'Classified'
  | 'Clustered'
  | 'Adopted'
  | 'Solution Proposed'
  | 'Industry Supported'
  | 'Piloted'
  | 'Resolved';

export interface Problem {
  id: string;
  citizen_id: string;
  citizen_name?: string;
  title: string;
  description: string;
  category: ProblemCategory;
  ai_confidence: number;
  district: string;
  ward: string;
  state: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  status: ProblemStatus;
  cluster_id?: string;
  severity_score: number;
  affected_citizens_count: number;
  recommended_department: string;
  routing_rationale: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UniversityAdoption {
  id: string;
  problem_id: string;
  university_user_id: string;
  university_name: string;
  department: string;
  proposal_title?: string;
  proposal_text?: string;
  estimated_timeline?: string;
  budget_estimate?: number;
  status: 'Adopted' | 'Proposal Submitted' | 'In Pilot' | 'Resolved';
  adopted_at: string;
  proposal_submitted_at?: string;
}

export interface IndustrySupport {
  id: string;
  adoption_id: string;
  problem_id: string;
  industry_user_id: string;
  industry_name: string;
  support_type: 'funding' | 'implementation' | 'mentorship' | 'csr_grant';
  commitment_stage: 'Interested' | 'Committed' | 'Funded';
  amount_inr?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MoUAgreement {
  id: string;
  adoption_id: string;
  problem_id: string;
  industry_id: string;
  industry_name: string;
  university_id: string;
  university_name: string;
  template_type: 'Standard Joint IP' | 'Royalty Sharing Public Good' | 'Open Source Citizen Innovation';
  template_title: string;
  terms_summary: string;
  university_acknowledged: boolean;
  university_acknowledged_at?: string;
  industry_acknowledged: boolean;
  industry_acknowledged_at?: string;
  status: 'Draft' | 'Partially Acknowledged' | 'Active & Executed';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  channel: 'in-app' | 'sms' | 'whatsapp';
  title: string;
  message: string;
  status: 'sent' | 'simulated' | 'delivered';
  created_at: string;
}

export interface StatusLog {
  id: string;
  problem_id: string;
  old_status: string;
  new_status: string;
  changed_by_user_id: string;
  changed_by_name: string;
  role: string;
  notes?: string;
  created_at: string;
}
