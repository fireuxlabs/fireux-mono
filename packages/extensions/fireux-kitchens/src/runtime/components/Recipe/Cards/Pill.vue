<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="pill"
  >
    <div class="flex min-w-0 items-center gap-2">
      <UAvatar
        :src="avatarUrl || undefined"
        :alt="title || ''"
        size="sm"
        icon="i-lucide-scroll-text"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-center gap-2">
      <UAvatar
        :src="avatarUrl || undefined"
        :alt="title || ''"
        size="sm"
        icon="i-lucide-scroll-text"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeCard } from '../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface'

type PillProps = Pick<
  RecipeCard.Card,
  'to' | 'avatarUrl' | 'title'
> & {
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  avatarUrl: '',
  title: '',
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
