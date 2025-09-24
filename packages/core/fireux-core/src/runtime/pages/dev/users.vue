<template>
  <div class="page">
    <div class="header">
      <h1 class="title">Users (Core)</h1>
      <div class="meta" v-if="users">
        <UBadge variant="soft" color="primary">{{ users.length }} total</UBadge>
      </div>
    </div>

    <UAlert
      v-if="pending"
      title="Loading users"
      color="primary"
      :ui="{ base: 'mt-4' }"
      icon="i-lucide-loader"
    />

    <UAlert
      v-else-if="error"
      title="Failed to load users"
      color="red"
      :description="String(error)"
      icon="i-lucide-alert-triangle"
      :ui="{ base: 'mt-4' }"
    />

    <div v-else class="content">
      <div class="table-wrapper" v-if="users?.length">
        <UTable :rows="tableRows" :columns="columns" />
      </div>
      <div v-else class="empty">
        <p>No users found.</p>
      </div>

      <details class="raw">
        <summary class="cursor-pointer select-none text-sm text-gray-500 mt-6">
          Raw JSON
        </summary>
        <pre class="code-block">{{ users }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Users',
  layout: 'dev',
})

// Simple core-users collection stream
import { computed } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager'
import type { CoreUserDoc } from 'fireux-core/runtime/models/core/user.model'

const { firestoreFetchCollection } = useFirestoreManager()

// Returns a Ref<Array<CoreUserDoc> | null>
const {
  data: users,
  pending,
  error,
} = firestoreFetchCollection<CoreUserDoc>('core-users') as any

const columns = [
  { key: 'avatar', label: 'Avatar' },
  { key: 'display_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'adminOf', label: 'Admin Of' },
  { key: 'userOf', label: 'User Of' },
]

const tableRows = computed(() =>
  (users?.value || []).map((u) => ({
    ...u,
    adminOf: u.adminOf?.length ? u.adminOf.join(', ') : '',
    userOf: u.userOf?.length ? u.userOf.join(', ') : '',
  }))
)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-size: 1.5rem;
  font-weight: 600;
}
.table-wrapper {
  margin-top: 20px;
}
.code-block {
  margin-top: 12px;
  background: var(--ui-bg-muted, #f5f5f5);
  padding: 12px;
  border-radius: 8px;
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
}
.empty {
  margin-top: 24px;
  opacity: 0.7;
}
</style>
