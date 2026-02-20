<template>
  <UPageCTA
    title="Kitchen dashboard"
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">My Kitchens</p>
          <div v-if="myKitchenPills.length" class="space-y-2">
            <KitchenCardsPill
              v-for="kitchen in myKitchenPills"
              :key="kitchen.id"
              v-bind="kitchen"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('live', kitchen.id)"
            />
          </div>
          <div v-else class="space-y-2">
            <p class="text-sm text-dimmed">
              No kitchens linked to your chef profile yet.
            </p>
            <UButton to="/kitchens/create" size="sm" variant="subtle" icon="i-lucide-plus">
              Create kitchen
            </UButton>
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Test Kitchen</p>
          <KitchenCardsPill
            v-if="testKitchenPill"
            v-bind="testKitchenPill"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="goToKitchen('test', testKitchenId)"
          />
          <p v-else class="text-sm text-dimmed">
            No test kitchen available.
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Read-only Kitchens</p>
          <div v-if="simulationPills.length" class="space-y-2">
            <KitchenCardsPill
              v-for="kitchen in simulationPills"
              :key="kitchen.id"
              v-bind="kitchen"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('read-only', kitchen.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only kitchens loaded.
          </p>
        </section>
      </div>
    </template>
    <template #default>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Kitchen"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { getReadOnlyKitchenScenarioList } from '../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'
import { useRuntimeKitchenSelection, type RuntimeKitchenMode } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import type { Kitchen } from '../../../models/kitchen.model'
import KitchenCardsPill from './Cards/Pill.vue'

const { uid } = useAuth()
const { user } = useUser()
const { coreProfile } = useChef()
const { kitchens } = useKitchenFetch()
const { kitchens: testKitchens } = useKitchenFetch({
  collectionPath: 'test-kitchens',
  hydrate: false,
})

const currentUserId = computed(() => String(uid.value || '').trim())

const testKitchenLabel = computed(() => {
  const displayName = String((user.value as any)?.display_name || '').trim()
  const firstWord = String(displayName.split(/\s+/).filter(Boolean)[0] || '').trim()
  if (!firstWord) return 'Test Kitchen'
  const suffix = /s$/i.test(firstWord) ? "'" : "'s"
  return `${firstWord}${suffix} Test Kitchen`
})

const kitchenById = computed(() => {
  const map = new Map<string, Kitchen>()
  for (const kitchen of kitchens.value ?? []) {
    const id = String(kitchen.id || '').trim()
    if (!id) continue
    map.set(id, kitchen)
  }
  return map
})

const chefKitchenIds = computed(() => {
  const testKitchenId = currentUserId.value
  const ids = Array.isArray(coreProfile.value?.kitchen_ids)
    ? coreProfile.value.kitchen_ids
    : []

  return Array.from(
    new Set(
      ids
        .map((value: unknown) => String(value || '').trim())
        .filter(Boolean)
        .filter((id: string) => id !== testKitchenId)
    )
  )
})

const claimedKitchenIds = computed(() => {
  const userId = currentUserId.value
  if (!userId) return [] as string[]

  return (kitchens.value ?? [])
    .filter((kitchen) => String((kitchen as any)?.claimed_by || '').trim() === userId)
    .map((kitchen) => String(kitchen.id || '').trim())
    .filter(Boolean)
})

const myKitchenIds = computed(() =>
  Array.from(new Set([...chefKitchenIds.value, ...claimedKitchenIds.value]))
)

const myKitchens = computed(() =>
  myKitchenIds.value
    .map((id) => kitchenById.value.get(id))
    .filter(Boolean) as Kitchen[]
)

const myKitchenIdSet = computed(() =>
  new Set(myKitchens.value.map((kitchen) => String(kitchen.id || '').trim()).filter(Boolean))
)

const readOnlyKitchens = computed(() =>
  getReadOnlyKitchenScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      short_name: String(entry.name || '').trim(),
      short_address: String(entry.address_label || '').trim(),
      formatted_address: String(entry.address_label || '').trim(),
      image_url: String(entry.image_url || '').trim(),
    }))
    .filter((kitchen) => Boolean(kitchen.id))
    .filter((kitchen) => !myKitchenIdSet.value.has(String(kitchen.id || '').trim())) as Kitchen[]
)

const testKitchen = computed<Kitchen | null>(() => {
  const userId = currentUserId.value
  if (!userId) return null

  const fromCollection = (testKitchens.value ?? []).find(
    (kitchen) => String(kitchen.id || '').trim() === userId
  )

  if (fromCollection) {
    return {
      ...fromCollection,
      id: userId,
      is_test_kitchen: true,
      name: testKitchenLabel.value,
      short_name: testKitchenLabel.value,
      short_address: String(fromCollection.short_address || '').trim(),
      formatted_address: String(fromCollection.formatted_address || '').trim(),
      image_url: String(fromCollection.image_url || '').trim(),
    }
  }

  return {
    id: userId,
    is_test_kitchen: true,
    name: testKitchenLabel.value,
    short_name: testKitchenLabel.value,
    short_address: '',
    formatted_address: '',
    image_url: '',
  } as Kitchen
})

const testKitchenId = computed(() =>
  String(testKitchen.value?.id || '').trim()
)
const { pill } = useKitchenInterface()
type KitchenPillCard = NonNullable<ReturnType<typeof pill>>
const isKitchenPill = (value: ReturnType<typeof pill>): value is KitchenPillCard => Boolean(value)

const myKitchenPills = computed(() =>
  (myKitchens.value ?? [])
    .map((kitchen) => pill(kitchen))
    .filter(isKitchenPill)
)

const testKitchenPill = computed(() => pill(testKitchen.value))

const simulationPills = computed(() =>
  (readOnlyKitchens.value ?? [])
    .map((kitchen) => pill(kitchen))
    .filter(isKitchenPill)
)

const router = useRouter()
const { setRuntimeKitchen } = useRuntimeKitchenSelection()

const goToKitchen = async (mode: RuntimeKitchenMode, kitchenId?: string) => {
  const resolvedId = String(kitchenId ?? '').trim()
  setRuntimeKitchen({ mode, kitchenId: resolvedId })
  await router.push('/dashboard/kitchen')
}

</script>
