<template>
  <component
    :is="link && record.to ? 'NuxtLink' : 'div'"
    :to="link && record.to ? record.to : undefined"
    class="block w-full"
    @click="onClick"
  >
    <div
      class="fx-card--cell"
    >
      <UAvatar
        :src="record.imageUrl || undefined"
        :alt="record.title"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">
              {{ record.title }}
            </div>
            <div v-if="showSubtitle && record.subtitle" class="truncate text-xs text-dimmed">
              {{ record.subtitle }}
            </div>
          </div>

          <div class="shrink-0 text-right">
            <div class="text-sm font-semibold">
              {{ record.packPriceLabel }}
            </div>
            <div class="text-xs text-dimmed">
              {{ record.unitPriceLabel }} / {{ record.unit }}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <UBadge
            v-if="record.productId"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ record.productId }}
          </UBadge>
          <UBadge
            v-if="record.ingredientId && record.ingredientId !== record.productId"
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
  </component>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'

import type { SupplierItemCard } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierItemInterface'

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

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
