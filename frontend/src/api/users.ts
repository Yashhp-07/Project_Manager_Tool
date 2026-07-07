import type { User } from '../types'
import { get } from './client'

export async function listUsers(): Promise<User[]> {
  return get<User[]>('/users')
}
