import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './contexts/AppContext'
import MobileShell from './components/layout/MobileShell'
import LoginScreen from './screens/Auth/LoginScreen'
import ProfileSetupScreen from './screens/Onboarding/ProfileSetupScreen'
import HomeScreen from './screens/Home/HomeScreen'
import StartPlanScreen from './screens/Start/StartPlanScreen'
import JoinScreen from './screens/Join/JoinScreen'
import MapScreen from './screens/Map/MapScreen'
import GroupDetailScreen from './screens/GroupDetail/GroupDetailScreen'
import ChatScreen from './screens/Chat/ChatScreen'
import ProfileScreen from './screens/Profile/ProfileScreen'
import PublicProfileCard from './screens/Profile/PublicProfileCard'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state } = useApp()
  if (state.isLoading) return (
    <div className="flex items-center justify-center h-full bg-paper">
      <div className="font-display text-2xl text-ink-2">φιλία</div>
    </div>
  )
  if (!state.currentUser) return <Navigate to="/login" replace />
  if (!state.currentUser.isOnboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/onboarding" element={<ProfileSetupScreen />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
          <Route path="/start" element={<RequireAuth><StartPlanScreen /></RequireAuth>} />
          <Route path="/join" element={<RequireAuth><JoinScreen /></RequireAuth>} />
          <Route path="/map" element={<RequireAuth><MapScreen /></RequireAuth>} />
          <Route path="/plan/:id" element={<RequireAuth><GroupDetailScreen /></RequireAuth>} />
          <Route path="/chat/:planId" element={<RequireAuth><ChatScreen /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/profile/:userId" element={<RequireAuth><PublicProfileCard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </MobileShell>
    </BrowserRouter>
  )
}
