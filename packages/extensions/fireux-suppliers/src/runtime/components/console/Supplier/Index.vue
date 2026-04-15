<!-- ConsoleSupplier.vue -->
<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveSuppliers.length"
      color="neutral"
      variant="soft"
      title="No live suppliers found"
      description="No live suppliers are currently available in this workspace."
    />

    <div v-if="liveSuppliers.length" class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ supplier ? 'Selected Supplier' : 'Select a supplier' }}
          </div>

          <UButton
            v-if="supplier"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
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
        :collection="liveSuppliers"
        title="Choose Supplier"
        description="Select the live supplier you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectSupplier"
      />
    </div>

    <section v-if="demoSuppliers.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a supplier simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show supplier simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo suppliers wired into the same console stack.
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <UButton
            v-for="scenario in demoSuppliers"
            :key="scenario.id"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click="selectDemoSupplier(scenario.id)"
          >
            <span>{{ scenario.name }}</span>
            <span class="text-xs text-dimmed">{{ scenario.label }}</span>
          </UButton>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupplierConsoleIndex } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleIndex'

const {
  supplier,
  liveSuppliers,
  demoSuppliers,
  clearSelection,
  selectSupplier,
  selectDemoSupplier,
} = useSupplierConsoleIndex({ publishHeader: true })

const showSimulations = ref(false)
</script>