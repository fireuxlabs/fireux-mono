<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="text-base font-medium">Current User</h3>
        </template>

        <div v-if="currentUser" class="text-sm">
          <p class="font-medium truncate">
            {{ currentUser }}
          </p>
          <p class="opacity-70 truncate">ID: {{ currentUser.id }}</p>
        </div>
        <p v-else class="opacity-70">No current user.</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">Users</h3>
            <UBadge variant="subtle">{{ usersCount }}</UBadge>
          </div>
        </template>

        <div v-if="usersCount" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="entry in usersList"
            :key="entry.id"
            class="cursor-default"
          >
            <p class="font-medium truncate">
              {{ entry.display_name || entry.id }}
            </p>
            <p class="opacity-70 truncate text-xs">ID: {{ entry.id }}</p>
          </UCard>
        </div>
        <p v-else class="opacity-70">No users found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../composables/firestore/core/user/useUser'

declare function definePageMeta(meta: any): void

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
})

const { user, collection } = useUser()

const currentUser = computed(() => user?.value ?? null)

const usersList = computed<any[]>(() => {
  const local = (collection?.local?.value as any[]) ?? null
  if (local) return local
  const global = (collection?.global?.value as any[]) ?? null
  if (global) return global
  return []
})

const usersCount = computed(() => usersList.value.length)
</script>
