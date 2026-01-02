<template>
  <div
    class="fx-pill"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
      <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ vmSubtitle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPost } from '../../../../../models/objects/blogPost.model'
import { useBlogInterface } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  post?: BlogPost | null
}>()

const { cellProps } = useBlogInterface()

const resolved = computed(() => (props.post ? cellProps(props.post) : null))

const vmTitle = computed(() => props.title ?? resolved.value?.title ?? 'Blog')
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value?.author ?? undefined
)
const vmAvatar = computed(() => props.avatar ?? resolved.value?.avatar ?? null)
</script>
