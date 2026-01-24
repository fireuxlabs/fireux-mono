<template>
  <UPageCTA
    class="fx-cta"
    title="Supplier profile"
    description="Introduce your products to chefs and venues across the FireUX network."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasSupplierProfile" class="space-y-2">
        <OrganismsProfilesSupplierCreateSystem />
      </div>

      <div v-else class="fx-cta__body space-y-4">
        <div class="fx-cta__toolbar flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show pill' : 'Show cell' }}
          </UButton>
        </div>

        <div class="fx-cta__panel space-y-4">
          <OrganismsProfilesSupplierCardsCell
            v-if="showCellCard && cell"
            v-bind="cell"
            :link="Boolean(cell.to)"
            class="block"
          />
          <OrganismsProfilesSupplierCardsPill
            v-else-if="pill"
            v-bind="pill"
            :link="Boolean(pill.to)"
            class="block"
          />
          <p v-else class="fx-cta__empty text-sm text-slate-500">No supplier profile loaded.</p>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { computed, ref, watch } from 'vue'
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'

const { card } = useSupplier()
const { hasProfile } = useUser()

const hasSupplierProfile = computed(() => hasProfile('supplier'))

const cell = computed(() => card())
const pill = computed(() => card())
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

