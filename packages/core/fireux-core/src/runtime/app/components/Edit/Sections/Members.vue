<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Members</h3>
          <p>
            People with access to this app.
          </p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="section__item space-y-2">
      <ul class="space-y-2">
        <li
          v-for="member in rows"
          :key="member.id"
          class="flex flex-wrap items-center justify-between gap-3"
        >
          <UserCardsPill
            v-bind="pillFor(member)"
            :link="Boolean(pillFor(member).to)"
            class="min-w-0"
          />

          <UBadge
            size="xs"
            :color="member.role === 'admin' || member.role === 'dev' ? 'primary' : 'neutral'"
            variant="soft"
            class="shrink-0"
          >
            {{ member.role }}
          </UBadge>
        </li>
      </ul>
    </div>
    <p v-else class="section__empty">No members yet.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../user/composables/useUserInterface'

type MemberRow = {
  id: string
  role: 'admin' | 'user' | 'dev'
  display_name: string
}

defineProps<{
  rows: MemberRow[]
  pillFor: (row: MemberRow) => UserCard.Card
}>()
</script>
