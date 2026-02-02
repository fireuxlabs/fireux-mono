<template>
  <div v-if="cells.length" class="space-y-1">
    <template v-for="cell in cells" :key="cell.id">
      <button
        v-if="cell.source === 'google'"
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="emit('select', cell)"
      >
        <UAvatar
          :src="cell.imageUrl || undefined"
          :alt="cell.title || cell.name"
          size="sm"
          icon="i-lucide-map-pin"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ cell.title || cell.name }}
          </div>
          <div v-if="cell.subtitle" class="truncate text-xs text-dimmed">
            {{ cell.subtitle }}
          </div>
        </div>
        <UBadge size="xs" variant="soft" color="neutral" class="shrink-0">Google</UBadge>
      </button>
      <PlaceCardsDropdownItem
        v-else
        :title="cell.title"
        :subtitle="cell.subtitle"
        :name="cell.name"
        :image-url="cell.imageUrl"
        :image-shade="cell.imageShade"
        :source="cell.source"
        :show-source="true"
        @select="emit('select', cell)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

const props = withDefaults(
  defineProps<{
    cells?: PlaceCard.Card[] | null
  }>(),
  { cells: () => [] }
)

const emit = defineEmits<{
  (e: 'select', cell: PlaceCard.Card): void
}>()

const cells = computed(() => (props.cells ?? []) as PlaceCard.Card[])
</script>

