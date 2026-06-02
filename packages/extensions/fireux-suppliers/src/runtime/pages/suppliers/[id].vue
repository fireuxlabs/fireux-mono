<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription">
      <template #links>
        <UButton
          v-if="supplierRecord && isAdminUser && docId"
          icon="i-lucide-key-round"
          size="xs"
          color="primary"
          variant="solid"
          :to="`/suppliers/${docId}/operator`"
        >
          Operator
        </UButton>
        <UButton
          v-if="supplierRecord && isSelf"
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="soft"
          to="/console/supplier"
        >
          Manage supplier
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading supplier"
        description="Fetching this supplier."
      />

      <MoleculesProfilesAdminCreateCard
        v-else-if="!supplierRecord && isAdminUser"
        title="Supplier not available"
        description="Create a supplier record for this user."
        :button-label="supplierCreateCta"
        :loading="isCreating"
        :error="createError"
        @create="createSupplier"
      />

      <UAlert
        v-else-if="!supplierRecord"
        color="warning"
        variant="soft"
        title="Supplier not found"
        description="This supplier is not available."
      />

      <template v-else>
        <SupplierCardsProfile v-if="supplierCard" :card="supplierCard" />

        <DevJson
          v-if="isDev"
          :title="'Supplier (JSON)'"
          context="Supplier detail page · suppliers/[id] · supplier doc"
          :data="supplierRecord"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useSupplierFetch } from '../../composables/fireux/firestore/supplier/fetch/useSupplierFetch'
import { useSupplierCreate } from '../../composables/fireux/firestore/supplier/mutations/useSupplierCreate'
import { useSupplierSeo } from '../../composables/fireux/firestore/supplier/utils/useSupplierSeo'
import { useSupplierInterface } from '../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const supplierCreateCta =
  'Create your supplier workspace record to appear in listings.'

const route = useRoute()
const docId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})

const { user, appUser } = useUser()
const { supplier: supplierRecord, pending } = useSupplierFetch(docId)
const { profile: supplierToProfile } = useSupplierInterface()
const supplierCard = computed(() => supplierToProfile(supplierRecord.value))

const displayName = computed(() =>
  supplierCard.value?.title || docId.value || null
)
const pageTitle = computed(() => displayName.value ?? 'Supplier')
const pageDescription = computed(() =>
  displayName.value
    ? `Review the public supplier record for ${displayName.value}.`
    : 'Public supplier record.'
)
const isDev = import.meta.dev

useSupplierSeo(supplierRecord)

const isSelf = computed(() => Boolean(docId.value && user.value?.id === docId.value))

const isAdminUser = computed(
  () => appUser.value?.role === 'admin'
)

const { createSupplierConsole } = useSupplierCreate()
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createSupplier = async () => {
  if (isCreating.value || !docId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await createSupplierConsole({
      existingRootId: docId.value,
      mode: 'console',
    })
  } catch (error) {
    createError.value =
      (error as Error)?.message || 'Failed to create supplier record.'
  } finally {
    isCreating.value = false
  }
}
</script>
