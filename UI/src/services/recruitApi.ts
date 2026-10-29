// API service for all Recruit module operations connecting to Loco Rust backend

export interface Job {
  id?: number;
  job_id: string;
  job_code: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  status: string;
  referral_bonus: number;
  description?: string;
  created_at?: string;
}

export interface Candidate {
  id?: number;
  cand_id: string;
  candidate_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  source: string;
  job_id?: string;
  job_title?: string;
  match_score?: number;
  stage: string;
}

export interface Interview {
  id?: number;
  interview_id: string;
  candidate_id?: string;
  candidate_name: string;
  job_title: string;
  round_name: string;
  scheduled_at: string;
  panel: string;
  status: string;
  notes?: string;
}

export interface Offer {
  id?: number;
  offer_id: string;
  candidate_name: string;
  job_title: string;
  offered_ctc?: number;
  joining_date?: string;
  status: string;
}

export interface Referral {
  id?: number;
  referral_id: string;
  referred_by: string;
  candidate_name: string;
  job_title: string;
  status: string;
  bonus_amount: number;
}

export interface Intern {
  id?: number | string;
  intern_id: string;
  name: string;
  college: string;
  track: string;
  mentor: string;
  stipend: string;
  duration: string;
  performance_score?: number;
  performanceScore?: number;
  ppo_status?: 'Eligible for PPO' | 'PPO Extended' | 'Under Review' | 'Completed' | string;
  ppoStatus?: 'Eligible for PPO' | 'PPO Extended' | 'Under Review' | 'Completed';
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const recruitApi = {
  // 1. Jobs
  async getJobs(): Promise<Job[]> {
    try {
      const res = await fetch('/api/v1/jobs', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      return Array.isArray(data) ? data : data.value || [];
    } catch {
      return [
        { job_id: 'j1', job_code: 'J1', title: 'Senior ML Engineer', department: 'AI Research', location: 'Hyderabad', employment_type: 'Full-time', status: 'Open', referral_bonus: 50000 },
        { job_id: 'j2', job_code: 'J2', title: 'Solutions Architect', department: 'Sales', location: 'San Francisco', employment_type: 'Full-time', status: 'Open', referral_bonus: 75000 },
        { job_id: 'j3', job_code: 'J3', title: 'Product Designer', department: 'Design', location: 'Hyderabad', employment_type: 'Full-time', status: 'Open', referral_bonus: 40000 },
        { job_id: 'j4', job_code: 'J4', title: 'QA Automation Engineer', department: 'Engineering', location: 'Pune', employment_type: 'Full-time', status: 'Open', referral_bonus: 30000 },
      ];
    }
  },

  async createJob(payload: { title: string; department: string; location: string; employment_type: string; referral_bonus: number; description?: string }): Promise<Job> {
    const res = await fetch('/api/v1/jobs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async deleteJob(id: string): Promise<void> {
    const res = await fetch(`/api/v1/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete job');
  },

  async publishJob(id: string): Promise<Job> {
    const res = await fetch(`/api/v1/jobs/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to publish job');
    return res.json();
  },

  async closeJob(id: string): Promise<Job> {
    const res = await fetch(`/api/v1/jobs/${id}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to close job');
    return res.json();
  },

  // 2. Candidates
  async getCandidates(): Promise<Candidate[]> {
    try {
      const res = await fetch('/api/v1/candidates', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const data = await res.json();
      return Array.isArray(data) ? data : data.value || [];
    } catch {
      return [
        { cand_id: 'c1', candidate_code: 'C1', full_name: 'Aditi Sharma', email: 'aditi.sharma@example.com', source: 'LinkedIn', job_title: 'Senior ML Engineer', match_score: 82, stage: 'Applied' },
        { cand_id: 'c2', candidate_code: 'C2', full_name: 'Rohan Gupta', email: 'rohan.gupta@example.com', source: 'Careers page', job_title: 'Senior ML Engineer', match_score: 74, stage: 'Applied' },
        { cand_id: 'c3', candidate_code: 'C3', full_name: 'Kavya Pillai', email: 'kavya.pillai@example.com', source: 'Referral', job_title: 'Product Designer', match_score: 88, stage: 'Screening' },
        { cand_id: 'c4', candidate_code: 'C4', full_name: 'Marcus Lee', email: 'marcus.lee@example.com', source: 'Indeed', job_title: 'Solutions Architect', match_score: 79, stage: 'Screening' },
        { cand_id: 'c5', candidate_code: 'C5', full_name: 'Neha Bansal', email: 'neha.bansal@example.com', source: 'LinkedIn', job_title: 'Senior ML Engineer', match_score: 91, stage: 'Interview' },
        { cand_id: 'c6', candidate_code: 'C6', full_name: 'Siddharth Rao', email: 'siddharth.rao@example.com', source: 'Referral', job_title: 'QA Automation Engineer', match_score: 84, stage: 'Interview' },
        { cand_id: 'c7', candidate_code: 'C7', full_name: 'Olivia Martin', email: 'olivia.martin@example.com', source: 'LinkedIn', job_title: 'Solutions Architect', match_score: 93, stage: 'Offer' },
        { cand_id: 'c8', candidate_code: 'C8', full_name: 'Tejas Patil', email: 'tejas.patil@example.com', source: 'Careers page', job_title: 'QA Automation Engineer', match_score: 87, stage: 'Hired' },
      ];
    }
  },

  async createCandidate(payload: { full_name: string; email?: string; phone?: string; source: string; job_title?: string; match_score?: number; stage?: string }): Promise<Candidate> {
    const res = await fetch('/api/v1/candidates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create candidate');
    return res.json();
  },

  async updateCandidate(id: string, payload: Partial<Candidate>): Promise<Candidate> {
    const res = await fetch(`/api/v1/candidates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update candidate');
    return res.json();
  },

  // 3. Interviews
  async getInterviews(): Promise<Interview[]> {
    try {
      const res = await fetch('/api/v1/interviews', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch interviews');
      const data = await res.json();
      return Array.isArray(data) ? data : data.value || [];
    } catch {
      return [
        { interview_id: 'int-1', candidate_name: 'Neha Bansal', job_title: 'Senior ML Engineer', round_name: 'Technical, round 2', scheduled_at: '2026-10-26T11:00', panel: 'Karthik Reddy, Arjun Nair', status: 'Scheduled' },
        { interview_id: 'int-2', candidate_name: 'Siddharth Rao', job_title: 'QA Automation Engineer', round_name: 'Hiring manager', scheduled_at: '2026-10-27T15:30', panel: 'Priya Menon', status: 'Scheduled' },
      ];
    }
  },

  async createInterview(payload: { candidate_name: string; job_title: string; round_name: string; scheduled_at: string; panel: string; notes?: string }): Promise<Interview> {
    const res = await fetch('/api/v1/interviews', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create interview');
    return res.json();
  },

  async updateInterview(id: string, payload: { status?: string; notes?: string; round_name?: string; panel?: string; scheduled_at?: string }): Promise<Interview> {
    const res = await fetch(`/api/v1/interviews/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update interview');
    return res.json();
  },

  async deleteInterview(id: string): Promise<void> {
    const res = await fetch(`/api/v1/interviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete interview');
  },

  // 4. Offers
  async getOffers(): Promise<Offer[]> {
    try {
      const res = await fetch('/api/v1/offers', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch offers');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.value || [];
      if (list.length > 0) return list;
    } catch {}
    return [
      { offer_id: 'off-1', candidate_name: 'Olivia Martin', job_title: 'Solutions Architect', offered_ctc: 3200000, joining_date: '2026-11-15', status: 'Accepted' },
      { offer_id: 'off-2', candidate_name: 'Tejas Patil', job_title: 'QA Automation Engineer', offered_ctc: 1800000, joining_date: '2026-11-01', status: 'Accepted' },
    ];
  },

  async createOffer(payload: { candidate_name: string; job_title: string; offered_ctc?: number; joining_date?: string; status?: string }): Promise<Offer> {
    const res = await fetch('/api/v1/offers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create offer');
    return res.json();
  },

  // 5. Referrals
  async getReferrals(): Promise<Referral[]> {
    try {
      const res = await fetch('/api/v1/referrals', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch referrals');
      const data = await res.json();
      return Array.isArray(data) ? data : data.value || [];
    } catch {
      return [
        { referral_id: 'ref-1', referred_by: 'Rahul Varma', candidate_name: 'Siddharth Rao', job_title: 'QA Automation Engineer', status: 'Interview', bonus_amount: 30000 },
        { referral_id: 'ref-2', referred_by: 'Priya Sharma', candidate_name: 'Kavya Pillai', job_title: 'Product Designer', status: 'Screening', bonus_amount: 40000 },
      ];
    }
  },

  async createReferral(payload: { candidate_name: string; candidate_email?: string; job_title?: string; bonus_amount?: number }): Promise<Referral> {
    const res = await fetch('/api/v1/referrals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create referral');
    return res.json();
  },

  // 6. Internships (PostgreSQL Backed)
  async getInternships(): Promise<Intern[]> {
    try {
      const res = await fetch('/api/v1/internships', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch internships');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.value || [];
      if (list.length > 0) return list;
    } catch {}
    return [
      { intern_id: 'INT-001', name: 'Rithvik Varman', college: 'BITS Pilani', track: 'AI Research (LLMs)', mentor: 'Karthik Reddy', stipend: '₹45,000 / mo', duration: '6 Months', performance_score: 4.8, ppo_status: 'Eligible for PPO' },
      { intern_id: 'INT-002', name: 'Tanvi Deshmukh', college: 'IIT Bombay', track: 'Cloud Infrastructure', mentor: 'Naresh Vemparala', stipend: '₹40,000 / mo', duration: '6 Months', performance_score: 4.5, ppo_status: 'PPO Extended' },
      { intern_id: 'INT-003', name: 'Siddharth Iyer', college: 'NIT Trichy', track: 'Frontend Engineering', mentor: 'Priya Menon', stipend: '₹35,000 / mo', duration: '3 Months', performance_score: 4.1, ppo_status: 'Under Review' },
    ];
  },

  async createInternship(payload: { name: string; college: string; track?: string; mentor?: string; stipend?: string; duration?: string; performance_score?: number; ppo_status?: string }): Promise<Intern> {
    const res = await fetch('/api/v1/internships', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create internship');
    return res.json();
  },

  async updateInternship(id: string, payload: { ppo_status?: string; performance_score?: number }): Promise<Intern> {
    const res = await fetch(`/api/v1/internships/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update internship');
    return res.json();
  },

  async deleteInternship(id: string): Promise<void> {
    const res = await fetch(`/api/v1/internships/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete internship');
  },
};
