import { Link, Outlet, useLocation } from 'react-router-dom'
import { useViewRole } from '../context/ViewRoleContext'

const linkClass = (active: boolean) =>
  `text-sm font-medium transition-colors hover:text-accent ${
    active ? 'text-accent' : 'text-slate'
  }`

export default function Layout() {
  const { pathname } = useLocation()
  const { role, setRole } = useViewRole()

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-semibold text-ink">
            Mini PM
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/tasks" className={linkClass(pathname === '/tasks')}>
              Tasks
            </Link>
            <Link
              to="/meetings/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              + New Meeting
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl items-center justify-end px-4 pb-3">
          <label className="flex items-center gap-2 text-xs text-slate">
            Viewing as:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'pm' | 'owner')}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="pm">PM</option>
              <option value="owner">Owner</option>
            </select>
          </label>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
