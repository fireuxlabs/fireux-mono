<template>
  <section
    v-if="shouldRender"
    class="footer-admins"
    aria-labelledby="footer-admins-title"
  >
    <div class="footer-admins__header">
      <p id="footer-admins-title" class="footer-admins__label">Admin team</p>
      <p v-if="appName" class="footer-admins__context">
        Managing {{ appName }}
      </p>
    </div>

    <div v-if="isLoading" class="footer-admins__loading">
      <USkeleton v-for="n in 2" :key="n" class="footer-admins__skeleton" />
    </div>

    <div v-else-if="adminCards.length" class="footer-admins__grid">
      <OrganismsUserCardsPill
        v-for="admin in adminCards"
        :key="admin.key"
        :user="admin.pill"
      />
    </div>

    <p v-else class="footer-admins__empty">No admins assigned yet.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model.ts'

const { app } = useApp()

const uniqueAdminIds = computed(() => {
  const ids = Array.isArray(app.value?.admin_ids)
    ? (app.value?.admin_ids as Array<string | null | undefined>)
    : []
  return Array.from(
    new Set(
      ids
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id) => id.length > 0)
    )
  )
})

const appName = computed(() => app.value?.app_name ?? null)

const roleLabel = (value?: string | null) => {
  const normalized = (value ?? 'admin').toLowerCase()
  if (!normalized) return 'Admin'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const toInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)

const adminRefCache = new Map<string, ReturnType<typeof useUserFetch>>()

const resolveRefs = (uid: string) => {
  if (!adminRefCache.has(uid)) {
    adminRefCache.set(uid, useUserFetch(uid))
  }
  return adminRefCache.get(uid)!
}

const adminRefs = computed(() =>
  uniqueAdminIds.value.map((uid) => ({ uid, refs: resolveRefs(uid) }))
)

const isLoading = computed(() =>
  adminRefs.value.some(({ refs }) => refs.pending?.value)
)

const adminCards = computed(() => {
  return adminRefs.value
    .map(({ uid, refs }, index) => {
      const record = refs.user.value || refs.coreUser.value
      if (!record) return null

      const title =
        record.display_name?.trim() ||
        record.handle?.trim() ||
        uid ||
        `Admin ${index + 1}`
      const handle = record.handle?.trim()
      const subtitle = handle ? `@${handle}` : ''
      const pill: UserCard.Pill = {
        avatar: record.avatar ?? '',
        initials: title ? toInitials(title) : 'A',
        title,
        subtitle,
        badges: [roleLabel(record.role)],
        to: uid ? `/users/${uid}` : null,
      }

      return { key: uid || `${index}`, pill }
    })
    .filter((entry): entry is { key: string; pill: UserCard.Pill } =>
      Boolean(entry)
    )
})

const shouldRender = computed(
  () => isLoading.value || Boolean(adminCards.value.length)
)
</script>

<style scoped>
.footer-admins {
  width: 100%;
  border-top: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  padding-top: 1.5rem;
}

.footer-admins__header {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 0.75rem;
}

.footer-admins__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-500, rgba(100, 116, 139, 1));
}

.footer-admins__context {
  font-size: 0.85rem;
  color: var(--ui-text-400, rgba(100, 116, 139, 0.9));
}

.footer-admins__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  width: 100%;
}

.footer-admins__loading {
  display: grid;
  gap: 0.5rem;
}

.footer-admins__skeleton {
  height: 3.5rem;
  border-radius: 0.75rem;
}

.footer-admins__empty {
  font-size: 0.85rem;
  color: var(--ui-text-400, rgba(100, 116, 139, 0.9));
}
</style>
