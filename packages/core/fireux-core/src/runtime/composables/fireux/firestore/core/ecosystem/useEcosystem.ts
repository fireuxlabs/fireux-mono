import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useEcosystemFetch } from './fetch/useEcosystemFetch'
import { useEcosystemEnsure } from './mutations/useEcosystemEnsure'
import { useEcosystemPublish } from './mutations/useEcosystemPublish'
import { useEcosystemSeo } from './utils/useEcosystemSeo'
import { useEcosystemInterface } from './utils/view/useEcosystemInterface'

export type { Ecosystem } from '../../../../../models/system/ecosystem.model'

/**
 * FireUX stack family: Core/system root context.
 * Entity: Ecosystem.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This is the canonical root Ecosystem seam. Without an explicit id it resolves
 * FireUXConfig.ecosystem; for arbitrary ids, pass the id directly.
 * Ecosystem may map to Firebase infrastructure, but Firebase is not its identity truth.
 */
export function useEcosystem(id?: string | Ref<string>) {
  const fireux = useFireUXConfig()

  const ecosystemId = computed(() => {
    if (id === undefined) {
      return String(fireux.ecosystem || '').trim()
    }

    return isRef(id) ? String(id.value || '').trim() : String(id || '').trim()
  })

  const { ecosystem, pending } = useEcosystemFetch(ecosystemId)

  return {
    ecosystem,
    pending,
    ...useEcosystemInterface(),
    ...useEcosystemEnsure(),
    ...useEcosystemPublish(),
    useEcosystemSeo,
  }
}
