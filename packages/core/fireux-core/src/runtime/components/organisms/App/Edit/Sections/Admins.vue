<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3 class="text-base font-semibold">Admins</h3>
          <p class="text-xs text-dimmed">
            App Admin membership operation. Admin role changes mirror app users
            and root user admin lists.
          </p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="section__item space-y-2">
      <ul class="space-y-2">
        <li
          v-for="admin in rows"
          :key="admin.id"
          class="flex items-center justify-between gap-3"
        >
          <UserCardsPill
            v-bind="pillFor(admin)"
            :link="Boolean(pillFor(admin).to)"
            class="min-w-0"
          />

          <UButton
            size="xs"
            variant="soft"
            class="shrink-0"
            :loading="actionUid === admin.id"
            :disabled="actionUid !== null"
            @click="onRemoveAdmin(admin.id)"
          >
            Remove admin
          </UButton>
        </li>
      </ul>
    </div>
    <p v-else class="section__empty">No admins yet.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

type AdminRow = {
  id: string
  role: 'admin' | 'user'
  display_name: string
  email: string | null
}

defineProps<{
  rows: AdminRow[]
  actionUid: string | null
  pillFor: (row: AdminRow) => UserCard.Card
  onRemoveAdmin: (uid: string) => Promise<unknown>
}>()

</script>
