import type { Ref } from 'vue'
import type {
  EcosystemDirectoryEntry,
} from '../models/utils/directory'

export type DirectoryOutcome = 'pending' | 'error' | 'empty' | 'ready'

export type EcosystemDirectoryController = {
  ecosystems: Ref<EcosystemDirectoryEntry[]>
  count: Ref<number>
  pending: Ref<boolean>
  error: Ref<unknown>
  outcome: Ref<DirectoryOutcome>
  source: 'platform'
  refresh?: () => Promise<unknown>
}
