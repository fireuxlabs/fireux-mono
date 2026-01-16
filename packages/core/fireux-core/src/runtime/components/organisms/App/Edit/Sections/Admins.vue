<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h3 class="text-base font-semibold">Admins</h3>
          <p class="text-xs text-dimmed">App administrators.</p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="fx-section__item space-y-2">
      <ul class="space-y-2">
        <li
          v-for="admin in rows"
          :key="admin.id"
          class="flex items-center justify-between gap-3"
        >
          <component
            :is="wrapperFor(pillFor(admin))"
            v-bind="wrapperPropsFor(pillFor(admin))"
            class="min-w-0"
          >
            <OrganismsUserCardsPill v-bind="pillFor(admin)" class="min-w-0" />
          </component>

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
    <p v-else class="fx-section__empty">No admins yet.</p>
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

const wrapperFor = (card: UserCard.Card) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: UserCard.Card) => (card.to ? { to: card.to } : {})
</script>
