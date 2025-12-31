<template>
  <UPageCTA
    title="Supplier profile"
    description="Introduce your products to chefs and venues across the FireUX network."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasSupplierProfile" class="space-y-2">
        <OrganismsProfilesSupplierCreateSystem />
      </div>

      <div v-else class="space-y-4">
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
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'

const { pill, cell } = useSupplier()
const { hasProfile } = useUser()

const hasSupplierProfile = computed(() => hasProfile('supplier'))

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

