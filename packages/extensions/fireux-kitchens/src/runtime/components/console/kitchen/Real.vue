<template>
  <section class="space-y-6">
    <UAlert
      v-if="!kitchenCards.length"
      color="neutral"
      variant="soft"
      title="No live kitchens found"
      description="No live kitchens are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Selected Kitchen</div>

        <KitchenCardsPill
          v-if="activeKitchenPill"
          v-bind="activeKitchenPill"
          :link="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a kitchen below to load it into the console.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Choose Kitchen</div>
            <p class="text-sm text-dimmed">
              Select the live kitchen you want to work on.
            </p>
          </div>
        </template>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <UButton
            v-for="entry in kitchenCards"
            :key="entry.id"
            color="neutral"
            :variant="entry.id === selectedId ? 'solid' : 'soft'"
            class="justify-start"
            @click="selectKitchen(entry.id)"
          >
            <span class="truncate">{{ entry.title }}</span>
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenSelection } from '../../../composables/fireux/app/kitchen-console/useKitchenSelection'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'

const { activeKitchenPill } = useKitchenConsole()
const { selectedId, setRuntimeKitchen } = useKitchenSelection()
const { interface: toKitchenCard } = useKitchenInterface()
const { kitchens: liveKitchens } = useKitchenFetch()

type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>

const kitchenCards = computed(() =>
  liveKitchens.value
    .map((entry) => toKitchenCard(entry as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const selectKitchen = (kitchenId: string) => {
  setRuntimeKitchen({ kitchenId })
}
</script>
