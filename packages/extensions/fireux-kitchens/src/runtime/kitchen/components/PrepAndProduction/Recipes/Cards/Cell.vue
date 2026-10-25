<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="block w-full"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="title"
        size="md"
        class="shrink-0"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-md border border-default bg-elevated/40 text-dimmed"
      >
        <UIcon name="i-lucide-scroll-text" class="size-5" />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-highlighted">
              {{ title }}
            </div>
            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="showBadges && badges.length"
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

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">No summary yet</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
type Props = {
  to: string
  title: string
  status: string
  badges: string[]
  avatarUrl?: string
  subtitle?: string
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showStatus?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  subtitle: '',
  prop: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  showStatus: true,
  showTagline: true,
  link: false,
  action: false,
})

</script>
