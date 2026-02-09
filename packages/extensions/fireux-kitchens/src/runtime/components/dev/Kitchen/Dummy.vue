<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy surfaces for kitchens
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Dummy surfaces for kitchens.
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
          v-if="dummyPill"
          v-bind="dummyPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <KitchenCardsCell
          v-if="dummyCell"
          v-bind="dummyCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <KitchenCardsPreview
          v-if="dummyPreview"
          v-bind="dummyPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <KitchenCardsProfile
          v-if="dummyProfile"
          :model="dummyProfile"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { dummyKitchenHydratedList } from '../../../../../../../../dummy/kitchen.dummy';
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface';
import type { Kitchen } from '../../../models/kitchen.model';

const emit = defineEmits<{
  (event: 'ready', kitchen: Kitchen): void
}>()

const { pill, cell, preview, profile } = useKitchenInterface()

const selectedId = ref(String(dummyKitchenHydratedList[0]?.id ?? ''))

const dummyKitchen = computed(() => {
  const selected = dummyKitchenHydratedList.find(
    (kitchen) => String(kitchen.id) === selectedId.value
  )
  return (selected ?? dummyKitchenHydratedList[0]) as Kitchen
})

const selectKitchen = (kitchen: Kitchen) => {
  selectedId.value = String(kitchen.id)
}

const pillItems = computed(() =>
  dummyKitchenHydratedList
    .map((kitchen) => ({
      kitchen,
      card: pill(kitchen) as ReturnType<typeof pill>,
    }))
    .filter((item) => Boolean(item.card))
)

const dummyPill = computed(() => pill(dummyKitchen.value))
const dummyCell = computed(() => cell(dummyKitchen.value))
const dummyPreview = computed(() => preview(dummyKitchen.value))
const dummyProfile = computed(() => profile(dummyKitchen.value))

onMounted(() => {
  emit('ready', dummyKitchen.value)
})

watch(dummyKitchen, (next) => {
  emit('ready', next)
})
</script>
