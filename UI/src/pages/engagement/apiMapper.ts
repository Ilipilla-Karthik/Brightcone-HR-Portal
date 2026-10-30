import { ConnectPostApiRecord } from '../../services/signConnectApi';
import {
  FeedPost,
  PostType,
  AnnouncementItem,
  DirectoryEmployee,
  EventItem,
  FeedbackItem,
  TownhallItem,
  CelebrationItem,
} from './types';

export function mapPostFromApi(p: ConnectPostApiRecord): FeedPost {
  const likesArr: string[] = [];
  for (let i = 0; i < p.likes_count; i++) {
    likesArr.push(i === 0 ? 'Karthik Reddy' : i === 1 ? 'Arjun Nair' : 'Ananya Rao');
  }
  return {
    id: p.post_id || `PO${p.id}`,
    by: p.author_name || 'Team Member',
    type: (p.post_type as PostType) || 'Update',
    to: p.to_employee_name || undefined,
    t: p.body,
    d: p.created_at ? p.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    likes: likesArr,
    comments: [],
  };
}

export function mapAnnouncementFromPost(p: any): AnnouncementItem {
  const bodyText = p.body || '';
  const firstLine = bodyText.split('\n')[0];
  const title = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
  return {
    id: p.post_id || `A${p.id}`,
    t: title || 'Company Announcement',
    b: bodyText,
    d: p.created_at ? p.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    pin: !!p.pinned,
  };
}

export function mapDirectoryEmployeeFromApi(e: any): DirectoryEmployee {
  return {
    id: e.employee_code || `BC-${e.id}`,
    name: e.full_name || '',
    role: e.job_title || 'Team Member',
    dept: e.department || 'General',
    loc: e.location || 'Hyderabad HQ',
    status: (e.status as any) || 'Active',
    joined: e.joined || '2025-01-15',
    mgr: e.manager_name || undefined,
    phone: e.phone || '+91 98765 43210',
    email: e.work_email || `${(e.full_name || 'emp').toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
    dob: e.dob || undefined,
  };
}

export function mapCelebrationFromApi(c: any): CelebrationItem {
  return {
    id: c.id,
    empId: c.empId || c.employee_code || 'BC-1001',
    name: c.name || c.full_name || 'Team Member',
    occasion: (c.occasion as any) || 'Birthday',
    date: c.date || 'Today',
    daysAway: typeof c.daysAway === 'number' ? c.daysAway : 0,
    milestone: c.milestone || c.detail || 'Celebration',
    dept: c.dept || c.department || 'Brightcone',
  };
}

export function mapEventFromApi(ev: any): EventItem {
  return {
    id: ev.id || `EV-${Math.random()}`,
    name: ev.name || ev.title || 'Company Event',
    etype: (ev.etype as any) || 'Celebration',
    date: ev.date || '2026-11-01',
    time: ev.time || '15:00',
    venue: ev.venue || ev.place || 'Hyderabad HQ',
    organiser: ev.organiser || 'People Ops',
    budget: ev.budget || 50000,
    att: ev.att || 50,
    status: (ev.status as any) || 'Planned',
    notes: ev.notes || ev.description || '',
  };
}

export function mapTownhallFromApi(th: any): TownhallItem {
  return {
    id: th.id,
    title: th.title || 'Brightcone All-Hands',
    date: th.date || '2026-10-30',
    time: th.time || '15:00',
    mode: (th.mode as any) || 'Hybrid',
    host: th.host || 'Leadership',
    agenda: th.agenda || '',
    att: th.att || 100,
    status: (th.status as any) || 'Scheduled',
    minutes: th.minutes || '',
    actions: th.actions || '',
  };
}

export function mapFeedbackFromApi(fb: any): FeedbackItem {
  return {
    id: fb.feedback_id,
    anon: 'Yes',
    cat: (fb.category as any) || 'Workplace',
    text: fb.body || '',
    date: fb.created_at ? fb.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    owner: 'Ananya Rao',
    action: 'Logged for review by HR committee',
    status: (fb.status as any) || 'Pending',
  };
}
