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


  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/models/workspace-team-member.model'

const props = defineProps<{ member: WorkspaceTeamMemberDocument }>()
const text = (value: unknown) => String(value ?? '').trim()
const name = computed(() => text(props.member.name) || 'Team member')
const initials = computed(() =>
  name.value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
)
</script>
