<template>
  <div>
    <div v-if="!create">
      <BusinessCreateSystem v-if="!businessId" @created="onBusinessReady" />
      <UAlert
        v-else
        color="success"
        variant="soft"
        title="Business ready"
        :description="businessId"
      >
        <template #actions>
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            @click="businessId = ''"
          >
            Choose another
          </UButton>
        </template>
      </UAlert>
    </div>

    <UFormField
      v-if="!create && businessId"
      label="Organization name"
      description="This becomes the Supplier identity and public web address."
      required
    >
      <UInput
        v-model="organizationName"
        autocomplete="organization"
        minlength="2"
        maxlength="120"
        placeholder="For example, Imkerei Familie Thöni"
      />
    </UFormField>

    <ul>
      <li>
        <UIcon name="i-lucide-badge-check" />
        <span>Create one canonical Supplier identity</span>
      </li>
      <li>
        <UIcon name="i-lucide-briefcase" />
        <span>Manage your business profile and brand</span>
      </li>
      <li>
        <UIcon name="i-lucide-sparkles" />
        <span>Open Supplier Items, Ingredients, Catalogue, and Team</span>
      </li>
    </ul>

    <div>
      <div>
        <UButton
          color="primary"
          size="lg"
          :loading="isCreating"
          :disabled="isCreating || (!create && !businessId)"
          @click="handleCreate"
        >
          {{ isCreating ? 'Creating…' : 'Create Supplier Workspace' }}
        </UButton>
        <UButton
          v-if="cancelTo"
          :to="cancelTo"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
        >
          Cancel
        </UButton>
      </div>
      <FireCopyError v-if="errorMessage" :message="errorMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useSupplierCreate } from '../../composables/firestore/mutations/useSupplierCreate'

const props = defineProps<{
  mode?: FireuxEntityCreateMode
  create?: (() => Promise<FireuxEntityCreateResult>) | undefined
  returnTo?: string
  cancelTo?: string
}>()

const emit = defineEmits<{
  (e: 'created', payload: FireuxEntityCreateResult): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const route = useRoute()
const { createSupplier, createSupplierWorkspace } = useSupplierCreate()
const { select } = useWorkspace('supplier')

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)
const organizationName = ref('')
const businessId = ref('')
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<FireuxEntityCreateMode>(
  () => props.mode ?? 'workspace'
)
const isWorkspaceMode = computed(() => resolvedMode.value === 'workspace')

function onBusinessReady(payload: { id: string }) {
  businessId.value = String(payload.id || '').trim()
}

const { currentUser } = useAuth()
const appSession = useAppSession()
const fireux = useFireUXConfig()
const scopeSources = [
  currentUser,
  appSession.appUser,
  () => fireux.appId,
  () => route.fullPath,
  resolvedMode,
  () => props.returnTo,
  () => props.create,
  organizationName,
  businessId,
]
const captureCommand = useCommandScope(scopeSources)
watch(
  scopeSources,
  () => {
    isCreating.value = false
    errorMessage.value = null
  },
  { flush: 'sync' }
)

const handleCreate = async () => {
  if (isCreating.value) return
  if (!props.create && !businessId.value) {
    errorMessage.value = 'Choose the Business this Supplier belongs to.'
    return
  }
  if (!props.create && organizationName.value.trim().length < 2) {
    errorMessage.value = 'Enter the supplier organization name.'
    return
  }

  const isCurrent = captureCommand()
  const workspaceMode = isWorkspaceMode.value
  const returnTo =
    props.returnTo ||
    (resolvedMode.value === 'root' ? '/suppliers' : '/workspace/supplier')
  const create =
    props.create ??
    (isWorkspaceMode.value ? createSupplierWorkspace : createSupplier)
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = props.create
      ? await create()
      : isWorkspaceMode.value
        ? await createSupplierWorkspace({
            organizationName: organizationName.value,
            businessId: businessId.value,
            isCurrent,
          })
        : await createSupplier({
            organizationName: organizationName.value,
            businessId: businessId.value,
            isCurrent,
          })
    if (!isCurrent()) return
    if (workspaceMode) {
      select(result.id)
    }
    emit('created', result)
    await router.push(returnTo)
  } catch (error) {
    if (!isCurrent()) return
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a supplier record right now.'
    errorMessage.value = message
    emit('error', error)
  } finally {
    if (isCurrent()) isCreating.value = false
  }
}
</script>
