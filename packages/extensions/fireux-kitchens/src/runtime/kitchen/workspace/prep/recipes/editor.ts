import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import type { Recipe } from '../../../../recipe/models/model'
import type { Preparation } from '../../../records/prep/preparations/preparation'
import {
  recipeDraft,
  recipeDraftChanges,
  recipeDraftRecord,
} from './form'
import { usePrepMutation } from '../../../composables/prep/usePrepMutation'

type RecipeEditorInput = {
  record: MaybeRefOrGetter<Recipe | undefined>
  kitchenId: MaybeRefOrGetter<string>
  canEdit: MaybeRefOrGetter<boolean>
  preparations: MaybeRefOrGetter<Preparation[]>
}

export function useKitchenWorkspacePrepRecipeEditor(
  input: RecipeEditorInput,
  onCreated: (id: string) => void
) {
  const currentRecord = () =>
    toValue(input.record) || { id: '', name: '', inputs: [], method: [] }
  const open = ref(false),
    baseline = ref(recipeDraft(currentRecord()))
  const createdId = ref('')
  const command = usePrepMutation([
    () => toValue(input.kitchenId),
    () => toValue(input.record)?.id,
    () => toValue(input.canEdit),
  ])
  const preparationOptions = computed(() =>
    toValue(input.preparations).map((row) => ({
      value: row.id,
      label: row.name,
    }))
  )
  const unlinkedOutput = '__unlinked__'
  const outputOptions = computed(() => {
    const outputId = toValue(input.record)?.output_preparation_id
    return [
      { value: unlinkedOutput, label: 'Not linked' },
      ...(outputId &&
      !toValue(input.preparations).some((row) => row.id === outputId)
        ? [{ value: outputId, label: `${outputId} (unavailable)` }]
        : []),
      ...preparationOptions.value,
    ]
  })
  const { draft, changed, saving, error, begin, save } = useIdentityEditor({
    open,
    scope: [
      command.scopeKey,
      () => toValue(input.kitchenId),
      () => toValue(input.record)?.id,
    ],
    canEdit: () => toValue(input.canEdit),
    createDraft: () => recipeDraft(currentRecord()),
    signature: JSON.stringify,
    save: async (value, isCurrent) => {
      const record = toValue(input.record)
      if (!record) {
        createdId.value = (
          await command.createRecipe(
            toValue(input.kitchenId),
            recipeDraftRecord(value),
            isCurrent
          )
        ).id
        return
      }
      const changes = recipeDraftChanges(value, baseline.value)
      if (!Object.keys(changes).length) return
      await command.update(
        'recipes',
        toValue(input.kitchenId),
        record.id,
        changes,
        isCurrent
      )
    },
    onSaved: () => {
      open.value = false
      if (createdId.value) onCreated(createdId.value)
    },
    errorMessage: 'Recipe could not be saved.',
  })
  const outputSelection = computed({
    get: () => draft.value.output || unlinkedOutput,
    set: (value: string) => {
      draft.value.output = value === unlinkedOutput ? '' : value
    },
  })
  function start() {
    createdId.value = ''
    baseline.value = recipeDraft(currentRecord())
    begin()
  }

  return {
    open,
    draft,
    changed,
    saving,
    error,
    outputSelection,
    outputOptions,
    preparationOptions,
    start,
    save,
  }
}
