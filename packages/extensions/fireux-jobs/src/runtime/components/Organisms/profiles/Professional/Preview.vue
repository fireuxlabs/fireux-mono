<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-medium text-slate-900">
        Your professional profile
      </p>
      <p class="text-sm text-slate-500">
        Preview how your professional listing renders inside FireUX directories.
      </p>
    </header>

    <div
      v-if="showProfileCta"
      class="rounded-lg border border-dashed border-slate-200 p-4"
    >
      <OrganismsProfilesProfessionalCTA />
    </div>

    <template v-else>
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
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'

const { pill, cell } = useProfessional()
const user = useUser()

const hasProfile = computed(() => user.hasProfile('professional'))
const showProfileCta = computed(() => !hasProfile.value)

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

watch(canToggle, (enabled) => {
  if (!enabled) showCellView.value = false
})
</script>
