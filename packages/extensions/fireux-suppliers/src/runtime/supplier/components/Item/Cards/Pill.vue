<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    class="pill"
    :action="action"
    @activate="emit('action')"
  >
    <div class="card__media fx-card__media--start">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
      />

      <div class="card__content card__stack">
        <p class="card__title">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="card__subtitle">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && (badges?.length ?? 0)" class="card__badges">
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

      <UBadge v-if="packPriceLabel" variant="soft" color="primary" size="xs">
        {{ packPriceLabel }}
      </UBadge>
    </div>
  </FireActionSurface>
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
