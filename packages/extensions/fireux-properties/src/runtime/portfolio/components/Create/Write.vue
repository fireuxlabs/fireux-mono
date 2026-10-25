<template>
  <div class="space-y-4">
    <UFormField label="Portfolio name" required>
      <UInput
        v-model="name"
        placeholder="Bern Residential Portfolio"
        autofocus
      />
    </UFormField>

    <UFormField label="Owner label">
      <UInput v-model="ownerLabel" placeholder="Daniel Watson" />
    </UFormField>

    <UFormField label="Region label">
      <UInput v-model="regionLabel" placeholder="Bern" />
    </UFormField>

    <UFormField label="Strategy label">
      <UInput v-model="strategyLabel" placeholder="Income" />
    </UFormField>

    <UFormField label="Notes">
      <UTextarea
        v-model="notes"
        :rows="4"
        placeholder="Short operating note for this portfolio."
      />
    </UFormField>

    <div v-if="error" role="alert" class="text-sm text-error">
      {{ error }}
      <FireCopyError :message="error" />
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        color="primary"
        icon="i-lucide-plus"
        :loading="submitting"
        @click="submit"
      >
        Create portfolio
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
  </div>
</template>

<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { usePortfolioCreate } from '../../composables/firestore/mutations/usePortfolioCreate'

const props = withDefaults(
  defineProps<{
    mode?: FireuxEntityCreateMode
    returnTo?: string
    cancelTo?: string
  }>(),
  {
    mode: 'workspace',
    returnTo: '',
    cancelTo: '',
  }
)

const emit = defineEmits<{
  (event: 'created', result: FireuxEntityCreateResult): void
}>()

const route = useRoute()
const router = useRouter()
const { select } = useWorkspace('portfolio')
const { createPortfolio } = usePortfolioCreate()

const name = ref('')
const ownerLabel = ref('')
const regionLabel = ref('')
const strategyLabel = ref('')
const notes = ref('')
const submitting = ref(false)
const error = ref('')

const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue
  return props.mode === 'root' ? '/portfolios' : '/workspace/portfolio'
})

const { currentUser } = useAuth()
const appSession = useAppSession()
const fireux = useFireUXConfig()
const scopeSources = [currentUser, appSession.appUser, () => fireux.appId, () => route.fullPath, () => props.mode, resolvedReturnTo, name, ownerLabel, regionLabel, strategyLabel, notes]
const captureCommand = useCommandScope(scopeSources)
watch(scopeSources, () => { submitting.value = false; error.value = '' }, { flush: 'sync' })

const submit = async () => {
  if (submitting.value) return

  const isCurrent = captureCommand()
  const mode = props.mode
  const returnTo = resolvedReturnTo.value
  error.value = ''
  submitting.value = true

  try {
    const result = await createPortfolio({
      identity: {
      name: name.value,
      owner_label: ownerLabel.value,
      region_label: regionLabel.value,
      strategy_label: strategyLabel.value,
      notes: notes.value,
      },
    }, { isCurrent })

    if (!isCurrent()) return
    if (mode === 'workspace') {
      select(result.id)
    }
    emit('created', result)

    if (route.path !== returnTo) {
      await router.push(returnTo)
    }
  } catch {
    if (!isCurrent()) return
    error.value = 'Portfolio could not be created. Check the details and try again.'
  } finally {
    if (isCurrent()) submitting.value = false
  }
}
</script>
