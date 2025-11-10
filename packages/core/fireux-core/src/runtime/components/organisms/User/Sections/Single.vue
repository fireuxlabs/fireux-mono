<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2>{{ headerTitle }}</h2>
        <p>{{ headerDescription }}</p>
      </template>

      <div v-if="current" class="space-y-4">
        <MoleculesPill v-if="currentPill" v-bind="currentPill" />
        <OrganismsUserCardsCell :user="current" :to="coreLink" />
      </div>

      <p v-else>No user loaded.</p>
    </UCard>

    <OrganismsUserCardsProfile v-if="showExtended && profile" :user="profile" />

    <OrganismsUserSectionsSubcollection v-if="showExtended" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const props = withDefaults(
  defineProps<{ user?: User | null; compact?: boolean }>(),
  { compact: true }
)

const { user: runtimeUser, pillProps, profileProps } = useUser()

const current = computed<User | null>(
  () => props.user ?? runtimeUser.value ?? null
)

const headerTitle = computed(() => current.value?.display_name ?? 'User')
const headerDescription = computed(() => {
  if (!current.value) return 'User details'
  const handle = current.value.handle?.trim()
  return handle ? `@${handle}` : '@unknown'
})

const currentPill = computed<Pill.Props | null>(() =>
  current.value ? { ...pillProps(current.value) } : null
)

const coreLink = computed<RouteLocationRaw | null>(() => {
  if (currentPill.value?.to) return currentPill.value.to
  const id = current.value?.id
  return id ? `/users/${id}` : null
})

const profile = computed<UserCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const showExtended = computed(() => !props.compact)
</script>
