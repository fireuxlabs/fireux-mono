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
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Selected Kitchen</div>

        <KitchenCardsPill
          v-if="kitchen"
          v-bind="kitchen"
          :link="false"
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
        @select="selectKitchen"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenSelection } from '../../composables/fireux/app/kitchen-console/useKitchenSelection'
import { useKitchenConsole } from '../../composables/fireux/app/kitchen-console/useKitchenConsole'

const { kitchen } = useKitchenConsole()
const { setRuntimeKitchen } = useKitchenSelection()
const { kitchens } = useKitchenFetch()

const selectKitchen = (kitchenId: string) => {
  setRuntimeKitchen({ kitchenId })
}
</script>
