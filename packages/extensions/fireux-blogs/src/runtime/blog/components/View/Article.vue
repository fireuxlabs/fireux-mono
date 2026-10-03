<template>
  <NuxtLink :to="card.to" class="block">
    <UCard class="h-full" variant="soft">
      <div class="flex items-start gap-4">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2 text-xs text-muted">
            <span
              v-if="card.avatar"
              class="inline-flex h-6 w-6 overflow-hidden rounded-full"
            >
              <img
                :src="card.avatar"
                :alt="card.author"
                class="h-full w-full object-cover"
              />
            </span>
            <span class="font-semibold text-highlighted">{{
              card.author
            }}</span>
            <span v-if="card.readingTime" class="text-muted">
              · {{ card.readingTime }} min
            </span>
            <UBadge v-if="card.badge" color="neutral" size="xs" variant="soft">
              {{ card.badge }}
            </UBadge>
          </div>
          <h3 class="text-lg font-semibold leading-tight">{{ card.title }}</h3>
          <p class="text-sm text-muted line-clamp-3">{{ card.excerpt }}</p>
        </div>
        <div v-if="card.image" class="thumb" :style="thumbStyle">
          <img :src="card.image" :alt="card.title" class="thumb__img" />
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogDetail } from '../../models/blog-directory.model.ts'
import { useBlogInterface } from '../../composables/useBlogInterface'

const props = defineProps<{ post: BlogDetail }>()

const { preview: toPreview } = useBlogInterface()
const card = computed(() => {
  const preview = toPreview(props.post)

  return {
    to: preview?.to || '',
    avatar: preview?.avatarUrl || '',
    image: preview?.imageUrl || '',
    author: preview?.author || preview?.subtitle || '',
    readingTime: null as number | null,
    badge: preview?.badges?.[0] || '',
    title: preview?.title || '',
    excerpt: preview?.excerpt || preview?.summary || '',
  }
})

const thumbStyle = {
  width: '7rem',
  aspectRatio: '4 / 3',
}
</script>

<style scoped>
.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--ui-radius);
  background: transparent;
}

.thumb__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 0;
  display: block;
}
</style>
