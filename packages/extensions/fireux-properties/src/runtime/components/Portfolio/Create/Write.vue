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
      <UInput
        v-model="ownerLabel"
        placeholder="Daniel Watson"
      />
    </UFormField>

    <UFormField label="Region label">
      <UInput
        v-model="regionLabel"
        placeholder="Bern"
      />
    </UFormField>

    <UFormField label="Strategy label">
      <UInput
        v-model="strategyLabel"
        placeholder="Income"
      />
    </UFormField>

    <UFormField label="Notes">
      <UTextarea
        v-model="notes"
        :rows="4"
        placeholder="Short operating note for this portfolio."
      />
    </UFormField>

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
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
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from '#imports'
import { usePortfolioConsoleTargets } from '../../../composables/fireux/console/portfolio/core/usePortfolioConsoleTargets'
import { usePortfolioCreate } from '../../../composables/fireux/firestore/portfolio/mutations/usePortfolioCreate'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  returnTo: '',
  cancelTo: '',
})

const emit = defineEmits<{
  (event: 'created', result: ConsoleCreateResult): void
}>()

const route = useRoute()
const router = useRouter()
const { setPortfolioConsoleTarget } = usePortfolioConsoleTargets()
const { createPortfolio, createPortfolioConsole } = usePortfolioCreate()

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
  return props.mode === 'public' ? '/portfolios' : '/console/portfolio'
})

const submit = async () => {
  if (submitting.value) return

  error.value = ''
  submitting.value = true

  try {
    const create = props.mode === 'console' ? createPortfolioConsole : createPortfolio
    const result = await create({
      name: name.value,
      owner_label: ownerLabel.value,
      region_label: regionLabel.value,
      strategy_label: strategyLabel.value,
      notes: notes.value,
    })

    if (props.mode === 'console') {
      setPortfolioConsoleTarget({ portfolioId: result.id })
    }
    emit('created', result)

    if (route.path !== resolvedReturnTo.value) {
      await router.push(resolvedReturnTo.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to create portfolio'
  } finally {
    submitting.value = false
  }
}
</script>
