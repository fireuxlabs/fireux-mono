<template>
  <component
    :is="wrapperTag"
    v-bind="wrapperBindings"
    :class="rootClass"
    :aria-label="normalized.title || 'user pill'"
  >
    <UAvatar
      :src="normalized.avatar"
      :alt="normalized.title || 'User'"
      :text="normalized.initials || 'A'"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="title" :title="normalized.title">
        {{ normalized.title || 'User' }}
      </span>

      <span
        v-if="normalized.subtitle"
        class="subtitle"
        :title="normalized.subtitle"
      >
        {{ normalized.subtitle }}
      </span>

      <div v-if="normalized.badges.length" class="badges">
        <UBadge
          v-for="badge in normalized.badges"
          :key="badge"
          color="primary"
          variant="soft"
          size="xs"
          :title="badge"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>

    <div v-if="normalized.special" class="meta">
      <UTooltip
        v-if="normalized.specialTooltip"
        :text="normalized.specialTooltip"
        :popper="tooltipPopper"
      >
        <UBadge
          color="primary"
          variant="soft"
          size="xs"
          :title="specialAriaLabel"
          class="admin-badge"
        >
          Admin
        </UBadge>
      </UTooltip>
      <UBadge
        v-else
        color="primary"
        variant="soft"
        size="xs"
        :title="specialAriaLabel"
        class="admin-badge"
      >
        Admin
      </UBadge>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model.ts'

const props = defineProps<{ user?: UserCard.Pill | null }>()

const tooltipPopper = { placement: 'top' as const }

const normalized = computed(() => {
  const base = props.user ?? ({} as UserCard.Pill)
  const badges = Array.isArray(base.badges)
    ? (base.badges.filter(Boolean) as string[])
    : []

  return {
    avatar: base.avatar ?? '',
    initials: base.initials ?? 'A',
    title: base.title ?? '',
    subtitle: base.subtitle ?? '',
    badges,
    to: base.to ?? null,
    special: Boolean(base.special),
    specialTooltip: base.specialTooltip ?? '',
  }
})

const hasLink = computed(() => Boolean(normalized.value.to))

const wrapperTag = computed(() => (hasLink.value ? 'NuxtLink' : 'div'))

const wrapperBindings = computed(() => {
  if (!hasLink.value) return {}
  const target = normalized.value.to as RouteLocationRaw
  return { to: target }
})

const rootClass = computed(() => [
  'pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm',
  hasLink.value
    ? 'cursor-pointer no-underline text-inherit focus:outline-none focus:ring-2 focus:ring-offset-2'
    : 'cursor-default',
])

const specialAriaLabel = computed(
  () => normalized.value.specialTooltip || 'Tenant admin'
)
</script>

<style scoped>
.pill {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  width: 100%;
  text-align: left;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.title {
  font-weight: 600;
  line-height: 1.2;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
}

.meta {
  margin-left: auto;
}

.admin-badge {
  text-transform: uppercase;
}
</style>
