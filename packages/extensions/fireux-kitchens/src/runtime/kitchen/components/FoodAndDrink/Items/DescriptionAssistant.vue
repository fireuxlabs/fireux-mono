<template>
  <section
    v-if="dish && catalogue.itemKind === 'drink' && canWrite"
    class="grid gap-4 rounded-lg border border-default bg-elevated/30 p-4"
  >
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-highlighted">
        DrinksAI description assistance
      </h3>
      <p class="text-xs text-muted">
        Supply confirmed notes, then review the proposal before applying it
        through Update Drink.
      </p>
    </div>

    <div class="grid gap-4">
      <UFormField label="Confirmed notes">
        <UTextarea
          v-model="notes"
          :rows="4"
          :maxlength="1200"
          :disabled="proposing || saving"
          placeholder="For example: alcohol-free, lime and mint, served over ice."
          class="w-full"
        />
      </UFormField>

      <UButton
        label="Ask DrinksAI"
        icon="i-lucide-sparkles"
        color="neutral"
        variant="soft"
        class="w-fit"
        :loading="proposing"
        :disabled="!notes.trim() || proposing || saving"
        @click="proposeDescription"
      />

      <UFormField v-if="proposal" label="Review proposal">
        <UTextarea
          v-model="proposal"
          :rows="5"
          :maxlength="800"
          :disabled="proposing || saving"
          class="w-full"
        />
      </UFormField>

      <div v-if="proposal" class="flex flex-wrap gap-2">
        <UButton
          label="Approve description"
          icon="i-lucide-check"
          :loading="saving"
          :disabled="!proposal.trim() || proposing || saving"
          @click="approveDescription"
        />
        <UButton
          label="Discard"
          color="neutral"
          variant="ghost"
          :disabled="saving"
          @click="proposal = ''"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
const workspace = useKitchenWorkspace()
const { catalogue } = useKitchenDishesContext()
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { ref } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'

const { appId } = useFireUXConfig()
const { currentUser } = useAuth()
const toast = useToastify()
const { dish, dishId, kitchenId, canWrite } = useKitchenDishDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('dishId')
)
const route = useRoute()
const notes = ref('')
const proposal = ref('')
const proposing = ref(false)
const saving = ref(false)

useDishEditorScope([kitchenId, dishId, () => route.fullPath], () => {
  notes.value = ''
  proposal.value = ''
  proposing.value = false
  saving.value = false
})

const ownerSources = [kitchenId, dishId, () => route.fullPath]
const captureScope = useDishEditorScope(
  [...ownerSources, notes, proposal],
  () => {
    proposing.value = false
    saving.value = false
  }
)
const { updateDish } = useDishUpdate([
  ...ownerSources,
  notes,
  proposal,
  canWrite,
])

async function proposeDescription() {
  const isCurrent = captureScope()
  const requestedKitchenId = kitchenId.value,
    requestedDishId = dishId.value,
    requestedNotes = notes.value.trim()
  if (
    !canWrite.value ||
    proposing.value ||
    saving.value ||
    !dishId.value ||
    !kitchenId.value ||
    !notes.value.trim()
  )
    return
  proposing.value = true
  try {
    const token = await currentUser.value?.getIdToken()
    if (!isCurrent()) return
    if (!token) throw new Error('Sign in before asking DrinksAI.')
    const result = await $fetch<{ proposal: string }>(
      '/api/workspace/kitchen/drinks/description',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          appId,
          kitchenId: requestedKitchenId,
          drinkId: requestedDishId,
          notes: requestedNotes,
        },
      }
    )
    if (!isCurrent()) return
    proposal.value = result.proposal
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'DrinksAI could not prepare a description',
      description: (error as any)?.data?.statusMessage || 'Please try again.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    if (isCurrent()) proposing.value = false
  }
}

async function approveDescription() {
  const isCurrent = captureScope()
  if (
    !canWrite.value ||
    proposing.value ||
    saving.value ||
    !dishId.value ||
    !kitchenId.value ||
    !proposal.value.trim()
  )
    return
  saving.value = true
  try {
    await updateDish(
      dishId.value,
      { description: proposal.value.trim() },
      { kitchenId: kitchenId.value }
    )
    if (!isCurrent()) return
    proposal.value = ''
    notes.value = ''
    toast.add({
      title: 'Drink description updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'Drink description unchanged',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
