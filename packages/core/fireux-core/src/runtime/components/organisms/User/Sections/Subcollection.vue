<template>
  <UCard v-if="isTenant" class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">{{ tenantTitle }}</h2>
          <p class="text-xs text-gray-500">{{ tenantDescription }}</p>
        </div>
        <UBadge variant="soft">{{ tenantBadgeLabel }}</UBadge>
      </div>
    </template>

    <div v-if="tenantEntries.length" class="fx-section__grid">
      <div v-for="entry in tenantEntries" :key="entry.key" class="space-y-2">
        <OrganismsUserCardsPill :user="entry.pill" :show-memberships="false" />
      </div>
    </div>

    <p v-else class="fx-section__empty">
      No tenant app users discovered for this runtime.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/firestore/core/user/state/useUserInterface.ts'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'

const { isTenant, appName } = useFireUXConfig()
const { users } = useUserCollection()
const { pillProps } = useUserInterface()

type TenantEntry = {
  key: string
  pill: UserCard.Pill
  role: string | null
  raw: User
}

const tenantEntries = computed((): TenantEntry[] => {
  if (!isTenant) return []
  const list = users.value ?? []
  if (!list.length) return []

  return list
    .map((entry: any) => {
      if (!entry?.id) return null
      const source = entry?.coreUser ?? entry
      const enriched = { ...(source as User), appUser: entry?.appUser }
      const pill = pillProps(enriched as any)

      return {
        key: entry.id,
        pill: pill as UserCard.Pill,
        role:
          typeof entry?.appUser?.role === 'string' ? entry.appUser.role : null,
        raw: enriched as User,
      }
    })
    .filter((entry): entry is TenantEntry => Boolean(entry))
})

const tenantTitle = computed(() => {
  const name = appName?.trim()
  return name ? `${name} Users` : 'Tenant Users'
})

const tenantDescription = computed(
  () => 'Streaming /apps/{app}/users memberships with their core profiles.'
)

const tenantBadgeLabel = computed(() => {
  const count = tenantEntries.value.length
  const suffix = count === 1 ? 'user' : 'users'
  const tenant = appName?.trim()
  return tenant ? `${count} ${suffix} · ${tenant}` : `${count} ${suffix}`
})
</script>
