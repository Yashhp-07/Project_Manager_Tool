import type { Meeting, MeetingCreate } from '../types'
import { get, post } from './client'

export async function createMeeting(data: MeetingCreate): Promise<Meeting> {
  return post<Meeting>('/meetings', data)
}

export async function getMeeting(id: string): Promise<Meeting> {
  return get<Meeting>(`/meetings/${id}`)
}
