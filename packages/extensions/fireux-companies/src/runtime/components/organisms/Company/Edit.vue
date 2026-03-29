<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!company" variant="subtle">
        <p class="text-sm text-dimmed">Company data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <PlaceEdit v-if="canEdit" :place="placeForEdit" />
        <UAlert
          v-else
          color="warning"
          variant="soft"
          title="Editing locked"
          description="Only the claiming user or an admin can edit this company record."
        />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser';
import type { Place } from 'fireux-places/runtime/models/place.model';
import { computed } from 'vue';
import type { CompanyHydrated } from '../../../composables/fireux/firestore/company/fetch/types';

const props = defineProps<{ company: CompanyHydrated | null }>()
const company = computed(() => props.company)
const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(company.value?.claimed_by ?? '').trim())
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})
const placeForEdit = computed<Place | null>(() =>
  company.value ? ({ ...company.value } as Place) : null
)
</script>
