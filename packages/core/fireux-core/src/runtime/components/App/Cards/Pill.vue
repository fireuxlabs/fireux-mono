<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="pill"
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
  </NuxtLink>

  <div
    v-else
    class="pill"
    @click="onClick"
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
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { AppCard } from '../../../composables/fireux/app/useAppInterface';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

type Props = Partial<AppCard.Card> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return

  navigateTo(props.to)
}
</script>
