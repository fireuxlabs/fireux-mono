<!-- Concurrent edit — 2026-07-24 — Project signup monitor: show the bounded cross-App user-join feed. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-project-users">
      <template #header>
        <LayoutsConsoleNavbar title="Project Users">
          <template #right>
            <UButton
              label="Refresh"
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              :loading="pending"
              @click="refresh()"
            />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <div class="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
          <UPageHeader
            headline="Control plane"
            title="New users across FireUX"
            description="A minimal signup feed published by each App. Returning sign-ins are excluded."
          />

          <div class="grid gap-3 sm:grid-cols-3">
            <UPageCard title="Recent joins" :description="String(items.length)" />
            <UPageCard title="Apps" :description="String(appCount)" />
            <UPageCard title="Projects" :description="String(projectCount)" />
          </div>

          <MoleculesStateCard
            v-if="pending"
            entity="project user activity"
            kind="collection"
            loading
          />
          <MoleculesStateCard
            v-else-if="error"
            entity="project user activity"
            kind="collection"
            state="error"
          />

          <UAlert
            v-else-if="!items.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-users"
            title="No signup activity yet"
            description="New App memberships will appear here after source publishing is enabled."
          />

          <div v-else class="space-y-3">
            <UCard v-for="item in items" :key="item.id" variant="subtle">
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-medium text-highlighted">
                      {{ item.app_id }}
                    </p>
                    <UBadge color="neutral" variant="soft">
                      {{ item.project_id }}
                    </UBadge>
                    <UBadge
                      :color="
                        item.membership_role === 'admin' ? 'primary' : 'neutral'
                      "
                      variant="subtle"
                    >
                      {{ item.membership_role }}
                    </UBadge>
                  </div>
                  <p class="mt-2 truncate text-sm text-muted">
                    User {{ item.user_id }}
                  </p>
                </div>

                <div class="shrink-0 text-sm text-muted sm:text-right">
                  <p>{{ formatTime(item.occurred_at) }}</p>
                  <p class="mt-1 text-xs text-dimmed">
                    {{ item.ecosystem_id || 'direct project app' }} ·
                    {{ item.database_id }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, useAsyncData } from '#imports'
import type {
  ProjectUserJoinFeedItem,
  ProjectUserJoinFeedResponse,
} from 'fireux-core/runtime/models/operations/project-user-join.model'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { currentUser, hasAuthState } = useAuth()
const uid = computed(() => currentUser.value?.uid || '')
const { data, pending, error, refresh } =
  useAsyncData<ProjectUserJoinFeedResponse>(
    () => `project-user-joins-${uid.value || 'anonymous'}`,
    async () => {
      const user = currentUser.value
      if (!import.meta.client || !hasAuthState.value || !user) {
        return { ok: true, items: [], count: 0 }
      }
      const token = await user.getIdToken()
      return $fetch<ProjectUserJoinFeedResponse>(
        '/api/internal/control/user-joins',
        {
          query: { limit: 100 },
          headers: { authorization: `Bearer ${token}` },
        }
      )
    },
    {
      server: false,
      lazy: true,
      watch: [currentUser, hasAuthState],
    }
  )

const items = computed<ProjectUserJoinFeedItem[]>(() => data.value?.items ?? [])
const appCount = computed(
  () =>
    new Set(
      items.value.map((item: ProjectUserJoinFeedItem) => item.app_id)
    ).size
)
const projectCount = computed(
  () =>
    new Set(
      items.value.map((item: ProjectUserJoinFeedItem) => item.project_id)
    ).size
)
const dateTime = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatTime(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? dateTime.format(date)
    : 'Unknown time'
}

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-users',
    label: 'Users',
    icon: 'i-lucide-users',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
})
</script>
