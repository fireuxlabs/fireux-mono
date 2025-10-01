<script setup lang="ts">
import { ref, computed } from 'vue'

// Note: This page can expand with invite/manage actions; see archived members mechanics for list + search patterns.
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'followers',
    label: 'Followers',
    icon: 'i-lucide-users',
    group: 'User',
    order: 5,
    desktop: false,
    mobile: true,
  },
  requiresAuth: true,
})

const q = ref('')
const members = ref([
  { id: 1, name: 'Alice Example', username: 'alice' },
  { id: 2, name: 'Bob Example', username: 'bob' },
])

const filtered = computed(() => {
  const r = new RegExp(q.value, 'i')
  return members.value.filter((m) => r.test(m.name) || r.test(m.username))
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UPageHeader
        title="Followers"
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
          label="Invite people"
          color="neutral"
          class="w-fit lg:ms-auto"
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
          <template v-if="filtered.length">
            <div
              v-for="m in filtered"
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
