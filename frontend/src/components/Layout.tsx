import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MeetingSidebar from './MeetingSidebar'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [sidebarRefresh, setSidebarRefresh] = useState(0)

  const handleSelectMeeting = (id: string | null, targetPath?: string) => {
    setSelectedMeetingId(id)
    if (targetPath) {
      navigate(targetPath)
    } else if (pathname !== '/tasks') {
      navigate('/tasks')
    }
  }

  const handleMeetingCreated = () => {
    setSidebarRefresh((k) => k + 1)
  }

  return (
    <div className="flex min-h-screen w-full bg-surface text-on-surface">
      <MeetingSidebar
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={handleSelectMeeting}
        refreshKey={sidebarRefresh}
      />
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-lg md:p-xl w-full">
          <div className="max-w-container-max mx-auto w-full">
            <Outlet context={{ selectedMeetingId, onMeetingCreated: handleMeetingCreated }} />
          </div>
        </main>
      </div>
    </div>
  )
}
