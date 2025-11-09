<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/Pill.vue -->
<template>
  <button
    type="button"
    :class="rootClass"
    :aria-label="title || 'pill'"
    @click="handleClick"
  >
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
          :title="badge"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Pill } from '../../types/pill.model.ts'

const props = withDefaults(defineProps<Pill.Props>(), {
  avatar: '',
  initials: 'A',
  title: '',
  subtitle: undefined,
  badges: () => [],
  to: null,
})

const router = useRouter()
const hasLink = computed(() => Boolean(props.to))

const rootClass = computed(() => [
  'pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm',
  hasLink.value
    ? 'cursor-pointer no-underline text-inherit focus:outline-none focus:ring-2 focus:ring-offset-2'
    : 'cursor-default',
])

const handleClick = () => {
  if (!hasLink.value || !props.to) return
  router.push(props.to)
}
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
