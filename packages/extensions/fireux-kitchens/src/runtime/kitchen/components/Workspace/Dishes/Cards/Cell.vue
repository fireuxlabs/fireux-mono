<template>
  <component
    :is="rootComponent"
    v-bind="rootAttrs"
    class="card card--cell operation-image-cell group flex min-w-0 flex-col text-left"
    :class="{ 'dish-card-expanded': expanded, 'dish-card-list': list }"
    @click="onClick"
  >
    <div class="dish-card-media aspect-[4/3] overflow-hidden bg-elevated">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="title"
        class="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div
        v-else
        class="flex size-full items-center justify-center text-muted"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-utensils" class="size-7" />
      </div>
    </div>

    <div
      class="dish-card-caption flex min-w-0 flex-1 flex-col gap-1.5 border-t border-default px-3 py-2.5"
    >
      <div class="flex min-w-0 items-start gap-2">
        <h3
          class="min-w-0 flex-1 truncate text-sm font-semibold text-highlighted"
        >
          {{ title || 'Untitled dish' }}
        </h3>
        <UIcon
          v-if="link && to"
          name="i-lucide-arrow-right"
          class="mt-0.5 size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>

      <p v-if="expanded && description" class="dish-card-description">
        {{ description }}
      </p>
      <div class="flex min-w-0 items-center gap-2 text-xs">
        <span v-if="meta" class="truncate text-muted">
          {{ meta }}
        </span>
        <span
          v-if="priceLabel"
          class="ml-auto shrink-0 font-semibold text-toned"
        >
          {{ priceLabel }}
        </span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

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

const props = withDefaults(defineProps<Props>(), {
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

const nuxtLink = resolveComponent('NuxtLink')
const rootComponent = computed(() => {
  if (props.link && props.to) return nuxtLink
  if (props.action) return 'button'
  return 'article'
})
const rootAttrs = computed(() =>
  props.link && props.to
    ? { to: props.to }
    : props.action
      ? { type: 'button' }
      : {}
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>

<style scoped>
.operation-image-cell {
  display: flex;
  flex-direction: column;
  padding: 0;
}
.dish-card-expanded {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 1px solid var(--ui-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--ui-bg);
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.dish-card-expanded:hover {
  border-color: var(--ui-primary);
  transform: translateY(-2px);
}
.dish-card-expanded:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.dish-card-expanded .dish-card-media {
  aspect-ratio: 4 / 3;
  background: var(--ui-bg-elevated);
}
.dish-card-expanded .dish-card-caption {
  padding: 16px;
}
.dish-card-expanded h3 {
  white-space: normal;
  line-height: 1.4;
  font-size: 15px;
}
.dish-card-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ui-text-muted);
}
.dish-card-list {
  flex-direction: row;
  align-items: center;
}
.dish-card-list .dish-card-media {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.dish-card-list .dish-card-caption {
  border-top: 0;
  padding: 10px 14px;
}
</style>
