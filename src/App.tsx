import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { KerryPage } from './pages/KerryPage'
import { WallyPage } from './pages/WallyPage'
import { ChronosPage } from './pages/ChronosPage'
import { TibotSuitePage } from './pages/TibotSuitePage'
import { TaV2Page } from './pages/TaV2Page'
import { RegistryPage } from './pages/RegistryPage'
import { V2PortfolioLabPage } from './pages/V2PortfolioLabPage'
import { PaperCandidateV1Page } from './pages/PaperCandidateV1Page'
import { V2SymbolResearchPage } from './pages/V2SymbolResearchPage'
import { ComingSoon } from './pages/ComingSoon'
import { WolfLive48hPage } from './pages/WolfLive48hPage'

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
        <Route path="wolf-live-48h" element={<WolfLive48hPage />} />
        {/* BRANCH 1 — Paper Candidate V1 (frozen forward test), top-level & isolated */}
        <Route path="paper-candidate-v1" element={<PaperCandidateV1Page />} />
        <Route path="v2/paper-test" element={<Navigate to="/paper-candidate-v1" replace />} />
        {/* BRANCH 2 — V2 Research views */}
        <Route path="v2/portfolio-lab" element={<V2PortfolioLabPage />} />
        <Route path="v2/symbol-research" element={<V2SymbolResearchPage />} />
        {/* Wally research now lives under the Sandbox section */}
        <Route path="sandbox/wally" element={<WallyPage />} />
        <Route path="wally" element={<Navigate to="/sandbox/wally" replace />} />
        <Route path="agent/:id" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
