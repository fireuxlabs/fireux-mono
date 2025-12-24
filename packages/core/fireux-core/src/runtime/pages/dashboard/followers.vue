<script setup lang="ts">
import { definePageMeta, useState } from '#imports'

// Note: This page can expand with invite/manage actions; see archived members mechanics for list + search patterns.
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-followers',
    label: 'Followers',
    icon: 'i-lucide-users',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

type Member = { id: number; name: string; username: string }

const q = useState<string>('fireux-core:dashboard-followers:q', () => '')
const members = useState<Member[]>('fireux-core:dashboard-followers:members', () => [
  { id: 1, name: 'Alice Example', username: 'alice' },
  { id: 2, name: 'Bob Example', username: 'bob' },
])

const filteredMembers = () => {
  const r = new RegExp(q.value, 'i')
  return members.value.filter((m) => r.test(m.name) || r.test(m.username))
}
</script>

<template>
  <UDashboardPanel id="dashboard-followers">
    <template #header>
      <UDashboardNavbar title="Followers">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPage>
        <UPageBody>
          <UPageHeader
            description="People who follow your updates."
          />

          <UPageCard
            title="Members"
            description="Invite new members by email address."
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
            <UButton
              label="Invite people (coming soon)"
              color="neutral"
              class="w-fit lg:ms-auto"
              disabled
            />
          </UPageCard>

          <UPageCard
            variant="subtle"
            :ui="{
              container: 'p-0 sm:p-0 gap-y-0',
              wrapper: 'items-stretch',
              header: 'p-4 mb-0 border-b border-default',
            }"
          >
            <template #header>
              <UInput
                v-model="q"
                icon="i-lucide-search"
                placeholder="Search members"
                autofocus
                class="w-full"
              />
            </template>

            <div class="p-4 flex flex-col gap-2">
              <template v-if="filteredMembers().length">
                <div
                  v-for="m in filteredMembers()"
                  :key="m.id"
                  class="flex items-center justify-between py-2"
                >
                  <div class="text-sm">
                    <p class="font-medium text-highlighted">{{ m.name }}</p>
                    <p class="text-dimmed">@{{ m.username }}</p>
                  </div>
                  <UButton label="Manage" color="neutral" variant="ghost" />
                </div>
              </template>
              <p v-else class="text-sm text-dimmed">
                No members match your search.
              </p>
            </div>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
