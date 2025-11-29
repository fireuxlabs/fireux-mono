<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">User Directory</h2>
          <p class="text-xs text-gray-500">
            All users available to this runtime, resolved from
            <code>/users</code>.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UBadge variant="soft">{{ totalUsers }} total</UBadge>
          <UButton
            v-if="isTenant"
            size="xs"
            variant="ghost"
            @click="toggleGlobal()"
          >
            {{ showingGlobal ? 'Show tenant users' : 'Fetch global users' }}
          </UButton>
        </div>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <OrganismsUserCardsPill
        v-for="entry in directoryEntries"
        :key="entry.key"
        :user="entry.pill"
      />
    </div>

    <p v-else class="fx-section__empty">No users found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model.ts'

const { users, global, loadGlobalUsers } = useUserCollection()
const { pillProps } = useUserInterface()
const { isTenant } = useFireUXConfig()

const showingGlobal = ref(!isTenant)
if (showingGlobal.value) {
  loadGlobalUsers()
}

const toggleGlobal = () => {
  if (!showingGlobal.value) {
    loadGlobalUsers()
    showingGlobal.value = true
    return
  }
  showingGlobal.value = false
}

const visibleUsers = computed(() => {
  if (isTenant && showingGlobal.value) {
    return global.value ?? []
  }
  return users.value ?? []
})

type DirectoryEntry = { key: string; pill: UserCard.Pill }

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = visibleUsers.value
  if (!list.length) return []

  return list.map((entry: any) => {
    const base = pillProps(entry)
    const overlayRole = entry?.appUser?.role

    return {
      key: entry?.id ?? `${base.title}-${base.subtitle || ''}`,
      pill: {
        ...base,
        special: overlayRole === 'admin',
        specialIcon: 'i-lucide-star',
        specialTooltip: overlayRole === 'admin' ? 'App Admin' : undefined,
      },
    }
  })
})

const totalUsers = computed(() => visibleUsers.value.length)
</script>
