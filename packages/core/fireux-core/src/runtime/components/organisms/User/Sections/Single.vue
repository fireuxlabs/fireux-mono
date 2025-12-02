<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <template v-if="showUserCta">
      <OrganismsUserCTA />
    </template>

    <template v-else>
      <UCard>
        <template #header>
          <h2>{{ headerTitle }}</h2>
          <p>{{ headerDescription }}</p>
        </template>

        <div v-if="current" class="space-y-4">
          <OrganismsUserCardsPill v-if="currentPill" :user="currentPill" />
          <OrganismsUserCardsCell
            v-if="currentCell"
            :user="currentCell"
            :to="coreLink"
          />
        </div>

        <p v-else>No user loaded.</p>
      </UCard>

      <OrganismsUserCardsProfile
        v-if="showExtended && profile"
        :user="profile"
      />

      <OrganismsUserSectionsSubcollection v-if="showExtended" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

const props = withDefaults(
  defineProps<{ user?: User | null; compact?: boolean }>(),
  { compact: true }
)

const { user: runtimeUser, pillProps, cta } = useUser()
const { isTenant } = useFireUXConfig()

const current = computed<User | null>(
  () => props.user ?? runtimeUser.value ?? null
)

const headerTitle = computed(() => current.value?.display_name ?? 'User')
const headerDescription = computed(() => {
  if (!current.value) return 'User details'
  const handle = current.value.handle?.trim()
  return handle ? `@${handle}` : '@unknown'
})

const toCell = (user: User, pill: UserCard.Pill): UserCard.Cell => {
  const role = (user.appUser?.role ?? user.role)?.trim().toLowerCase()
  return {
    ...pill,
    id: user.id ?? '-',
    profiles: [...(pill.badges ?? [])],
    role: role || '-',
    memberships: pill.memberships ?? [],
  }
}

const currentPill = computed<UserCard.Pill | null>(() =>
  current.value ? { ...pillProps(current.value) } : null
)

const currentCell = computed<UserCard.Cell | null>(() => {
  if (!current.value) return null
  const pill = pillProps(current.value)
  return pill ? toCell(current.value, pill) : null
})

const coreLink = computed<RouteLocationRaw | null>(() => {
  if (currentPill.value?.to) return currentPill.value.to
  const id = current.value?.id
  return id ? `/users/${id}` : null
})

const profile = computed<User | null>(() => current.value)

const showExtended = computed(() => !props.compact)

const showUserCta = computed(() => (cta.value?.key ?? 'avatar') !== 'avatar')
</script>
