<template>
  <div v-if="displayTags.length" class="profile-tags">
    <UTag
      v-for="t in displayTags"
      :key="t"
      :label="t"
      :color="color"
      :variant="variant"
      :size="size"
    />
    <UTag
      v-if="moreCount > 0"
      :label="`+${moreCount} more`"
      :color="color"
      :variant="variant"
      :size="size"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tags?: string[] | null
    limit?: number
    size?: 'sm' | 'md' | 'lg'
    color?: string
    variant?: 'soft' | 'solid' | 'outline'
  }>(),
  {
    limit: 0,
    size: 'sm',
    color: 'primary',
    variant: 'soft',
  }
)

const safeTags = computed(() => (Array.isArray(props.tags) ? props.tags : []))
const displayTags = computed(() =>
  props.limit && props.limit > 0 ? safeTags.value.slice(0, props.limit) : safeTags.value
)
const moreCount = computed(() =>
  props.limit && props.limit > 0 ? Math.max(0, safeTags.value.length - props.limit) : 0
)
</script>

<style scoped>
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
