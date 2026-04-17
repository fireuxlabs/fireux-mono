import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useEcosystemFetch } from './fetch/useEcosystemFetch'
import { useEcosystemEnsure } from './mutations/useEcosystemEnsure'
import { useEcosystemInterface } from './utils/view/useEcosystemInterface'

export type { Ecosystem } from '../../../../../models/system/ecosystem.model'

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
  }
}
