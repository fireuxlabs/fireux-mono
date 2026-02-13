<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="showSubtitle ? (subtitle || undefined) : undefined"
      :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-carrot', alt: title || '' }"
      size="sm"
    >
      <template #default>
        <div
          v-if="(showSlug && slug) || warningLabel"
          class="flex flex-wrap items-center gap-1"
        >
          <UBadge
            v-if="showSlug && slug"
            variant="soft"
            color="neutral"
            size="xs"
            class="font-mono"
          >
            {{ slug }}
          </UBadge>
          <UTooltip
            v-if="warningLabel && warningDescription"
            :text="warningDescription"
            :popper="{ placement: 'top' }"
          >
            <UBadge
              variant="soft"
              color="warning"
              size="xs"
            >
              <UIcon name="i-lucide-triangle-alert" class="mr-1" />
              {{ warningLabel }}
            </UBadge>
          </UTooltip>
          <UBadge
            v-else-if="warningLabel"
            variant="soft"
            color="warning"
            size="xs"
          >
            <UIcon name="i-lucide-triangle-alert" class="mr-1" />
            {{ warningLabel }}
          </UBadge>
        </div>
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IngredientCard } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

type PillProps = Pick<IngredientCard.Card, 'slug' | 'to' | 'title' | 'subtitle' | 'imageUrl'> & {
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
  warning?: string
  showSlug?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  link: false,
  action: false,
  showSlug: false,
})

const warningLabel = computed(() => String(props.warning || '').trim())
const warningDescription = computed(() => {
  const value = warningLabel.value
  if (!value) return ''

  const normalized = value.toLowerCase()
  if (normalized === 'unused') {
    return 'Not used in recipes, mise, or active menu dishes'
  }
  if (normalized === 'off menu') {
    return 'Used in prep or recipes, but not on any active menu dish'
  }
  return ''
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
