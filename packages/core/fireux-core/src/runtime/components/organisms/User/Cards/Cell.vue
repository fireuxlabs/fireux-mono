<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Organisms/User/Cards/Cell.vue -->
<template>
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
          <UBadge v-if="user.role" size="xs" variant="subtle">{{ user.role }}</UBadge>
        </div>

        <div v-if="user.profiles?.length" class="subrow">
          <span class="pill">{{ user.profiles.join(', ') }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model'

const props = defineProps<{
  user: UserCard.Cell
}>()

const initials = computed(() => {
  const name = props.user.display_name?.trim() ?? ''
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .map((w) => w[0])
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