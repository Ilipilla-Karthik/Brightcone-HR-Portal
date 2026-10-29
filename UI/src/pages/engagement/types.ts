export type PostType = 'Update' | 'Kudos' | 'Celebration' | 'Announcement' | 'Welcome';

export interface PostComment {
  by: string;
  t: string;
}

export interface FeedPost {
  id: string;
  by: string;
  type: PostType;
  to?: string;
  t: string;
  d: string;
  likes: string[];
  comments: PostComment[];
}

export interface GroupItem {
  n: string;
  m: number;
}

export interface AnnouncementItem {
  id: string;
  t: string;
  b: string;
  d: string;
  pin: boolean;
}

export interface DirectoryEmployee {
  id: string;
  name: string;
  role: string;
  dept: string;
  loc: string;
  status: 'Active' | 'On leave' | 'Probation' | 'Notice period' | 'Inactive';
  joined: string;
  mgr?: string;
  phone: string;
  email?: string;
  ctc?: number;
  dob?: string;
}

export interface EventItem {
  id: string;
  name: string;
  etype: 'Celebration' | 'Festival' | 'Offsite' | 'Sports' | 'CSR' | 'Team outing' | 'Other';
  date: string;
  time?: string;
  venue?: string;
  organiser?: string;
  budget?: number;
  att?: number;
  status: 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface FeedbackItem {
  id: string;
  anon: 'Yes' | 'No';
  emp?: string;
  cat: 'Workplace' | 'Manager' | 'Policy' | 'Facilities' | 'Pay & benefits' | 'Culture' | 'Other';
  rating?: string;
  text: string;
  date: string;
  owner?: string;
  action?: string;
  status: 'Pending' | 'In progress' | 'Completed';
}

export interface TownhallItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  mode?: 'In person' | 'Online' | 'Hybrid';
  host?: string;
  agenda?: string;
  att?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  minutes?: string;
  actions?: string;
}

export interface CelebrationItem {
  id: string;
  empId: string;
  name: string;
  occasion: 'Birthday' | 'Work anniversary';
  date: string;
  daysAway: number;
  milestone: string;
  dept: string;
}
