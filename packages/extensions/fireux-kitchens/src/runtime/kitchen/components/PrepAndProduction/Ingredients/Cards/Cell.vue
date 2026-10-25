<template>
  <FireActionSurface
    :to="preview ? undefined : to"
    :action="preview"
    @activate="emit('open')"
    :data-ingredient-id="id"
    class="ingredient-card group min-w-0 overflow-hidden rounded-xl border border-default bg-default transition hover:border-primary/40 hover:shadow-sm"
    :class="[
      variant === 'list' ? 'ingredient-card--list' : '',
      fluid || variant === 'list' ? 'w-full' : 'w-36',
    ]"
  >
    <div
      class="ingredient-card__media relative shrink-0 overflow-hidden bg-elevated/60"
    >
      <img
        v-if="imageUrl && !imageFailed"
        :src="imageUrl"
        :alt="title"
        class="size-full object-cover transition duration-300 motion-safe:group-hover:scale-[1.03]"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-transparent text-muted"
      >
        <UIcon
          :name="icon"
          :class="
            variant === 'list' ? 'size-6 opacity-50' : 'size-9 opacity-40'
          "
          aria-hidden="true"
        />
      </div>
    </div>
    <div
      class="ingredient-card__caption flex min-w-0 flex-1 items-center gap-3"
    >
      <div class="min-w-0 flex-1">
        <h3
          class="text-sm font-medium leading-snug text-highlighted"
          :class="variant === 'list' ? 'truncate' : 'line-clamp-2'"
        >
          {{ title || 'Unnamed ingredient' }}
        </h3>
        <p
          v-if="variant === 'list' && categoryLabel"
          class="mt-0.5 text-xs text-muted"
        >
          {{ categoryLabel }}
        </p>
      </div>
      <UIcon
        name="i-lucide-arrow-right"
        class="size-4 shrink-0 text-dimmed transition group-hover:text-primary"
        aria-hidden="true"
      />
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const props = withDefaults(
  defineProps<{
    id: string
    to: string
    title: string
    imageUrl?: string
    icon?: string
    categoryLabel?: string
    variant?: 'grid' | 'list'
    fluid?: boolean
    preview?: boolean
  }>(),
  {
    imageUrl: '',
    icon: 'i-lucide-carrot',
    categoryLabel: '',
    variant: 'grid',
    fluid: false,
    preview: false,
  }
)
const emit = defineEmits<{ 'image-error': []; open: [] }>()
const imageFailed = ref(false)
watch(
  () => props.imageUrl,
  () => {
    imageFailed.value = false
  }
)
function onImageError() {
  imageFailed.value = true
  emit('image-error')
}
</script>

<style scoped>
.ingredient-card {
  display: flex;
  flex-direction: column;
}
.ingredient-card__media {
  aspect-ratio: 4 / 3;
  width: 100%;
}
.ingredient-card__caption {
  padding: 0.875rem;
}
.ingredient-card--list {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem;
}
.ingredient-card--list .ingredient-card__media {
  width: 3.5rem;
  height: 3.5rem;
  aspect-ratio: 1;
  border-radius: 0.5rem;
}
.ingredient-card--list .ingredient-card__caption {
  padding: 0 0.5rem 0 0;
}
</style>
