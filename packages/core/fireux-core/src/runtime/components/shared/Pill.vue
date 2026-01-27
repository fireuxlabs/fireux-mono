<template>
  <div class="pill">
    <UAvatarGroup v-if="avatar && avatarSecondary" size="xs">
      <UAvatar
        :src="avatar || undefined"
        :alt="title || ''"
        size="xs"
      />
      <UAvatar
        :src="avatarSecondary || undefined"
        :alt="title || ''"
        size="2xs"
      />
    </UAvatarGroup>

    <UAvatar
      v-else
      :src="avatar || undefined"
      :alt="title || ''"
      size="xs"
    />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">
        {{ title }}
      </div>

      <div
        v-if="showSubtitle && resolvedSubtitle"
        class="min-w-0 truncate text-xs text-dimmed"
      >
        {{ resolvedSubtitle }}
      </div>
    </div>

    <div v-if="showBadges && (badges?.length ?? 0)" class="ml-2 flex shrink-0 items-center gap-1">
      <UBadge
        v-for="badge in (badges ?? [])"
        :key="badge"
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pill } from '../../models/shared/pill.model'

defineOptions({ inheritAttrs: false })

type Props = Pill.Props & {
  showSubtitle?: boolean
  showBadges?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: null,
  avatarSecondary: null,
  title: '',
  subtitle: null,
  tagline: null,
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
})

const resolvedSubtitle = computed(() => {
  return (props.subtitle ?? props.tagline ?? '').trim()
})

</script>