import { useEcosystemEnsure } from '../../../core/ecosystem/mutations/useEcosystemEnsure'

/**
 * FireUX stack family: System/adapter seam.
 * Entity: Ecosystem.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This file is a bootstrap/control adapter for app setup code that still speaks
 * in Firestore setup language. Root Ecosystem entity access belongs to
 * firestore/core/ecosystem.
 */
export function useFirestoreEcosystemEnsure() {
  const { ensureEcosystemDoc } = useEcosystemEnsure()

  return {
    ensureFirestoreEcosystemDoc: ensureEcosystemDoc,
  }
}
