<template>
  <section class="space-y-6">
    <UAlert
      v-if="!kitchens.length"
      color="neutral"
      variant="soft"
      title="No live kitchens found"
      description="No live kitchens are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ kitchen ? 'Selected Kitchen' : 'Select a kitchen' }}
          </div>

          <UButton
            v-if="kitchen"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </div>

        <KitchenCardsPill
          v-if="kitchen"
          v-bind="kitchen"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a kitchen below to load it into the console.
        </p>
      </div>

      <KitchenCollectionManager
        :collection="kitchens"
        title="Choose Kitchen"
        description="Select the live kitchen you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectKitchen"
      />

      <section class="w-full max-w-sm space-y-3">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-default/60" />
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
          <div class="h-px flex-1 bg-default/60" />
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium text-highlighted">Try a kitchen simulation</div>

          <USwitch
            v-model="showSimulations"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            label="Show kitchen simulations"
          />
        </div>

        <div v-if="showSimulations" class="text-sm text-dimmed">
          Kitchen Simulations
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenSelection } from '../../../composables/fireux/app/kitchen-console/useKitchenSelection'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'

const { kitchen, consoleState } = useKitchenConsole({ publishHeader: true })
const { setRuntimeKitchen } = useKitchenSelection()
const { kitchens } = useKitchenFetch()
const showSimulations = ref(false)
const clearSelection = consoleState.clearSelection

const selectKitchen = (kitchenId: string) => {
  setRuntimeKitchen({ kitchenId })
}
</script>
