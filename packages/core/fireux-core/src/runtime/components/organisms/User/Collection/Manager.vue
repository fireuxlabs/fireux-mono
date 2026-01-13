<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Users</h2>
          <p class="text-xs text-gray-500">
            {{ scopeCopy }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search users…"
            class="w-44"
          />

          <UButton
            v-if="isTenant"
            size="xs"
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{ showGlobalDirectory ? 'Hide global directory' : 'View global directory' }}
          </UButton>

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <template v-if="!isTenant || showGlobalDirectory">
      <OrganismsUserCollectionList
        v-if="cards.length"
        :cards="cards"
        :variant="variant"
      />

      <p v-else class="fx-section__empty">
        {{ query ? 'No users match your search.' : 'No users found.' }}
      </p>
    </template>

    <p v-else class="fx-section__empty">Global directory hidden.</p>

    <component
      :is="DevJson"
      v-if="devMode && DevJson"
      class="mt-3"
      title="Dev · User Collection Manager"
      :data="devPayload"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { useGlobalUserCollection } from '../../../../composables/fireux/firestore/core/user/fetch/useGlobalUserCollection'
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { User } from '../../../../models/core/user.model'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const DevJson = defineAsyncComponent(() =>
  import('../../../../components/dev/DevJson.vue')
)

const { appId, appName, ecosystem, isTenant, devMode } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)
const { users, count: totalCount } = useGlobalUserCollection()
const { card, searchText } = useUserInterface()

const scopeCopy = computed(() => {
  if (isTenant) return `Browse users available to ${appName}.`
  return `Browse users in the ${ecosystem} ecosystem directory.`
})

const query = ref('')

type Variant = 'pill' | 'cell'

const variant = ref<Variant>('pill')
const toggleVariant = () => {
  if (variant.value === 'pill') variant.value = 'cell'
  else variant.value = 'pill'
}

type DirectoryEntry = {
  key: string
  card: UserCard.Card
  raw: User
}

const inferRole = (entry: User): 'admin' | 'user' | undefined => {
  const activeAppId = appId?.trim()
  if (!activeAppId) return undefined
  if (Array.isArray(entry.adminOf) && entry.adminOf.some((id) => id === activeAppId)) return 'admin'
  if (Array.isArray(entry.userOf) && entry.userOf.some((id) => id === activeAppId)) return 'user'
  return undefined
}

const normalizedUsers = computed<User[]>(() => users.value ?? [])

const visibleUsers = computed<User[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return normalizedUsers.value

  return normalizedUsers.value.filter((user) => searchText(user).includes(q))
})

const visibleCount = computed(() => visibleUsers.value.length)

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = visibleUsers.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is User => Boolean((entry as User | undefined)?.id))
    .map((entry: User) => {
      const role = inferRole(entry)

      const payload = card(entry)
      if (!payload) return null
      const badges = role === 'admin' ? ['Admin'] : []

      return {
        key: entry.id,
        card: { ...payload, badges },
        raw: entry,
      }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const cards = computed(() => directoryEntries.value.map((entry) => entry.card))

const devPayload = computed(() => ({
  variant: variant.value,
  query: query.value,
  isTenant,
  showGlobalDirectory: showGlobalDirectory.value,
  totalCount: totalCount.value,
  visibleCount: visibleCount.value,
  scopeCopy: scopeCopy.value,
  users: normalizedUsers.value,
  visible: visibleUsers.value,
  cards: cards.value,
}))
</script>
