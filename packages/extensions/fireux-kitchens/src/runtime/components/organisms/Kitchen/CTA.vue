<template>
  <ConsoleEntityCTA
    title="Kitchen console"
    my-label="My Kitchens"
    test-label="Test Kitchen"
    read-only-label="Read-only Kitchens"
    learn-more-to="/kitchens/learn-more"
  >
    <template #my>
          <div class="space-y-2">
            <KitchenCardsPill
              v-if="liveKitchenPills.length"
              v-for="item in liveKitchenPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('live', item.id)"
            />
            <UButton
              block
              variant="subtle"
              color="primary"
              icon="i-lucide-plus"
              :loading="isEnsuringLiveKitchen"
              @click="createKitchen"
            >
              Create kitchen
            </UButton>
          </div>
    </template>

    <template #test>
          <KitchenCardsPill
            v-bind="testKitchenPill"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="goToKitchen('test')"
          />
    </template>

    <template #readOnly>
          <div v-if="readOnlyPills.length" class="space-y-2">
            <KitchenCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only kitchens.
          </p>
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
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { computed, ref } from 'vue'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { getReadOnlyKitchenScenarioList } from '../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'
import type { RuntimeKitchenMode } from '../../../composables/fireux/app/kitchen-runtime/shared'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useChefCreate } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import KitchenCardsPill from './Cards/Pill.vue'

const { kitchens } = useKitchenFetch()
const { pill: kitchenPill } = useKitchenInterface()
const { currentUser, avatarSrc } = useUser()

const testChefName = computed(() => String(currentUser.value?.display_name || '').trim())

const testKitchenTitle = computed(() => {
  const name = testChefName.value
  if (!name) return 'Test Kitchen'
  return /s$/i.test(name) ? `${name}' Test Kitchen` : `${name}'s Test Kitchen`
})

const testKitchenPill = computed(() => ({
  id: 'test-kitchen',
  to: '',
  title: testKitchenTitle.value,
  subtitle: 'Experimental kitchen stack',
  imageUrl: avatarSrc.value || '',
}))

const liveKitchenPills = computed(() =>
  (kitchens.value ?? [])
    .map((entry) => kitchenPill(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const readOnlyScenarios = computed(() =>
  getReadOnlyKitchenScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.address_label || '').trim(),
      imageUrl: String(entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const readOnlyPills = computed(() =>
  readOnlyScenarios.value.map((entry) => ({
    id: entry.id,
    to: '',
    title: entry.name,
    subtitle: entry.subtitle,
    imageUrl: entry.imageUrl,
  }))
)

const router = useRouter()
const route = useRoute()
const { runtimeKitchenId, setRuntimeKitchen } = useRuntimeKitchenSelection()
const { ensureChef } = useChefCreate()
const isEnsuringLiveKitchen = ref(false)

const ensureLiveKitchenProfile = async () => {
  if (isEnsuringLiveKitchen.value) return false
  isEnsuringLiveKitchen.value = true

  try {
    await ensureChef()
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? '')

    if (message.includes('[ensure] Missing authenticated user')) {
      await router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
      return false
    }

    if (import.meta.dev) {
      console.error('[KitchenCTA] failed to ensure chef profile before live kitchen entry', error)
    }
    return false
  } finally {
    isEnsuringLiveKitchen.value = false
  }
}

const goToKitchen = async (mode: RuntimeKitchenMode, kitchenId?: string) => {
  if (mode === 'live') {
    const ready = await ensureLiveKitchenProfile()
    if (!ready) return
  }

  const fallback = String(runtimeKitchenId.value || '').trim()
  const resolvedId = String(kitchenId || fallback).trim()
  setRuntimeKitchen({ mode, kitchenId: resolvedId })
  await router.push('/console/kitchen/overview')
}

const createKitchen = async () => {
  const ready = await ensureLiveKitchenProfile()
  if (!ready) return
  await router.push('/kitchens/create')
}

</script>
