<template>
  <component
    :is="link && card.to ? 'NuxtLink' : 'div'"
    :to="link && card.to ? card.to : undefined"
    class="card card--cell transition-colors hover:bg-primary/5 hover:border-primary/30"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar :src="card.imageUrl || undefined" :alt="card.title" size="md" />

      <div class="card__content card__stack space-y-2">
        <div class="card__header flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="card__title text-base font-semibold">{{ card.title }}</div>
            <div v-if="showSubtitle && card.subtitle" class="card__subtitle text-sm text-muted-foreground">
              {{ card.subtitle }}
            </div>
          </div>

          <div v-if="showBadges && card.badges.length" class="card__badges flex flex-wrap items-center justify-end gap-1">
            <UBadge
              v-for="badge in card.badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showDescription && card.description" class="card__tagline text-sm text-muted-foreground">
          {{ card.description }}
        </div>

        <div v-if="showMeta" class="card__tagline text-xs uppercase tracking-wide text-muted-foreground">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../composables/fireux/firestore/product/utils/view/useProductInterface'

type Props = {
  card: ProductCard.Card
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showDescription?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showDescription: true,
  showMeta: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
