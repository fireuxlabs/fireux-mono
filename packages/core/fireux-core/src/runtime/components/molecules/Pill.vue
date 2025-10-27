<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/Pill.vue -->
<template>
  <component :is="wrapperTag" v-bind="linkBindings" :class="rootClass">
    <UAvatar
      :src="avatar"
      :alt="title"
      :text="initials"
      size="sm"
      class="avatar"
    />

    <div class="flex flex-1 flex-col leading-tight min-w-0">
      <span class="title truncate">
        {{ title }}
      </span>

      <span v-if="subtitle" class="subtitle truncate">
        {{ subtitle }}
      </span>

      <div v-if="badges?.length" class="badges">
        <UBadge
          v-for="badge in badges"
          :key="badge"
          color="primary"
          variant="soft"
          size="md"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pill } from '../../types/pill.model'

const props = defineProps<Pill.Props>()

const linkTarget = computed(() => props.to ?? null)
const wrapperTag = computed(() => (linkTarget.value ? 'NuxtLink' : 'div'))
const linkBindings = computed(() =>
  linkTarget.value ? { to: linkTarget.value } : {}
)
const rootClass = computed(() => [
  'pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm',
  linkTarget.value ? 'block no-underline text-inherit' : null,
])
</script>

<style scoped>
.pill {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.title {
  font-weight: 600;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.35rem;
}
</style>
