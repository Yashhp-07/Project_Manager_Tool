/* ── Enums ── */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export type UserRole = 'admin' | 'manager' | 'member'

/* ── Domain types (mirror backend schemas) ── */

export interface Task {
  id: string
  meeting_id: string
  description: string
  owners: string[]
  owner_user_id: string | null
  due_date: string | null
  priority: Priority
  status: TaskStatus
  confirmed: boolean
  evidence_quote: string | null
  created_at: string
  updated_at: string
}

export interface MeetingSummary {
  id: string
  title: string
  meeting_date: string
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  transcript: string
  meeting_date: string
  created_at: string
  tasks: Task[]
}

export interface User {
  id: string
  name: string
  email: string | null
  role: UserRole
}

/* ── Request payloads ── */

export interface MeetingCreate {
  title?: string | null
  transcript: string
  meeting_date: string
}

export interface TaskUpdate {
  description?: string | null
  owners?: string[] | null
  owner_user_id?: string | null
  due_date?: string | null
  priority?: Priority | null
  status?: TaskStatus | null
}

/* ── Query params ── */

export interface TaskFilters {
  meeting_id?: string
  owner?: string
  status?: string
  priority?: string
}

/* ── API error ── */

export interface ApiError {
  detail: string
  raw_output?: string | null
}
