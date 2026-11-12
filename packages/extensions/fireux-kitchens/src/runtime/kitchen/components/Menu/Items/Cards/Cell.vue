<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell item-card"
    :class="{ 'item-card--list': list }"
    @activate="emit('action')"
  >
    <KitchenMenuItemsPhoto
      :src="imageUrl"
      :alt="title || 'Item'"
      class="item-card__image"
    />
    <div class="item-card__content">
      <h3 class="item-card__title">{{ title || 'Untitled item' }}</h3>
      <p v-if="expanded && description" class="item-card__description">
        {{ description }}
      </p>
      <p v-if="meta" class="item-card__meta">{{ meta }}</p>
      <div v-if="priceLabel || choicesLabel" class="item-card__footer">
        <strong v-if="priceLabel" class="item-card__price">{{
          priceLabel
        }}</strong>
        <span
          v-if="choicesLabel"
          class="item-card__choices"
          role="img"
          :aria-label="choicesLabel"
          :title="choicesLabel"
          ><UIcon name="i-lucide-ellipsis" aria-hidden="true"
        /></span>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
type Props = {
  id: string
  to?: string
  title: string
  imageUrl?: string
  description?: string
  expanded?: boolean
  list?: boolean
  meta?: string
  choicesLabel?: string
  priceLabel?: string
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  to: '',
  imageUrl: '',
  description: '',
  expanded: false,
  list: false,
  meta: '',
  choicesLabel: '',
  priceLabel: '',
  link: false,
  action: false,
})
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  padding: 0;
}
.item-card__image {
  inline-size: 100%;
  aspect-ratio: 1;
  flex: none;
  border-radius: 0;
}
.item-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3);
}
.item-card__title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  overflow-wrap: anywhere;
}
.item-card__description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
}
.item-card__meta {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  overflow-wrap: anywhere;
}
.item-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
  margin-top: auto;
  padding-top: var(--spacing);
}
.item-card__choices {
  display: inline-flex;
  flex: none;
  color: var(--ui-text-muted);
  margin-inline-start: auto;
}
.item-card__price {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}
.item-card--list {
  flex-direction: row;
  align-items: center;
}
.item-card--list .item-card__image {
  inline-size: calc(var(--spacing) * 16);
  block-size: calc(var(--spacing) * 16);
}
</style>
