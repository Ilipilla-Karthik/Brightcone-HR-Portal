export interface User {
  id?: string;
  pid?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  departmentId?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  loc: string;
  mgr: string | null;
  status: 'Active' | 'Inactive' | 'On leave' | 'Probation' | 'Notice period';
}

export type CourseContentType = 'document' | 'video' | 'link';

export interface Course {
  id: string;
  title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  audience: string;
  due_date: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
  total_assigned: number;
  completed_count: number;
  completion_percentage: number;
  created_at?: string;
}

export interface CourseAssignment {
  id: string;
  course_id: string;
  employee_id: string;
  employee_name: string;
  progress: number;
  status: 'Not started' | 'In progress' | 'Completed';
  completed_at?: string | null;
}

export interface MyAssignment {
  assignment_id: string;
  course_id: string;
  course_title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  due_date: string | null;
  is_overdue?: boolean;
  progress: number;
  status: 'Not started' | 'In progress' | 'Completed';
  completed_at?: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
  score?: number | null;
}

export interface OpenMandatoryItem {
  assignment_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  course_id: string;
  course_title: string;
  due_date: string | null;
  progress: number;
}

export interface CourseCompletionStat {
  course_id: string;
  title: string;
  course_type: string;
  total_assigned: number;
  completed_count: number;
  percentage: number;
}

export interface MandatoryCourseStat {
  course_id: string;
  title: string;
  due_date: string | null;
  completed_count: number;
  total_assigned: number;
  completion_percentage?: number;
}

export interface LearnDashboardMetrics {
  mandatory_compliance: number;
  total_courses: number;
  mandatory_courses_count: number;
  elective_courses_count: number;
  in_progress_count: number;
  people_behind_count: number;
  active_learners_30d?: number;
  avg_completion_days?: number;
  completion_by_course: CourseCompletionStat[];
  compliance_breakdown: MandatoryCourseStat[];
  open_mandatory: OpenMandatoryItem[];
  total_open_mandatory: number;
}

export interface ReminderDetail {
  assignment_id: string;
  employee_name: string;
  course_title: string;
  status: 'Queued' | 'Delivered' | 'Skipped' | 'Failed';
  reason?: string | null;
}

export interface RemindResponse {
  queued: number;
  delivered: number;
  skipped: number;
  failed: number;
  message: string;
  details: ReminderDetail[];
}

export interface CreateCoursePayload {
  title: string;
  course_type: 'Mandatory' | 'Elective';
  duration: string;
  audience: string;
  due_date: string | null;
  content_type?: CourseContentType | null;
  content_url?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---------------------------------------------------------------------------
// REC-12: Performance Admin Types
// ---------------------------------------------------------------------------

export type ReviewStageIndex = 0 | 1 | 2 | 3 | 4;

export interface ReviewCycle {
  id: string;
  name: string;
  stage: number;
  self_review_due: string;
  status: 'Active' | 'Archived' | 'Completed';
  created_at?: string;
  updated_at?: string;
}

export interface CycleReviewItem {
  id: string;
  cycle_id: string;
  employee_id: string;
  employee_name: string;
  manager_name: string;
  department: string;
  self_review_status: 'Submitted' | 'Not submitted';
  self_rating?: string | null;
  goals_count: number;
  rating?: string | null;
  recommended_increment_percentage?: number | null;
  rated_by?: string | null;
  rated_at?: string | null;
  last_reminded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CycleDashboardSummary {
  self_reviews_submitted: number;
  manager_reviews_done: number;
  total_eligible: number;
  goals_count: number;
}

export interface CycleDashboardData {
  cycle: ReviewCycle;
  summary: CycleDashboardSummary;
  reviews: CycleReviewItem[];
}

export interface CreateCyclePayload {
  name: string;
  self_review_due: string;
}

export interface RateEmployeePayload {
  rating: string;
  recommended_increment_percentage?: number | null;
}

export interface RemindReviewResult {
  status: 'queued' | 'skipped' | 'failed';
  message: string;
  reason?: string | null;
}


export * from './learnTypes';
