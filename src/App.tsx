import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { KerryPage } from './pages/KerryPage'
import { ChronosPage } from './pages/ChronosPage'
import { TaV2Page } from './pages/TaV2Page'
import { ComingSoon } from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ArchitecturePage />} />
        <Route path="kerry" element={<KerryPage />} />
        <Route path="chronos" element={<ChronosPage />} />
        <Route path="ta-v2" element={<TaV2Page />} />
        <Route path="agent/:id" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
