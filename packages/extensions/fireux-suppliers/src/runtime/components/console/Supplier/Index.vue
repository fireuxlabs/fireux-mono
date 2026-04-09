<template>
  <section class="space-y-6">
    <UAlert
      v-if="!suppliers.length"
      color="neutral"
      variant="soft"
      title="No live suppliers found"
      description="No live suppliers are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">
          {{ supplier ? 'Selected Supplier' : 'Select a supplier' }}
        </div>

        <SupplierCardsPill
          v-if="supplier"
          v-bind="supplier"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a supplier below to load it into the console.
        </p>
      </div>

      <SupplierCollectionManager
        :collection="suppliers"
        title="Choose Supplier"
        description="Select the live supplier you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectSupplier"
      />

      <section class="w-full max-w-sm space-y-3">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-default/60" />
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
          <div class="h-px flex-1 bg-default/60" />
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium text-highlighted">Try a simulation</div>

          <USwitch
            v-model="showSimulations"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            label="Show simulations"
          />
        </div>

        <div v-if="showSimulations" class="text-sm text-dimmed">
          Simulations
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useSupplierSelection } from '../../../composables/fireux/app/supplier-console/useSupplierSelection'
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'

const { supplier } = useSupplierConsole()
const { setRuntimeSupplier } = useSupplierSelection()
const { coreSuppliers: suppliers } = useSupplierCollection()
const showSimulations = ref(false)

const selectSupplier = (supplierId: string) => {
  setRuntimeSupplier({ supplierId })
}
</script>
