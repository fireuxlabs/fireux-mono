<template>
  <UCard class="profile-card">
    <div v-if="app" class="profile">
      <!-- Header -->
      <div class="profile-header">
        <div class="avatar-wrap">
          <UAvatar
            :src="avatarSrc || undefined"
            :alt="app.app_name"
            size="xl"
            class="avatar"
          />
        </div>

        <div class="identity">
          <h2 class="name">{{ app.app_name }}</h2>

          <div class="identity-meta">
            <UBadge
              v-if="app.ecosystem"
              size="sm"
              variant="solid"
              color="primary"
            >
              <UIcon name="i-lucide-building" class="icon" />
              {{ app.ecosystem }}
            </UBadge>

            <UBadge v-if="roleLabel" size="sm" variant="soft" color="neutral">
              {{ roleLabel }}
            </UBadge>

            <span class="mono id-chip" title="App ID">{{ app.id }}</span>
          </div>

          <p v-if="app.description" class="about">
            {{ app.description }}
          </p>
        </div>
      </div>

      <USeparator v-if="hasAnyDetail" />

      <!-- Details Grid -->
      <div v-if="hasAnyDetail" class="section-grid">
        <!-- Admins -->
        <section v-if="adminCount > 0" class="section-card">
          <h3 class="section-title">Administrators</h3>
          <div class="admin-grid">
            <OrganismsUserCardsPill
              v-for="entry in adminEntries"
              :key="`admin-${entry.id}`"
              :user="entry.pill"
            />
          </div>
        </section>

        <!-- Social -->
        <section v-if="instagram" class="section-card">
          <h3 class="section-title">Social</h3>
          <div class="kv">
            <span class="kv-key">
              <UIcon name="i-lucide-instagram" class="icon" /> Instagram
            </span>
            <a
              class="kv-val link"
              :href="instagram"
              target="_blank"
              rel="noopener"
            >
              {{ prettyUrl(instagram) }}
            </a>
          </div>
        </section>

        <!-- System -->
        <section class="section-card">
          <h3 class="section-title">System</h3>
          <div class="kv" v-if="createdAt">
            <span class="kv-key">
              <UIcon name="i-lucide-clock" class="icon" /> Created
            </span>
            <span class="kv-val">{{ createdAt }}</span>
          </div>
          <div class="kv" v-if="updatedAt">
            <span class="kv-key">
              <UIcon name="i-lucide-refresh-cw" class="icon" /> Updated
            </span>
            <span class="kv-val">{{ updatedAt }}</span>
          </div>
          <div class="kv" v-if="hasAssets">
            <span class="kv-key">
              <UIcon name="i-lucide-image" class="icon" /> Assets
            </span>
            <div class="chip-group">
              <UBadge v-if="app.avatar_url" size="xs" variant="soft"
                >Avatar</UBadge
              >
              <UBadge v-if="app.logo_url" size="xs" variant="soft">Logo</UBadge>
              <UBadge v-if="app.wordmark_url" size="xs" variant="soft"
                >Wordmark</UBadge
              >
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="empty">
      <UIcon name="i-lucide-app-window" class="icon-xxl" />
      <p>No app loaded.</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'
import type { AppCard } from '../../../../models/core/app.model'
import type { UserCard } from '../../../../models/core/user.model'
import { useUserFetch } from '../../../../composables/firestore/core/user/main/useUserFetch'
import { useUserInterface } from '../../../../composables/firestore/core/user/main/useUserInterface'

type Props = { app: AppCard.Profile | null }
const props = defineProps<Props>()

const app = computed(() => props.app)

const avatarSrc = computed(
  () =>
    app.value?.avatar_url ||
    app.value?.logo_url ||
    app.value?.wordmark_url ||
    ''
)

const roleLabel = computed(() => {
  const r = app.value?.role
  if (!r) return ''
  if (r === 'tenant') return 'Tenant'
  if (r === 'global') return 'Global'
  return r.charAt(0).toUpperCase() + r.slice(1)
})

const adminIds = computed(() => {
  const ids = Array.isArray(app.value?.admin_ids)
    ? (app.value?.admin_ids ?? [])
    : []

  if (!ids.length) return []

  const trimmed = ids
    .map((id) => (id ?? '').trim())
    .filter((id): id is string => id.length > 0)

  return trimmed.length ? Array.from(new Set(trimmed)) : []
})

const adminCount = computed(() => adminIds.value.length)
const instagram = computed(() => app.value?.social_links?.instagram || '')

const createdAt = computed(
  () => formatFirestoreTimestamp(app.value?.created_at) ?? ''
)
const updatedAt = computed(
  () => formatFirestoreTimestamp(app.value?.updated_at) ?? ''
)

const hasAssets = computed(() =>
  Boolean(
    app.value?.avatar_url || app.value?.logo_url || app.value?.wordmark_url
  )
)

const hasAnyDetail = computed(
  () =>
    adminCount.value > 0 ||
    !!instagram.value ||
    !!createdAt.value ||
    !!updatedAt.value ||
    hasAssets.value
)

const adminLookup: Record<string, ReturnType<typeof useUserFetch>> = {}
const { pillProps: userPillProps } = useUserInterface()

const ensureAdminFetcher = (uid: string) => {
  const key = uid.trim()
  if (!key) return null
  if (!adminLookup[key]) {
    adminLookup[key] = useUserFetch(key)
  }
  return adminLookup[key]
}

const placeholderPill = (id: string, pending: boolean): UserCard.Pill => {
  const initials = (id.replace(/[^a-z0-9]/gi, '').slice(0, 2) || 'ID').toUpperCase()

  return {
    avatar: '',
    initials,
    title: pending ? 'Loading user' : 'User unavailable',
    subtitle: id,
    badges: pending ? ['Pending'] : [],
    to: null,
    special: !pending,
    specialIcon: 'i-lucide-alert-triangle',
    specialTooltip: pending
      ? 'Fetching user details'
      : 'No user profile found for this administrator ID.',
  }
}

const adminEntries = computed(() =>
  adminIds.value.map((id) => {
    const fetcher = ensureAdminFetcher(id)

    if (!fetcher) {
      return {
        id,
        pill: placeholderPill(id, false),
      }
    }

    const user = fetcher.user.value
    const pending = fetcher.pending.value

    return {
      id,
      pill: user ? userPillProps(user) : placeholderPill(id, pending),
    }
  })
)

watchEffect(() => {
  for (const id of adminIds.value) {
    ensureAdminFetcher(id)
  }
})

function prettyUrl(u: string) {
  try {
    const url = new URL(u)
    return url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/$/, '')
  } catch {
    return u
  }
}
</script>

<style scoped>
.profile-card {
  padding: 0;
  overflow: hidden;
}

.profile {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

.profile-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  box-shadow: 0 0 0 3px var(--ui-background-100, rgba(15, 23, 42, 0.05)),
    0 8px 30px -12px rgba(15, 23, 42, 0.25);
  border: 2px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  border-radius: 1rem;
}

.identity {
  display: grid;
  gap: 0.6rem;
  min-width: 14rem;
}

.name {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.identity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.id-chip {
  background: var(--ui-background-100, rgba(148, 163, 184, 0.1));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  border-radius: 0.5rem;
  padding: 0.15rem 0.5rem;
  font-size: 0.78rem;
  color: var(--ui-text-600, #475569);
}

.about {
  margin-top: 0.25rem;
  color: var(--ui-text-600, #475569);
  font-size: 0.98rem;
  line-height: 1.55;
}

.section-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.section-card {
  background: var(--ui-background-100, rgba(148, 163, 184, 0.1));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.25));
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.6rem;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ui-text-500, #64748b);
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.admin-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.kv {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 0.75rem;
  align-items: center;
}

.kv + .kv {
  margin-top: 0.35rem;
}

.kv-key {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--ui-text-500, #64748b);
  font-weight: 600;
}

.kv-val {
  font-size: 0.95rem;
  color: var(--ui-text-700, #334155);
}

.link {
  text-decoration: none;
  border-bottom: 1px dashed rgba(100, 116, 139, 0.5);
}
.link:hover {
  color: var(--ui-text-900, #0f172a);
  border-bottom-style: solid;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.icon {
  width: 1rem;
  height: 1rem;
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
}

.icon-xxl {
  width: 3rem;
  height: 3rem;
  color: var(--ui-text-300, rgba(203, 213, 225, 0.9));
}

.empty {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--ui-text-500, #64748b);
}

@media (max-width: 640px) {
  .profile {
    padding: 1.25rem;
    gap: 1rem;
  }
  .profile-header {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  .name {
    font-size: 1.4rem;
  }
}
</style>
