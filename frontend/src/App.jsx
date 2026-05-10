import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Library from './pages/Library.jsx'
import WorldDetail from './pages/WorldDetail.jsx'
import CharacterForm from './pages/CharacterForm.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/library" element={<Library />} />
        <Route path="/world/:id" element={<WorldDetail />} />
        <Route path="/character/new" element={<CharacterForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/library" replace />} />
    </Routes>
  )
}
