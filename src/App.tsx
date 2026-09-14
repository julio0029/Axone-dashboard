import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { KerryPage } from './pages/KerryPage'
import { ChronosPage } from './pages/ChronosPage'
import { TibotSuitePage } from './pages/TibotSuitePage'
import { TibotForwardPage } from './pages/TibotForwardPage'
import { TibotBatchesPage } from './pages/TibotBatchesPage'
import { TaV2Page } from './pages/TaV2Page'
import { RegistryPage } from './pages/RegistryPage'
import { ComingSoon } from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ArchitecturePage />} />
        <Route path="kerry" element={<KerryPage />} />
        <Route path="chronos" element={<ChronosPage />} />
        <Route path="tibot" element={<TibotSuitePage />} />
        <Route path="tibot-forward" element={<TibotForwardPage />} />
        <Route path="tibot-batches" element={<TibotBatchesPage />} />
        <Route path="ta-v2" element={<TaV2Page />} />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="agent/:id" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
