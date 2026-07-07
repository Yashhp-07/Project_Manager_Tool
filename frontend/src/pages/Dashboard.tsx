import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Mini AI Project Manager
      </h1>
      <p className="mt-2 text-slate">
        Paste a meeting transcript and let AI extract your action items.
      </p>
      <Link
        to="/meetings/new"
        className="mt-8 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Create Your First Meeting
      </Link>
    </div>
  )
}
