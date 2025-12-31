<template>
  <UPageCTA
    title="Professional profile"
    description="Add a professional profile to your FireUX portfolio so agents can discover you more easily."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasProfessionalProfile" class="space-y-2">
        <OrganismsProfilesProfessionalCreateSystem />
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show pill' : 'Show cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsProfilesProfessionalCardsCell
            v-if="showCellCard && cell"
            :professional="cell"
          />
          <OrganismsProfilesProfessionalCardsPill
            v-else-if="pill"
            :professional="pill"
          />
          <p v-else class="text-sm text-slate-500">
            No professional profile loaded.
          </p>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const { pill, cell } = useProfessional()
const { hasProfile } = useUser()

const hasProfessionalProfile = computed(() => hasProfile('professional'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) showCellView.value = false
})
</script>

