<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the Kitchens-owned Kitchen fixture. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-highlighted">
            Demo surfaces for kitchens
          </p>
          <p class="text-xs text-muted">
            Demo surfaces for kitchens.
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <KitchenCardsPill
        v-for="item in pillItems"
        :key="item.kitchen.id"
        v-bind="item.card"
        action
        @action="selectKitchen(item.kitchen)"
      />
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <KitchenCardsPill
          v-if="demoPill"
          v-bind="demoPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <KitchenCardsCell
          v-if="demoCell"
          v-bind="demoCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <KitchenCardsPreview
          v-if="demoPreview"
          v-bind="demoPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <KitchenCardsProfile
          v-if="demoProfile"
          :model="demoProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { demoKitchenHydratedList } from '../../../demo/kitchen';
import {
  useKitchenInterface,
  type KitchenSurface,
  type KitchenCard,
} from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface';

const emit = defineEmits<{
  (event: 'ready', kitchen: KitchenSurface): void
}>()

const { pill, cell, preview, profile } = useKitchenInterface()

const selectedId = ref(String(demoKitchenHydratedList[0]?.id ?? ''))

const demoKitchen = computed(() => {
  const selected = demoKitchenHydratedList.find(
    (kitchen) => String(kitchen.id) === selectedId.value
  )
  return (selected ?? demoKitchenHydratedList[0]) as KitchenSurface
})

const selectKitchen = (kitchen: KitchenSurface) => {
  selectedId.value = String(kitchen.id)
}

const pillItems = computed(() =>
  demoKitchenHydratedList
    .map((kitchen) => ({
      kitchen: kitchen as KitchenSurface,
      card: pill(kitchen) as ReturnType<typeof pill>,
    }))
    .filter((item): item is { kitchen: KitchenSurface; card: KitchenCard.Card } =>
      Boolean(item.card)
    )
)

const demoPill = computed(() => pill(demoKitchen.value))
const demoCell = computed(() => cell(demoKitchen.value))
const demoPreview = computed(() => preview(demoKitchen.value))
const demoProfile = computed(() => profile(demoKitchen.value))

onMounted(() => {
  emit('ready', demoKitchen.value)
})

watch(demoKitchen, (next: KitchenSurface) => {
  emit('ready', next)
})
</script>
