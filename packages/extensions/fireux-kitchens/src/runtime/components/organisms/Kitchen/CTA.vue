<template>
  <UPageCTA
    class="cta"
    title="Kitchen dashboard"
    description="Use your test kitchen to open the dashboard or learn more about kitchens."
    variant="soft"
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-4">
        <div class="space-y-3">
          <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">Test Kitchen</p>
          <KitchenCardsPill
            v-bind="testKitchenPill"
            :show-badges="false"
          />
          <UButton
            size="sm"
            variant="subtle"
            color="neutral"
            :disabled="!testKitchenId"
            trailing-icon="i-lucide-arrow-right"
            @click="goToKitchen('test', testKitchenId)"
          >
            go to dash
          </UButton>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">Dummy Kitchen</p>
          <KitchenCardsPill
            v-bind="dummyKitchenPill"
            :show-badges="false"
          />
          <UButton
            size="sm"
            variant="subtle"
            color="neutral"
            :disabled="!dummyKitchenId"
            trailing-icon="i-lucide-arrow-right"
            @click="goToKitchen('dummy', dummyKitchenId)"
          >
            go to dash
          </UButton>
        </div>
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
import { computed } from 'vue'
import { dummyKitchenHydrated } from '../../../../../../../../dummy/kitchen.dummy'
import { useRuntimeKitchenSelection, type RuntimeKitchenMode } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

const testKitchen = {
  id: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
  name: "Daniel's Test Kitchen",
  image_url:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80',
  is_test_kitchen: true,
}

const testKitchenId = testKitchen.id
const testKitchenTitle = testKitchen.name
const testKitchenImageUrl = testKitchen.image_url

const testKitchenPill = computed(() => ({
  to: '',
  imageUrl: testKitchenImageUrl,
  title: testKitchenTitle,
  subtitle: 'Test kitchen',
  badges: [],
}))

const router = useRouter()
const { setRuntimeKitchen } = useRuntimeKitchenSelection()

const goToKitchen = async (mode: RuntimeKitchenMode, kitchenId?: string) => {
  const resolvedId = String(kitchenId ?? '').trim()
  setRuntimeKitchen({ mode, kitchenId: resolvedId })
  await router.push('/dashboard/kitchen')
}

const dummyKitchenId = String(dummyKitchenHydrated?.id || '').trim()
const dummyKitchenTitle = String(dummyKitchenHydrated?.name || 'Dummy kitchen')
const dummyKitchenImageUrl =
  String(dummyKitchenHydrated?.image_url || testKitchenImageUrl)

const dummyKitchenPill = computed(() => ({
  to: '',
  imageUrl: dummyKitchenImageUrl,
  title: dummyKitchenTitle,
  subtitle: 'Dummy kitchen',
  badges: [],
}))

</script>
