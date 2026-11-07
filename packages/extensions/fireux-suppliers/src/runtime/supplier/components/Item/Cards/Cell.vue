<template>
  <FireActionSurface
    :to="link && record.to ? record.to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="record.imageUrl || undefined"
        :alt="record.title"
        icon="i-lucide-package-open"
        size="md"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">
              {{ record.title }}
            </div>
            <div v-if="showSubtitle && record.subtitle" class="card__subtitle">
              {{ record.subtitle }}
            </div>
          </div>

          <div>
            <div>
              {{ record.packPriceLabel }}
            </div>
            <div>{{ record.unitPriceLabel }} / {{ record.unit }}</div>
          </div>
        </div>

        <div class="card__badges">
          <UBadge
            v-if="record.productId"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ record.productId }}
          </UBadge>
          <UBadge
            v-if="
              record.ingredientId && record.ingredientId !== record.productId
            "
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ record.ingredientId }}
          </UBadge>
          <UBadge
            v-if="record.packLabel"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ record.packLabel }}
          </UBadge>
          <UBadge
            v-for="badge in visibleBadges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SupplierItemCard } from '../../../composables/item/useSupplierItemInterface'

type Props = Partial<SupplierItemCard.Card> & {
  card?: SupplierItemCard.Card
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  link: false,
  action: false,
})

const record = computed(() => props.card ?? props)
const visibleBadges = computed(() =>
  (record.value.badges ?? []).filter(
    (badge) =>
      badge !== record.value.unit &&
      badge !== `Unit ${record.value.unitPriceLabel}`
  )
)
</script>
