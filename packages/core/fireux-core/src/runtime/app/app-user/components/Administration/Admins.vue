<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Admins</h3>
          <p>Admins can manage who helps run this app.</p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="section__item">
      <ul>
        <li v-for="admin in rows" :key="admin.id">
          <UserCardsPill
            v-bind="pillFor(admin)"
            :link="Boolean(pillFor(admin).to)"
          />

          <UButton
            size="xs"
            variant="soft"
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
    <UButton v-if="hasMore" variant="soft" @click="$emit('load-more')">
      Load more admins
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import type { UserPillProps } from '../../../../user/components/Cards/Pill.vue'

type AdminRow = {
  id: string
  role: 'admin' | 'user' | 'dev'
  display_name: string
}

defineProps<{
  hasMore?: boolean
  rows: AdminRow[]
  actionUid: string | null
  pillFor: (row: AdminRow) => UserPillProps
  onRemoveAdmin: (uid: string) => Promise<unknown>
}>()

defineEmits<{ 'load-more': [] }>()
</script>
