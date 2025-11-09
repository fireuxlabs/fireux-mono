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
        <UBadge variant="soft">{{ totalUsers }} total</UBadge>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <MoleculesPill
        v-for="entry in directoryEntries"
        :key="entry.key"
        v-bind="entry.pill"
      />
    </div>

    <p v-else class="fx-section__empty">No users found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserInterface.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

const { users } = useUserCollection()
const { pillProps } = useUserInterface()

type DirectoryEntry = { key: string; pill: Pill.Props }

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = users.value ?? []
  if (!list.length) return []

  return list.map((entry: any) => {
    const base = pillProps(entry)
    const overlayRole = entry?.appUser?.role
    if (!overlayRole) {
      return {
        key: entry?.id ?? `${base.title}-${base.subtitle || ''}`,
        pill: base,
      }
    }

    const badges = new Set<string>((base.badges ?? []) as string[])
    badges.add(overlayRole === 'admin' ? 'App Admin' : 'App Member')

    return {
      key: entry?.id ?? `${base.title}-${base.subtitle || ''}`,
      pill: {
        ...base,
        badges: Array.from(badges),
      },
    }
  })
})

const totalUsers = computed(() => directoryEntries.value.length)
</script>
