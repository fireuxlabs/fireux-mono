<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill ingredient-card-pill"
    @activate="emit('action')"
  >
    <div class="ingredient-card-pill__layout">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="md"
        icon="i-lucide-carrot"
        class="ingredient-card-pill__avatar"
      />

      <div class="ingredient-card-pill__content">
        <p class="ingredient-card-pill__title">
          {{ title }}
        </p>
        <UBadge
          v-if="showSubtitle && subtitle"
          :color="categoryColor"
          variant="subtle"
          size="xs"
          class="ingredient-card-pill__category"
        >
          {{ subtitle }}
        </UBadge>
        <div
          v-if="showBadges && badges.length"
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
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed } from '#imports'

import type { IngredientCard } from '../../composables/useIngredientInterface'

type PillProps = Pick<
  IngredientCard.Card,
  'slug' | 'to' | 'title' | 'subtitle' | 'imageUrl'
> & {
  badges?: string[]
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  warning?: string
  showSlug?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
  showSlug: false,
})

const categoryColors = {
  bakery: 'warning',
  meat: 'error',
  dairy: 'info',
  preserves: 'secondary',
  produce: 'success',
} as const

const categoryColor = computed(() => {
  const category = String(props.subtitle || '')
    .trim()
    .toLocaleLowerCase() as keyof typeof categoryColors

  return categoryColors[category] || 'neutral'
})

</script>

<style scoped>
.ingredient-card-pill {
  min-height: 4rem;
  max-width: 15.5rem;
  padding: calc(var(--spacing) * 1.5);
  border-radius: calc(var(--ui-radius) * 6);
}

.ingredient-card-pill__layout {
  display: flex;
  min-width: 0;
  width: 100%;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.ingredient-card-pill__avatar {
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, var(--ui-border) 76%, transparent);
  border-radius: calc(var(--ui-radius) * 4);
  box-shadow: var(--fx-elevation-low);
}

.ingredient-card-pill__content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: calc(var(--spacing) * 0.5);
}

.ingredient-card-pill__title {
  overflow: hidden;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.018em;
  line-height: var(--leading-tight);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ingredient-card-pill__category {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  flex: 0 0 auto;
  justify-self: start;
  overflow: hidden;
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
  text-overflow: ellipsis;
  text-transform: none;
  white-space: nowrap;
}
</style>
