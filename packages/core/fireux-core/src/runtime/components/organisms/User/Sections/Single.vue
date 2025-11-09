<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Sections/Single.vue -->
<template>
  <div>
    <UCard>
      <template #header>
        <h2>{{ headerTitle }}</h2>
      </template>

      <template v-if="current">
        <MoleculesPill v-if="corePill" v-bind="corePill" />
        <OrganismsUserCardsCell :user="current" :to="coreLink" />
      </template>

      <p v-else>{{ emptyMessage }}</p>
    </UCard>

    <OrganismsUserCardsProfile
      v-if="showExtended && profile"
      :user="profile"
    />
    <OrganismsUserSectionsSubcollection
      v-if="showExtended"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type { RouteLocationRaw } from 'vue-router'
import type { UserCard } from 'fireux-core/runtime/models/core/user.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

const props = withDefaults(
  defineProps<{ userId?: string | null; compact?: boolean }>(),
  {
    compact: true,
  }
)

const overrideId = computed(() => {
  const id = props.userId ? String(props.userId).trim() : ''
  return id.length ? id : null
})

const {
  coreUser: runtimeCoreUser,
  pillProps,
  profileProps,
} = useUser()

const overrideRefs = useUserFetch(overrideId)
const useOverride = computed(() => Boolean(overrideId.value))

const current = computed(() =>
  (useOverride.value ? overrideRefs.coreUser.value : runtimeCoreUser.value) ??
  null
)

const corePill = computed<Pill.Props | null>(() =>
  current.value ? { ...pillProps(current.value) } : null
)

const coreLink = computed<RouteLocationRaw | null>(() => {
  if (corePill.value?.to) return corePill.value.to
  const id = current.value?.id
  return id ? `/users/${id}` : null
})

const profile = computed<UserCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const showExtended = computed(() => !props.compact)

const headerTitle = computed(() =>
  useOverride.value ? 'User' : 'Signed-in User'
)

const emptyMessage = computed(() =>
  useOverride.value ? 'No user found.' : 'No signed-in user loaded.'
)
</script>