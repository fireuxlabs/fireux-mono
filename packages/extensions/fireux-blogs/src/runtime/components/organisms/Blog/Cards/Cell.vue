<template>
  <NuxtLink :to="card.to" class="block h-full">
    <UCard class="h-full" variant="outline">
      <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <p class="text-xs text-gray-500">{{ card.author }}</p>
            <h3 class="text-base font-semibold leading-tight">
              {{ card.title }}
            </h3>
            <p class="text-sm text-gray-600 line-clamp-2">{{ card.excerpt }}</p>
          </div>
          <div
            v-if="card.image"
            class="shrink-0 w-16 h-16 overflow-hidden rounded-md bg-gray-100"
          >
            <img
              :src="card.image"
              :alt="card.title"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
        <div class="mt-auto flex items-center gap-2 text-xs text-gray-500">
          <span v-if="card.readingTime">{{ card.readingTime }} min</span>
          <span
            v-if="card.badge"
            class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]"
          >
            {{ card.badge }}
          </span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogInterface } from '../../../../composables/firestore/objects/Blog/state/useBlogInterface'

const props = defineProps<{ post: BlogPost }>()

const { cellProps } = useBlogInterface()
const card = computed(() => cellProps(props.post))
</script>
