<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        v-if="avatarUrl"
        :src="avatarUrl || undefined"
        alt=""
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div
          v-if="showBadges && (badges?.length ?? 0)"
          class="flex flex-wrap items-center gap-1"
        >
          <UBadge
            v-for="badge in badges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">

import type { BlogCard } from '../../composables/useBlogInterface'

type PillProps = Pick<
  BlogCard.Card,
  'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'
> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

</script>
