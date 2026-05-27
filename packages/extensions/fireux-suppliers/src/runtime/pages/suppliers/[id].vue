<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
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
          @click="navigateTo('/console/supplier')"
        >
          Manage supplier
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <div class="supplier-page">
          <div v-if="loading" class="py-10 text-sm opacity-70">
            Loading supplier…
          </div>

          <div v-else-if="!supplierRecord" class="space-y-2">
            <MoleculesProfilesAdminCreateCard
              v-if="isAdminUser"
              title="Supplier not available"
              description="Create a supplier record for this user."
              :button-label="supplierCreateCta"
              :loading="isCreating"
              :error="createError"
              @create="createSupplier"
            />

            <div v-else>
              <h1 class="text-lg font-semibold">Supplier Not Found</h1>
              <p>The supplier you're looking for doesn't exist.</p>
              <NuxtLink to="/suppliers" class="text-primary hover:underline"
                >← Back</NuxtLink
              >
            </div>
          </div>

          <div v-else class="space-y-4">
            <SupplierCardsProfile v-if="supplierCard" :card="supplierCard" />

            <DevJson
              v-if="isDev && supplierRecord"
              :title="'Supplier (Doc)'"
              context="Supplier detail page · suppliers/[id] · supplier doc"
              :data="supplierRecord"
              :default-open="false"
            />
          </div>
        </div>

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading supplier…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref } from 'vue'
import { useSupplierEnsure } from '../../composables/fireux/firestore/supplier/mutations/useSupplierEnsure'
import { useSupplierSeo } from '../../composables/fireux/firestore/supplier/utils/useSupplierSeo'
import { useSupplierInterface } from '../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const supplierCollection = 'suppliers'
const supplierCreateCta =
  'Create your supplier workspace record to appear in listings.'

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? raw[0] : String(raw || '')

const { user, coreUser, appUser } = useUser()

const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc(supplierCollection, docId) : null
const supplierRecord = computed<any>(
  () => (rawDoc as any)?.value ?? rawDoc ?? null
)
const loading = computed(() => !rawDoc && !!docId)
const { profile: supplierToProfile } = useSupplierInterface()
const supplierCard = computed(() => supplierToProfile(supplierRecord.value))

const displayName = computed(() =>
  supplierCard.value?.title || docId || null
)
const pageTitle = computed(() => displayName.value ?? 'Supplier')
const pageDescription = computed(() =>
  displayName.value
    ? `Review the public supplier record for ${displayName.value}.`
    : 'Public supplier record.'
)
const isDev = import.meta.dev

useSupplierSeo(supplierRecord)

const isSelf = computed(() => Boolean(docId && user.value?.id === docId))

const isAdminUser = computed(
  () => appUser.value?.role === 'admin'
)

const { ensure } = useSupplierEnsure()
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createSupplier = async () => {
  if (isCreating.value || !docId) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(docId)
  } catch (error) {
    createError.value =
      (error as Error)?.message || 'Failed to create supplier record.'
  } finally {
    isCreating.value = false
  }
}
</script>
