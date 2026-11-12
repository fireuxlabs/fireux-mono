import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/models/ecosystem-directory'

/** FireUX platform aggregation; Ecosystem owns each directory entry. */
export type PlatformDirectoryResponse = {
  ok: true
  generatedAt: string
  ecosystems: EcosystemDirectoryEntry[]
}
