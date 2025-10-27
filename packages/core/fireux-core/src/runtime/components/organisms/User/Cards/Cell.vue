<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Organisms/User/Cards/Cell.vue -->
<template>
  <component :is="wrapperTag" v-bind="wrapperBindings" :class="wrapperClass">
    <UCard class="cell">
      <div class="cell-inner">
        <UAvatar
          :src="user.avatar"
          :alt="user.display_name"
          size="md"
          :text="initials"
        />

        <div class="meta">
          <div class="row">
            <strong class="name">{{ user.display_name }}</strong>
            <span v-if="user.handle" class="handle">@{{ user.handle }}</span>
            <UBadge v-if="user.role" size="xs" variant="subtle">{{
              user.role
            }}</UBadge>
          </div>

          <div v-if="user.profiles?.length" class="subrow">
            <span class="pill">{{ user.profiles.join(', ') }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const props = defineProps<{
  user: User
  to?: RouteLocationRaw | null
}>()

const wrapperTag = computed(() => (props.to ? 'NuxtLink' : 'div'))
const wrapperBindings = computed(() => (props.to ? { to: props.to } : {}))
const wrapperClass = computed(() =>
  props.to ? 'block no-underline text-inherit' : undefined
)

const initials = computed(() => {
  const name = props.user.display_name?.trim() ?? ''
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<style scoped>
.cell-inner {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.meta {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.name {
  font-weight: 700;
}
.handle {
  opacity: 0.7;
}
.subrow {
  margin-top: 0.25rem;
  opacity: 0.85;
  font-size: 0.85rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  padding: 0.15rem 0.6rem;
  line-height: 1.1;
}
</style>
