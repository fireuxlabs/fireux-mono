<template>
  <EntityClaimPanel
    entity-label="Place"
    :claim="claim"
    claim-label="Claim this place"
    manage-label="Edit place"
    claimed-copy="This place is linked to an owner who can edit its public details."
    unclaimed-copy="Claim this place to manage its public details."
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntityClaimPanel } from 'fireux-core/runtime/composables/fireux/app/ui/useEntityClaimPanel'
import { usePlaceClaim } from '../../composables/fireux/firestore/place/mutations/usePlaceClaim'
import type { Place } from '../../models/place.model'

const props = defineProps<{
  place: Place | null
  id: string
}>()

const { claimPlace } = usePlaceClaim()
const editTo = computed(() =>
  props.id ? `/places/${encodeURIComponent(props.id)}/edit` : '/places'
)

const claim = useEntityClaimPanel({
  id: computed(() => props.id),
  claimedBy: computed(() => props.place?.claimed_by ?? ''),
  editTo,
  claim: claimPlace,
  claimedToast: 'Place claimed',
  failedToast: 'Failed to claim place',
})
</script>
