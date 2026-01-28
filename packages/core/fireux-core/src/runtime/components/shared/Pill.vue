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

    <div class="pill__body">
      <div class="pill__title">
        {{ title }}
      </div>

      <div v-if="showSubtitle" class="pill__subtitle">
        {{ subtitle || tagline }}
      </div>
    </div>

    <div v-if="showBadges && (badges?.length ?? 0)" class="pill__badges">
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

</script>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text);
  min-width: 0;
}

.pill__body {
  min-width: 0;
  flex: 1 1 auto;
}

.pill__title {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1rem;
}

.pill__subtitle {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.6875rem;
  line-height: 1rem;
  color: var(--ui-text-muted, var(--ui-text));
}

.pill__badges {
  margin-left: 0.5rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
}

.pill :deep(.u-avatar),
.pill :deep(.u-avatar img) {
  width: 1.5rem;
  height: 1.5rem;
}

.pill :deep(.u-avatar) {
  flex: 0 0 1.5rem;
  line-height: 1.5rem;
}

.pill:hover {
  background: var(--ui-bg-muted);
}
</style>