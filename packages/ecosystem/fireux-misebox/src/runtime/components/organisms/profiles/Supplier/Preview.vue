<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-medium text-slate-900">Your supplier profile</p>
      <p class="text-sm text-slate-500">
        Preview how your supplier listing renders inside FireUX directories.
      </p>
    </header>

    <div
      v-if="showProfileCta"
      class="rounded-lg border border-dashed border-slate-200 p-4"
    >
      <OrganismsProfilesSupplierCTA />
    </div>

    <template v-else>
      <div class="flex justify-end">
        <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
          {{ showCellView ? 'Show pill' : 'Show cell' }}
        </UButton>
      </div>

      <div class="space-y-4">
        <OrganismsProfilesSupplierCardsCell
          v-if="showCellCard && cell"
          :supplier="cell"
        />
        <OrganismsProfilesSupplierCardsPill v-else-if="pill" :supplier="pill" />
        <p v-else class="text-sm text-slate-500">No supplier profile loaded.</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'

const { pill, cell } = useSupplier()
const { hasProfile } = useUser()

const hasSupplierProfile = computed(() => hasProfile('supplier'))
const showProfileCta = computed(() => !hasSupplierProfile.value)

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
