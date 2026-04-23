<template>
  <section class="space-y-6">
    <UAlert
      v-if="!suppliers.live.length"
      color="neutral"
      variant="soft"
      title="No live suppliers found"
      description="No live suppliers are currently available in this workspace."
    />

    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ selectedSupplier ? 'Selected Supplier' : 'Select a supplier' }}
          </div>

          <UButton
            v-if="selectedSupplier"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelectedSupplier"
          >
            Clear
          </UButton>
        </div>

        <SupplierCardsPill
          v-if="selectedSupplierCard"
          v-bind="selectedSupplierCard"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a live, demo, or test supplier to load it into the console.
        </p>
      </div>

      <SupplierCollectionManager
        v-if="suppliers.live.length"
        :collection="suppliers.live"
        title="Choose Live Supplier"
        description="Select the live supplier you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </div>

    <section v-if="suppliers.demo.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a supplier simulation</div>

        <USwitch
          v-model="state.showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show supplier simulations"
        />
      </div>

      <div v-if="state.showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo suppliers wired into the same console stack.
        </div>

        <div class="space-y-2">
          <SupplierCardsPill
            v-for="scenario in demoSupplierCards"
            :key="scenario.id"
            v-bind="scenario"
            :link="false"
            :action="true"
            :show-badges="false"
            @action="actions.selectDemo(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="suppliers.test" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Use your test supplier</div>

        <div class="text-sm text-dimmed">
          Personal sandbox supplier for experiments and console setup.
        </div>

        <SupplierCardsPill
          v-if="testSupplierCard"
          v-bind="testSupplierCard"
          :link="false"
          :action="true"
          :show-badges="false"
          @action="actions.selectTest"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsoleIndex } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleIndex'

const {
  state,
  suppliers,
  actions,
  selectedSupplier,
  clearSelectedSupplier,
} = useSupplierConsoleIndex()
const { pill } = useSupplierInterface()

type SupplierPillCard = NonNullable<
  ReturnType<ReturnType<typeof useSupplierInterface>['pill']>
>

const demoSupplierCards = computed<SupplierPillCard[]>(() =>
  suppliers.value.demo
    .map((supplier) => pill(supplier))
    .filter((card): card is SupplierPillCard => Boolean(card))
)

const selectedSupplierCard = computed<SupplierPillCard | null>(() => {
  const supplier = selectedSupplier.value as SupplierSurface | null
  if (!supplier) return null

  return pill(supplier) ?? null
})

const testSupplierCard = computed<SupplierPillCard | null>(() => {
  const supplier = suppliers.value.test
  if (!supplier) return null

  return pill(supplier) ?? null
})
</script>
