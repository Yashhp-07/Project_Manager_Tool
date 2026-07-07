import { useEffect, useState } from 'react'
import type { TaskFilters as TaskFiltersType, User } from '../types'
import { listUsers } from '../api/users'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onChange: (filters: TaskFiltersType) => void
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => {
        // API unavailable — show empty dropdown (just "All")
        setUsers([])
      })
  }, [])

  const update = (key: keyof TaskFiltersType, value: string) => {
    const updated = { ...filters }
    if (value) {
      updated[key] = value
    } else {
      delete updated[key]
    }
    onChange(updated)
  }

  return (
    <div className="flex flex-wrap gap-sm items-center">
      <div className="flex items-center gap-2 mr-2">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Filters:</span>
      </div>

      <select
        value={filters.owner || ''}
        onChange={(e) => update('owner', e.target.value)}
        className="px-3 py-1 bg-surface-container-highest rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors border-none focus:ring-1 focus:ring-primary appearance-none pr-8 cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
      >
        <option value="">Owner (All)</option>
        {users.map((u) => (
          <option key={u.id} value={u.name}>{u.name}</option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) => update('status', e.target.value)}
        className="px-3 py-1 bg-surface-container-highest rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors border-none focus:ring-1 focus:ring-primary appearance-none pr-8 cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
      >
        <option value="">Status (All)</option>
        <option value="NOT_STARTED">Not Started</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => update('priority', e.target.value)}
        className="px-3 py-1 bg-surface-container-highest rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors border-none focus:ring-1 focus:ring-primary appearance-none pr-8 cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
      >
        <option value="">Priority (All)</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
    </div>
  )
}
