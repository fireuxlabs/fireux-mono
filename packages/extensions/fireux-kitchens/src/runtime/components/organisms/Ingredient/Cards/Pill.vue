<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <div class="space-y-1">
      <UUser
        :name="title"
        :description="subtitle || undefined"
        :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-carrot', alt: title || '' }"
        size="sm"
      />
      <code
        v-if="showSlug && id"
        class="block truncate text-[11px] text-dimmed"
      >
        {{ id }}
      </code>
      <UChip
        v-if="warning"
        color="warning"
        variant="soft"
        size="xs"
        :title="warning"
      >
        <UIcon name="i-lucide-triangle-alert" />
      </UChip>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { IngredientCard } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

type PillProps = Pick<IngredientCard.Card, 'id' | 'to' | 'title' | 'subtitle' | 'imageUrl'> & {
  link?: boolean
  action?: boolean
  warning?: string
  showSlug?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  link: false,
  action: false,
  showSlug: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
