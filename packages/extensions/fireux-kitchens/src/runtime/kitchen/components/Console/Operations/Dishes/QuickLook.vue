<template>
  <UModal
    v-model:open="open"
    :title="dish?.name || 'Dish quick look'"
    :description="quickLookDescription"
    :ui="{ content: 'sm:max-w-2xl' }"
    @after:leave="emit('after-leave')"
  >
    <template #body>
      <div v-if="dish" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <div class="aspect-[4/3] overflow-hidden rounded-xl bg-elevated">
            <img
              v-if="dish.image"
              :src="dish.image"
              :alt="dish.name || 'Dish'"
              class="size-full object-cover"
            >
            <div
              v-else
              class="flex size-full items-center justify-center text-muted"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-utensils" class="size-10" />
            </div>
          </div>

          <div class="min-w-0 space-y-4">
            <div class="flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft">
                {{ kindLabel }}
              </UBadge>
              <UBadge v-if="priceLabel" color="primary" variant="soft">
                {{ priceLabel }}
              </UBadge>
            </div>

            <p class="text-sm leading-6 text-toned">
              {{ dish.description || 'No description has been added yet.' }}
            </p>
          </div>
        </div>

        <section v-if="menuUsage.length" aria-labelledby="dish-quick-look-menus">
          <h3
            id="dish-quick-look-menus"
            class="text-sm font-semibold text-highlighted"
          >
            On menus
          </h3>
          <ul class="mt-2 grid gap-2 sm:grid-cols-2">
            <li
              v-for="placement in menuPlacements"
              :key="placement.key"
              class="rounded-lg border border-default bg-elevated/30 px-3 py-2.5"
            >
              <p class="truncate text-sm font-medium text-highlighted">
                {{ placement.menuName }}
              </p>
              <p class="mt-0.5 truncate text-xs text-muted">
                {{ placement.sectionLabel }}
              </p>
            </li>
          </ul>
        </section>

      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          @click="open = false"
        >
          Close
        </UButton>
        <UButton
          v-if="dish"
          :to="detailPath"
          icon="i-lucide-arrow-right"
          trailing
          @click="open = false"
        >
          Open dish
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenDishesWorkspace } from '../../../../composables/console/operations/Dishes/useKitchenDishesWorkspace'
import type { KitchenDishMenuUsage } from '../../../../composables/console/operations/Dishes/useKitchenConsoleDishes'
import type { Dish } from '../../../../models/dish.model.ts'

const props = withDefaults(defineProps<{
  dish: Dish | null
  menuUsage?: KitchenDishMenuUsage[]
  priceLabel?: string
}>(), {
  menuUsage: () => [],
  priceLabel: '',
})

const emit = defineEmits<{
  (event: 'after-leave'): void
}>()

const open = defineModel<boolean>('open', { required: true })
const { catalogue } = useKitchenDishesWorkspace()
const clean = (value: unknown) => String(value ?? '').trim()
const kindLabel = computed(() =>
  props.dish?.is_deal
    ? 'Deal'
    : props.dish?.item_kind === 'drink'
      ? 'Drink'
      : 'Food'
)
const quickLookDescription = computed(() =>
  props.dish ? 'Quick look · Read-only' : 'Read-only dish preview'
)
const detailPath = computed(() =>
  `${catalogue.path}/${encodeURIComponent(clean(props.dish?.id))}`
)
const menuPlacements = computed(() =>
  props.menuUsage.map((usage, index) => ({
    key: [
      clean(usage.menuId),
      clean(usage.sectionId),
      clean(usage.itemId),
      index,
    ].join(':'),
    menuName: clean(usage.menuName) || 'Menu',
    sectionLabel: clean(usage.sectionLabel) || 'Menu section',
  }))
)
</script>
