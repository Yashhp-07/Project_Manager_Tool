import type { Meeting, MeetingCreate, MeetingSummary } from '../types'
import { get, post } from './client'

export async function listMeetings(): Promise<MeetingSummary[]> {
  return get<MeetingSummary[]>('/meetings')
}

export async function createMeeting(data: MeetingCreate): Promise<Meeting> {
  return post<Meeting>('/meetings', data)
}

export async function getMeeting(id: string): Promise<Meeting> {
  return get<Meeting>(`/meetings/${id}`)
}
