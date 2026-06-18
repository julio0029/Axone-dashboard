import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { KerryPage } from './pages/KerryPage'
import { ComingSoon } from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ArchitecturePage />} />
        <Route path="kerry" element={<KerryPage />} />
        <Route path="agent/:id" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
