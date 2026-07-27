<template>
  <component
    :is="rootComponent"
    v-bind="rootAttrs"
    class="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    @click="onClick"
  >
    <div class="aspect-[4/3] overflow-hidden bg-elevated">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="title"
        class="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-full items-center justify-center text-muted"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-utensils" class="size-7" />
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1.5 border-t border-default px-3 py-2.5">
      <div class="flex min-w-0 items-start gap-2">
        <h3 class="min-w-0 flex-1 truncate text-sm font-semibold text-highlighted">
          {{ title || 'Untitled dish' }}
        </h3>
        <UIcon
          v-if="link && to"
          name="i-lucide-arrow-right"
          class="mt-0.5 size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>

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
