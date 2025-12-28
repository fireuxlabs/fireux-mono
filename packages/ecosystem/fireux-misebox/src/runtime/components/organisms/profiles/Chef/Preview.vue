<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-medium text-slate-900">Your chef profile</p>
      <p class="text-sm text-slate-500">
        Preview how your chef listing renders inside FireUX directories.
      </p>
    </header>

    <div
      v-if="showProfileCta"
      class="rounded-lg border border-dashed border-slate-200 p-4"
    >
      <OrganismsProfilesChefCTA />
    </div>

    <template v-else>
      <div class="flex justify-end">
        <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
          {{ showCellView ? 'Show pill' : 'Show cell' }}
        </UButton>
      </div>

      <div class="space-y-4">
        <OrganismsProfilesChefCardsCell
          v-if="showCellCard && cell"
          :chef="cell"
        />
        <OrganismsProfilesChefCardsPill v-else-if="pill" :chef="pill" />
        <p v-else class="text-sm text-slate-500">No chef profile loaded.</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const { pill, cell } = useChef()
const { hasProfile } = useUser()

const hasChefProfile = computed(() => hasProfile('chef'))
const showProfileCta = computed(() => !hasChefProfile.value)

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
