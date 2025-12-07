<template>
  <NuxtLink :to="card.to" class="block">
    <UCard class="h-full" variant="soft">
      <div class="flex items-start gap-4">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2 text-xs text-gray-500">
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
          <p class="text-sm text-gray-600 line-clamp-3">{{ card.excerpt }}</p>
        </div>
        <div
          v-if="card.image"
          class="shrink-0 w-28 h-20 overflow-hidden rounded-md bg-gray-100"
        >
          <img
            :src="card.image"
            :alt="card.title"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogInterface } from '../../../../composables/fireux/firestore/objects/Blog/state/useBlogInterface'

const props = defineProps<{ post: BlogPost }>()

const { teaserProps } = useBlogInterface()
const card = computed(() => teaserProps(props.post))
</script>
