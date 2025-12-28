<template>
  <NuxtLink :to="card.to" class="block">
    <UCard class="h-full" variant="soft">
      <div class="flex items-start gap-4">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2 text-xs text-gray-500">
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
            <span class="font-semibold text-gray-800">{{ card.author }}</span>
            <span v-if="card.readingTime" class="text-gray-500">
              · {{ card.readingTime }} min
            </span>
            <span
              v-if="card.badge"
              class="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700"
            >
              {{ card.badge }}
            </span>
          </div>
          <h3 class="text-lg font-semibold leading-tight">{{ card.title }}</h3>
          <p class="text-sm text-gray-500 line-clamp-3">{{ card.excerpt }}</p>
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
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogInterface } from '../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'

const props = defineProps<{ post: BlogPost }>()

const { teaserProps } = useBlogInterface()
const card = computed(() => teaserProps(props.post))

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
  border-radius: var(--radius-sm, 0.375rem);
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
