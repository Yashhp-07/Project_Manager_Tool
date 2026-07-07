import type { TaskFilters as TaskFiltersType } from '../types'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onChange: (filters: TaskFiltersType) => void
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const update = (key: keyof TaskFiltersType, value: string) => {
    onChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="filter-owner" className="block text-xs font-medium text-slate">
          Owner
        </label>
        <input
          id="filter-owner"
          type="text"
          placeholder="Filter by owner…"
          className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder-slate focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={filters.owner ?? ''}
          onChange={(e) => update('owner', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="filter-status" className="block text-xs font-medium text-slate">
          Status
        </label>
        <select
          id="filter-status"
          className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-priority" className="block text-xs font-medium text-slate">
          Priority
        </label>
        <select
          id="filter-priority"
          className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={filters.priority ?? ''}
          onChange={(e) => update('priority', e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
  )
}
