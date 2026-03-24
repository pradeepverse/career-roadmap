import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { RoadmapPage } from './pages/RoadmapPage'
import { WeekDetailPage } from './pages/WeekDetailPage'
import { LogPage } from './pages/LogPage'
import { AuthPage } from './pages/AuthPage'
import { SharePage } from './pages/SharePage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/career-roadmap">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/week/:weekId" element={<WeekDetailPage />} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/share/:userId" element={<SharePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
