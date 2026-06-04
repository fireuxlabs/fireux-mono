<template>
  <EntityClaimPanel
    entity-label="Company"
    :claim="claim"
    claim-label="Claim this company"
    manage-label="Manage company"
    claimed-copy="This company is linked to a claimed place record."
    unclaimed-copy="Claim the underlying place before treating this as an owned company record."
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntityClaimPanel } from 'fireux-core/runtime/composables/fireux/app/ui/useEntityClaimPanel'
import { usePlaceClaim } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceClaim'
import type { CompanyHydrated } from '../../composables/fireux/firestore/company/fetch/types'

const props = defineProps<{
  company: CompanyHydrated | null
  id: string
}>()

const { claimPlace } = usePlaceClaim()
const editTo = computed(() =>
  props.id ? `/companies/${encodeURIComponent(props.id)}/edit` : '/companies'
)

const claim = useEntityClaimPanel({
  id: computed(() => props.id),
  claimedBy: computed(() => String((props.company as any)?.claimed_by ?? '').trim()),
  editTo,
  claim: claimPlace,
  claimedToast: 'Company record claimed',
  failedToast: 'Failed to claim company record',
})
</script>
