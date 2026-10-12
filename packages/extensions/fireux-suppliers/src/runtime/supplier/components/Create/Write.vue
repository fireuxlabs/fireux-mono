<template>
  <div class="space-y-6">
    <div v-if="!create" class="space-y-3">
      <CompanyCreateSystem v-if="!companyId" @created="onCompanyReady" />
      <UAlert
        v-else
        color="success"
        variant="soft"
        title="Company ready"
        :description="companyId"
      >
        <template #actions>
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            @click="companyId = ''"
          >
            Choose another
          </UButton>
        </template>
      </UAlert>
    </div>

    <UFormField
      v-if="!create && companyId"
      label="Organization name"
      description="This becomes the Supplier identity and public web address."
      required
    >
      <UInput
        v-model="organizationName"
        class="w-full"
        autocomplete="organization"
        minlength="2"
        maxlength="120"
        placeholder="For example, Imkerei Familie Thöni"
      />
    </UFormField>

    <ul class="grid gap-3">
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-badge-check" />
        <span>Create one canonical Supplier identity</span>
      </li>
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-briefcase" />
        <span>Manage your business profile and brand</span>
      </li>
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-sparkles" />
        <span>Open Supplier Items, Ingredients, Catalogue, and Team</span>
      </li>
    </ul>

    <div class="space-y-2">
      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          size="lg"
          class="min-w-60"
          :loading="isCreating"
          :disabled="isCreating || (!create && !companyId)"
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
      <MoleculesCopyError v-if="errorMessage" :message="errorMessage" />
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
import { useSupplierWorkspaceSelection } from '../../composables/workspace/useSupplierWorkspaceSelection'
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
const { setSupplierWorkspaceSelection } = useSupplierWorkspaceSelection()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)
const organizationName = ref('')
const companyId = ref('')
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<FireuxEntityCreateMode>(
  () => props.mode ?? 'workspace'
)
const isWorkspaceMode = computed(() => resolvedMode.value === 'workspace')

function onCompanyReady(payload: { id: string }) {
  companyId.value = String(payload.id || '').trim()
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
  companyId,
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
  if (!props.create && !companyId.value) {
    errorMessage.value = 'Choose the Company this Supplier belongs to.'
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
            companyId: companyId.value,
            isCurrent,
          })
        : await createSupplier({
            organizationName: organizationName.value,
            companyId: companyId.value,
            isCurrent,
          })
    if (!isCurrent()) return
    if (workspaceMode) {
      setSupplierWorkspaceSelection({ supplierId: result.id })
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
