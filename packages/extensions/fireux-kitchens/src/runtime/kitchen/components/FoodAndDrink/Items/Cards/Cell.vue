<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell dish-card"
    :class="{ 'dish-card--list': list }"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || 'Untitled dish'"
        icon="i-lucide-utensils"
        size="3xl"
        class="dish-card__image"
      />
      <div class="card__content card__stack">
        <div class="card__header">
          <h3 class="card__title" :title="title">{{ title || 'Untitled dish' }}</h3>
          <UIcon
            v-if="link && to"
            name="i-lucide-arrow-right"
            class="fx-card__icon"
            aria-hidden="true"
          />
        </div>
        <p v-if="expanded && description" class="fx-card__body">
          {{ description }}
        </p>
        <p v-if="meta" class="card__subtitle">{{ meta }}</p>
        <strong v-if="priceLabel" class="fx-type-caption">{{ priceLabel }}</strong>
      </div>
    </div>
  </MoleculesActionSurface>
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
  priceLabel: '',
  link: false,
  action: false,
})

</script>

<style scoped>
.dish-card {
  height: 100%;
  padding: 0;
}
.dish-card .card__media {
  height: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}
.dish-card__image {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  flex: none;
  border-radius: 0;
}
.dish-card .card__content {
  padding: calc(var(--spacing) * 4);
}
.dish-card--list .card__media {
  flex-direction: row;
  align-items: center;
}
.dish-card--list .dish-card__image {
  width: calc(var(--spacing) * 16);
  height: calc(var(--spacing) * 16);
}
</style>
