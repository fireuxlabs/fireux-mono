<template>
  <FireActionSurface
    :to="preview ? undefined : to"
    :action="preview"
    @activate="emit('open')"
    :data-ingredient-id="id"
    class="card card--cell ingredient-card"
    :class="{ 'ingredient-card--list': variant === 'list' }"
  >
    <div class="ingredient-card__media">
      <img
        v-if="imageUrl && !imageFailed"
        :src="imageUrl"
        :alt="title"
        class="size-full object-cover"
        loading="lazy"
        @error="onImageError"
      />
      <div v-else>
        <UIcon :name="icon" aria-hidden="true" />
      </div>
    </div>
    <div class="ingredient-card__caption">
      <div>
        <h3>
          {{ title || 'Unnamed ingredient' }}
        </h3>
        <p v-if="variant === 'list' && categoryLabel">
          {{ categoryLabel }}
        </p>
      </div>
      <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
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
    preview?: boolean
  }>(),
  {
    imageUrl: '',
    icon: 'i-lucide-carrot',
    categoryLabel: '',
    variant: 'grid',
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
