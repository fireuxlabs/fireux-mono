<template>
  <section
    v-if="shouldRender"
    class="footer-admins"
    aria-labelledby="footer-admins-title"
  >
    <div class="footer-admins__header">
      <p id="footer-admins-title" class="footer-admins__label">Admin team</p>
      <p v-if="appName || app?.app_name" class="footer-admins__context">
        Managing {{ appName || app?.app_name }}
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
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { useAppUsers } from '../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import type { UserCard } from '../../../models/core/user.model'

const { app } = useApp()
const { users, pending } = useAppUsers()
const { fulfilled } = useUserCollection()
const { pillProps } = useUserInterface()
const { appName } = useFireUXConfig()

const toInitials = (value?: string | null) => {
  const input = (value ?? '').trim()
  if (!input) return 'A'
  return input
    .split(/\s+/)
    .map((token) => token[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const adminMemberships = computed(() =>
  (users.value ?? []).filter(
    (record) =>
      typeof record?.role === 'string' &&
      record.role.trim().toLowerCase() === 'admin'
  )
)

const adminEntries = computed(() =>
  (fulfilled?.value ?? []).filter(
    (entry) => entry.appUser?.role?.trim().toLowerCase() === 'admin'
  )
)

const adminCards = computed(() =>
  adminEntries.value.map((record, index) => {
    const pill = pillProps(record as any)
    const title =
      pill?.title ||
      record.display_name?.trim() ||
      record.handle?.trim() ||
      record.id ||
      `Admin ${index + 1}`

    const enriched: UserCard.Pill = {
      ...(pill ?? {
        title: '',
        subtitle: '',
        initials: '',
        avatar: '',
        badges: [],
        to: null,
      }),
      title,
      initials: pill?.initials ?? toInitials(title),
      to: pill?.to ?? (record.id ? `/users/${record.id}` : null),
      special: true,
      specialTooltip: 'Tenant admin',
    }

    return { key: record.id || `${index}`, pill: enriched }
  })
)

const isLoading = computed(
  () => Boolean(pending.value) && Boolean(adminMemberships.value.length)
)

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
