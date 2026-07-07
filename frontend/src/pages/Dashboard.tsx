import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-5xl lg:text-6xl font-bold text-primary">
        Mini AI Project Manager
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant max-w-lg">
        Paste a meeting transcript and let AI extract your action items.
      </p>
      <p className="mt-1 text-sm text-outline">
        Select a meeting from the sidebar, or create a new one below.
      </p>
      <button
        type="button"
        onClick={() => navigate('/meetings/new')}
        className="mt-8 rounded-lg bg-primary px-8 py-4 text-base font-medium text-on-primary hover:opacity-90 transition-opacity"
      >
        Create Your First Meeting
      </button>
    </div>
  )
}
