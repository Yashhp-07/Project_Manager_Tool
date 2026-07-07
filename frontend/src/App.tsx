import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ViewRoleProvider } from './context/ViewRoleContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewMeeting from './pages/NewMeeting'
import TasksPage from './pages/TasksPage'

function App() {
  return (
    <BrowserRouter>
      <ViewRoleProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meetings/new" element={<NewMeeting />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>
        </Routes>
      </ViewRoleProvider>
    </BrowserRouter>
  )
}

export default App
