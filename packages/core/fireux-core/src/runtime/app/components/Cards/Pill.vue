<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="thumbnailUrl || undefined"
        :text="avatarText || undefined"
        :alt="displayName || ''"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-default">
          {{ displayName }}
        </p>
        <p v-if="showSubtitle && ecosystem" class="truncate text-xs text-dimmed">
          {{ ecosystem }}
        </p>
        <div v-if="showBadges && (badges?.length ?? 0)" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { AppCard } from '../../composables/useAppView';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

type Props = Partial<AppCard> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

withDefaults(defineProps<Props>(), {
  to: '',
  thumbnailUrl: '',
  avatarText: '',
  displayName: '',
  ecosystem: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

</script>
