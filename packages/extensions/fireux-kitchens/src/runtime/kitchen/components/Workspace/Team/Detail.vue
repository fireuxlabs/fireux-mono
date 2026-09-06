<template>
  <article
    class="grid gap-4 rounded-xl border border-default bg-default p-5 sm:p-6"
  >
    <header class="flex items-center gap-4">
      <UAvatar :alt="name" :text="initials" size="xl" />
      <div class="min-w-0">
        <h1 class="m-0 truncate text-xl font-semibold text-highlighted">
          {{ name }}
        </h1>
        <p class="m-0 mt-1 text-sm text-muted">
          {{ member.user_id ? 'Account linked' : 'Named Team member' }}
        </p>
      </div>
    </header>

    <dl class="grid gap-3 sm:grid-cols-2">
      <div v-for="fact in facts" :key="fact.label" class="fx-inset-panel p-3">
        <dt class="text-xs font-medium uppercase tracking-wide text-muted">
          {{ fact.label }}
        </dt>
        <dd class="m-0 mt-1 text-sm text-highlighted">{{ fact.value }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenTeamMember } from '../../../utils/team.ts'

const props = defineProps<{ member: KitchenTeamMember }>()
const text = (value: unknown) => String(value ?? '').trim()
const name = computed(
  () =>
    text(props.member.display_name) || text(props.member.name) || 'Team member'
)
const initials = computed(() =>
  name.value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
)
const facts = computed(() => [
  {
    label: 'Status',
    value: props.member.status === 'active' ? 'Active' : 'Inactive',
  },
])
</script>
