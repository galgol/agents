import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Library from './pages/Library.jsx'
import WorldDetail from './pages/WorldDetail.jsx'
import CharacterForm from './pages/CharacterForm.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<Library />} />
        <Route path="/characters" element={<Navigate to="/main" replace />} />
        <Route path="/library" element={<Navigate to="/main" replace />} />
        <Route path="/world/:id" element={<WorldDetail />} />
        <Route path="/character/new" element={<CharacterForm />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  )
}
