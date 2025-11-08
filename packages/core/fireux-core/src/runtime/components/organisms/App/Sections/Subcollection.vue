<template>
  <UCard v-if="isTenant" class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Subcollections</h2>
          <p class="text-xs text-gray-500">
            Tenant-scoped overlays associated with this app.
          </p>
        </div>
        <UBadge variant="soft">{{ totalEntries }} item(s)</UBadge>
      </div>
    </template>

    <template v-if="subcollections.length">
      <div class="fx-section__grid">
        <section
          v-for="section in subcollections"
          :key="section.key"
          class="fx-section__item"
        >
          <h3 class="fx-section__label font-semibold">{{ section.title }}</h3>
          <div v-if="section.pills.length" class="fx-section__grid">
            <MoleculesPill
              v-for="pill in section.pills"
              :key="pill.title + (pill.subtitle || '')"
              v-bind="pill"
            />
          </div>
          <p v-else class="fx-section__empty">No entries found.</p>
        </section>
      </div>
    </template>
    <p v-else class="fx-section__empty">No subcollections available yet.</p>
  </UCard>
</template>

<script setup lang="ts">
/**
 * Subcollections · Job Plan
 * 1) ✅ List 'users' subcollection as Pills (no guards, no extras)
 * 2) (later) Add role badges, counts, and empty/tenant states
 * 3) (later) Support additional subcollections (roles, invites, etc.)
 * 4) (later) Loading skeletons + pagination
 */

import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserInterface.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts'

const props = defineProps<{ appId?: string | null }>()

const { isTenant, appId: configAppId } = useFireUXConfig()
const targetAppId = props.appId ?? configAppId ?? null
const { appUsers } = useAppUsers(targetAppId)
const { pillProps } = useUserInterface()

// shape the subcollection entries into pill props
const memberPills = computed(() => {
  if (!isTenant) return []

  const entries = appUsers?.value ?? []
  return entries.map((entry: any) => pillProps(entry))
})

const subcollections = computed(() => {
  if (!isTenant) return []

  return [
    {
      key: 'users',
      title: 'App Users',
      pills: memberPills.value,
    },
  ]
})

const totalEntries = computed(() =>
  subcollections.value.reduce(
    (total, section) => total + section.pills.length,
    0
  )
)
</script>
