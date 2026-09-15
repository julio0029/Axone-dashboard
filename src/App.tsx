import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { KerryPage } from './pages/KerryPage'
import { WallyPage } from './pages/WallyPage'
import { ChronosPage } from './pages/ChronosPage'
import { TibotSuitePage } from './pages/TibotSuitePage'
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
        <Route path="ta-v2" element={<TaV2Page />} />
        <Route path="registry" element={<RegistryPage />} />
        {/* Wally research now lives under the Sandbox section */}
        <Route path="sandbox/wally" element={<WallyPage />} />
        <Route path="wally" element={<Navigate to="/sandbox/wally" replace />} />
        <Route path="agent/:id" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
