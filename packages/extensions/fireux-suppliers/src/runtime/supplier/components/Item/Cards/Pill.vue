<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    class="pill"
    :action="action"
    @activate="emit('action')"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div
          v-if="showBadges && (badges?.length ?? 0)"
          class="flex flex-wrap items-center gap-1"
        >
          <UBadge
            v-for="badge in badges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>

      <UBadge
        v-if="packPriceLabel"
        variant="soft"
        color="primary"
        size="xs"
        class="shrink-0"
      >
        {{ packPriceLabel }}
      </UBadge>
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">

import type { SupplierItemCard } from '../../../composables/item/useSupplierItemInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<
    Pick<
      SupplierItemCard.Card,
      'to' | 'imageUrl' | 'title' | 'subtitle' | 'badges' | 'packPriceLabel'
    > & {
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    badges: () => [],
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
  }
)

</script>
