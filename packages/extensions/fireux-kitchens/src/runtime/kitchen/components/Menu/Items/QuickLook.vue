<template>
  <USlideover
    v-model:open="open"
    :title="dish?.name || 'Item quick look'"
    :description="catalogue.title"
    @after:leave="emit('after-leave')"
  >
    <template #body>
      <div v-if="dish">
        <div>
          <div class="item-preview-image">
            <img
              v-if="dish.image"
              :src="dish.image"
              :alt="dish.name || catalogue.singular"
            />
            <div v-else aria-hidden="true">
              <UIcon name="i-lucide-utensils" />
            </div>
          </div>

          <div>
            <div>
              <UBadge color="neutral" variant="soft">
                {{ kindLabel }}
              </UBadge>
              <UBadge v-if="priceLabel" color="primary" variant="soft">
                {{ priceLabel }}
              </UBadge>
            </div>

            <p>
              {{ dish.description || 'No description has been added yet.' }}
            </p>
          </div>
        </div>

        <section
          v-if="menuUsage.length"
          aria-labelledby="item-quick-look-menus"
        >
          <h3 id="item-quick-look-menus">On menus</h3>
          <UPageGrid as="ul">
            <UCard
              as="li"
              variant="subtle"
              v-for="placement in menuPlacements"
              :key="placement.key"
            >
              <p class="fx-truncate">
                {{ placement.menuName }}
              </p>
              <p class="fx-truncate">
                {{ placement.sectionLabel }}
              </p>
            </UCard>
          </UPageGrid>
        </section>
      </div>
    </template>

    <template #footer>
      <div>
        <UButton color="neutral" variant="ghost" @click="open = false">
          Close
        </UButton>
        <UButton
          v-if="dish"
          :to="detailPath"
          icon="i-lucide-arrow-right"
          trailing
          @click="open = false"
        >
          Open {{ catalogue.singular }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenItemsContext } from '../../../composables/workspace/items/useKitchenItemsContext'
import type { Item } from '../../../utils/item.ts'

const props = withDefaults(
  defineProps<{
    dish: Item | null
    menuUsage?: Array<{
      menuId: string
      sectionId: string
      itemId: string
      menuName: string
      sectionLabel: string
    }>
    priceLabel?: string
  }>(),
  {
    menuUsage: () => [],
    priceLabel: '',
  }
)

const emit = defineEmits<{
  (event: 'after-leave'): void
}>()

const open = defineModel<boolean>('open', { required: true })
const { catalogue } = useKitchenItemsContext()
const clean = (value: unknown) => String(value ?? '').trim()
const kindLabel = computed(() =>
  props.dish?.item_kind === 'drink' ? 'Drink' : 'Food'
)
const detailPath = computed(
  () => `${catalogue.path}/${encodeURIComponent(clean(props.dish?.id))}`
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

<style scoped>
.item-preview-image {
  aspect-ratio: 4 / 3;
  width: 100%;
}
.item-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
