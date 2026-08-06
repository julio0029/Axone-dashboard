import { useEffect, useState } from 'react'

// Progressive Manifest Registry — additive scaffold.
// Consumes public/data/manifest_registry.json (emitted read-only by
// scripts/gen_manifest_registry.py from currently-published Chronos/Tibot
// manifests). Only 'verified' slices render; 'pending'/'blocked' show placeholder.

export type RegistryLoadStatus = 'loading' | 'ready' | 'absent' | 'error'
export type SliceStatus = 'verified' | 'pending' | 'blocked'
export type TierKey = 't1_ohlcv' | 't2_features' | 't3_targets' | 't4_models'

export interface RegistryTier {
  key: TierKey
  label: string
  order: number
  owner: string
  desc: string
}

export interface RegistryGate {
  status: SliceStatus
  label: string
  description: string
}

export interface RegistrySlice {
  symbol: string
  timeframe: string
  tier: TierKey
  status: SliceStatus
  rows?: number | null
  canonicalRows?: number | null
  range?: { startUtc?: string | null; endUtc?: string | null }
  targetCount?: number | null
  featureCount?: number | null
  source?: string
  manifestSha256?: string | null
  packageStatus?: string | null
  targetContract?: string | null
  renderedFile?: string | null
  renderedRoute?: string | null
  note?: string
  gate?: string
}

export interface RegistryTally {
  verified: number
  pending: number
  blocked: number
}

export interface ManifestRegistry {
  artifactType: string
  version: string
  generatedAtUtc: string
  generatedBy: string
  banner: string
  policy: { renderRule: string; readOnly: string; leakage: string }
  tiers: RegistryTier[]
  gates: Record<string, RegistryGate>
  symbols: string[]
  timeframes: string[]
  tally: Record<TierKey, RegistryTally>
  sliceCount: number
  slices: RegistrySlice[]
  provenance: Record<string, unknown>
}

export const REGISTRY_PATH = `${import.meta.env.BASE_URL}data/manifest_registry.json`

export function useManifestRegistry(): {
  status: RegistryLoadStatus
  data: ManifestRegistry | null
  error?: string
} {
  const [state, setState] = useState<{
    status: RegistryLoadStatus
    data: ManifestRegistry | null
    error?: string
  }>({ status: 'loading', data: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(REGISTRY_PATH, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as ManifestRegistry
        if (!Array.isArray(json?.slices) || !Array.isArray(json?.tiers)) {
          throw new Error('malformed registry payload')
        }
        return { status: 'ready' as const, data: json }
      })
      .then((s) => alive && setState(s))
      .catch((e) => alive && setState({ status: 'error', data: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [])

  return state
}

/** Fast lookup of a single (symbol,timeframe,tier) slice. */
export function sliceKey(sym: string, tf: string, tier: TierKey): string {
  return `${sym}|${tf}|${tier}`
}

export function indexSlices(slices: RegistrySlice[]): Map<string, RegistrySlice> {
  const m = new Map<string, RegistrySlice>()
  for (const s of slices) m.set(sliceKey(s.symbol, s.timeframe, s.tier), s)
  return m
}

export function shortHash(hash: string | null | undefined): string {
  return hash ? `${hash.slice(0, 12)}…` : '—'
}

export function symLabel(sym: string): string {
  return sym.replace(/USDT$/, '')
}

/** Which (symbol,timeframe) pairs actually exist in the published grid. */
export function gridPairs(slices: RegistrySlice[]): { symbol: string; timeframe: string }[] {
  const seen = new Set<string>()
  const out: { symbol: string; timeframe: string }[] = []
  for (const s of slices) {
    const k = `${s.symbol}|${s.timeframe}`
    if (!seen.has(k)) {
      seen.add(k)
      out.push({ symbol: s.symbol, timeframe: s.timeframe })
    }
  }
  return out
}

export const STATUS_META: Record<SliceStatus, { label: string; color: string; dim: string }> = {
  verified: { label: 'verified', color: '#2f9bff', dim: 'rgba(47,155,255,0.16)' },
  pending: { label: 'pending', color: '#ffb454', dim: 'rgba(255,180,84,0.14)' },
  blocked: { label: 'blocked', color: '#ff5470', dim: 'rgba(255,84,112,0.14)' },
}
