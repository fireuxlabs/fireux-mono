import { useState } from '#imports'
import type { KitchenAIHandoff } from '../../models/ai-handoff'

// Memory only: no URL, browser storage, or persisted conversation history.
export function useKitchenAIHandoff() {
  return useState<KitchenAIHandoff | null>('kitchen-ai-handoff', () => null)
}
