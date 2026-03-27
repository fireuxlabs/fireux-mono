<template>
  <ConsoleEntityCTA
    title="Supplier console"
    entity="supplier"
    console-to="/console/supplier/overview"
    my-label="My Supplier Consoles"
    test-label=""
    read-only-label="Read-only Suppliers"
    learn-more-to="/suppliers/learn-more"
    :show-test="false"
  >
    <template #myNote>
      <li>Requires sign-in.</li>
      <li>Live supplier entry follows the current operator supplier identity for this app.</li>
      <li>{{ createActionNote }}</li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #my>
      <div class="space-y-2">
        <template v-if="isSignedIn">
          <SupplierCardsPill
            v-if="liveSupplierPill"
            v-bind="liveSupplierPill"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="goToSupplier('live', liveSupplierPill.id)"
          />

          <UButton
            v-else
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-plus"
            @click="createSupplier"
          >
            {{ createCopy.label }}
          </UButton>
        </template>
        <template v-else>
          <p class="text-sm text-dimmed">
            Sign in to see your supplier console and create one.
          </p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-log-in"
            @click="createSupplier"
          >
            {{ createCopy.label }}
          </UButton>
        </template>
      </div>
    </template>

    <template #readOnly>
      <div v-if="readOnlyPills.length" class="space-y-2">
        <SupplierCardsPill
          v-for="item in readOnlyPills"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="goToSupplier('read-only', item.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No read-only suppliers.
      </p>
    </template>

    <template #readOnlyNote>
      <li>Uses a selected read-only supplier scenario.</li>
      <li>Available without sign-in.</li>
      <li>Scenarios do not require live supplier console authority.</li>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Supplier operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { resolveConsoleCreateCopy } from 'fireux-core/runtime/composables/fireux/app/ui/console-create-copy'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { getReadOnlySupplierScenarioList } from '../../composables/fireux/app/supplier-console/read-only-scenarios'
import type { RuntimeSupplierMode } from '../../composables/fireux/app/supplier-console/state'
import { useRuntimeSupplierSelection } from '../../composables/fireux/app/supplier-console/state'
import { useSupplierInterface } from '../../composables/supplier/useSupplierInterface'
import { useSupplierRecord } from '../../composables/supplier/useSupplierRecord'
import SupplierCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const route = useRoute()
const router = useRouter()
const { uid } = useAuth()
const { setRuntimeSupplier } = useRuntimeSupplierSelection()
const supplierRecord = useSupplierRecord(computed(() => String(uid.value || '').trim()))
const { pill: supplierPill } = useSupplierInterface(supplierRecord)
const isSignedIn = computed(() => Boolean(String(uid.value || '').trim()))
const createCopy = computed(() =>
  resolveConsoleCreateCopy({
    entityLabel: 'supplier',
    createSurface: props.createSurface,
    signedIn: isSignedIn.value,
    publicPath: '/suppliers/create',
    consolePath: '/console/supplier/create',
  })
)
const signInPath = computed(() => `/auth?redirect=${encodeURIComponent(route.fullPath)}`)
const createActionNote = computed(() => createCopy.value.note)
const createActionMeaning = computed(() => createCopy.value.meaning)

const liveSupplierPill = computed(() => supplierPill())

const readOnlyPills = computed(() =>
  getReadOnlySupplierScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      to: '',
      title: String(entry.name || '').trim(),
      subtitle: String(entry.label || '').trim(),
      imageUrl: String(entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const goToSupplier = async (mode: RuntimeSupplierMode, supplierId?: string) => {
  if (mode === 'live' && !isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  const resolvedId = String(supplierId || uid.value || '').trim()
  setRuntimeSupplier({ supplierId: resolvedId, mode })
  await router.push('/console/supplier/overview')
}

const createSupplier = async () => {
  if (!isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  await router.push(createCopy.value.createPath)
}
</script>
