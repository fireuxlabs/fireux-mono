<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <template v-if="showUserCta">
      <OrganismsUserCTA />
    </template>

    <template v-else>
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2>{{ headerTitle }}</h2>
              <p>{{ headerDescription }}</p>
            </div>
            <UButton
              v-if="current"
              size="xs"
              variant="ghost"
              @click="toggleView"
            >
              {{ showCellView ? 'Show Pill' : 'Show Cell' }}
            </UButton>
          </div>
        </template>

        <div v-if="current" class="space-y-4">
          <OrganismsUserCardsPill
            v-if="!showCellView && currentPill"
            :user="currentPill"
          />
          <OrganismsUserCardsCell v-else-if="currentCell" :user="currentCell" />
        </div>

        <p v-else>No user loaded.</p>
      </UCard>

      <OrganismsUserCardsProfile
        v-if="showExtended && currentProfile"
        :user="currentProfile"
      />

      <OrganismsUserSectionsSubcollection v-if="showExtended" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const { user: runtimeUser, pillProps, cellProps, profileProps, cta } = useUser()
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

const currentPill = computed<UserCard.Pill | null>(() =>
  current.value ? { ...pillProps(current.value) } : null
)

const currentCell = computed<UserCard.Cell | null>(() => {
  if (!current.value) return null
  return cellProps(current.value)
})

const currentProfile = computed<UserCard.Profile | null>(() => {
  if (!current.value) return null
  return profileProps(current.value)
})

const showExtended = computed(() => !props.compact)

const showUserCta = computed(() => (cta.value?.key ?? 'avatar') !== 'avatar')

const showCellView = ref(false)
const toggleView = () => {
  showCellView.value = !showCellView.value
}
</script>
