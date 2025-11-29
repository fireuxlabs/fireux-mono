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
            @click="toggleScope()"
          >
            {{ showingCore ? 'Show app users' : 'Show core users' }}
          </UButton>
        </div>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <div v-for="entry in directoryEntries" :key="entry.key">
        <OrganismsUserCardsPill :user="entry.pill" />
      </div>
    </div>

    <p v-else class="fx-section__empty">No users found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/firestore/core/user/state/useUserInterface.ts'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model.ts'

const { users, global, loadGlobalUsers } = useUserCollection()
const { pillProps } = useUserInterface()
const { isTenant } = useFireUXConfig()

const showingCore = ref(!isTenant)
if (showingCore.value) {
  loadGlobalUsers()
}

const toggleScope = () => {
  if (!showingCore.value) {
    loadGlobalUsers()
    showingCore.value = true
    return
  }
  showingCore.value = false
}

const visibleUsers = computed(() => {
  if (isTenant && showingCore.value) {
    return global.value ?? []
  }
  return users.value ?? []
})

type DirectoryEntry = { key: string; pill: UserCard.Pill }

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = visibleUsers.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: any) => Boolean(entry?.id))
    .map((entry: any) => {
      const baseUser = entry?.coreUser ?? entry
      const pill = pillProps(baseUser)
      const appRole = entry?.appUser?.role
      const pillWithRole: UserCard.Pill = {
        ...pill,
        special: appRole === 'admin',
        specialIcon: appRole === 'admin' ? 'i-lucide-star' : undefined,
        specialTooltip: appRole === 'admin' ? 'App Admin' : undefined,
      }

      return {
        key: entry.id,
        pill: pillWithRole,
      }
    })
})

const totalUsers = computed(() => visibleUsers.value.length)
</script>
