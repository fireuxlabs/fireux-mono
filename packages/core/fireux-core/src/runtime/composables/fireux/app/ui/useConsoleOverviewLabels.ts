import { computed, toValue, type MaybeRefOrGetter } from 'vue'

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function useConsoleOverviewLabels(options: {
  singular: string
  plural: string
  isReadOnly: MaybeRefOrGetter<boolean>
}) {
  const { singular, plural, isReadOnly } = options

  const ownershipLabel = computed(() => (toValue(isReadOnly) ? 'read-only' : 'owned'))
  const scopeLabel = computed(() => `All ${ownershipLabel.value} ${plural}`)
  const targetListTitle = computed(() => `${capitalize(ownershipLabel.value)} ${plural}`)
  const selectionTitle = `Select a ${singular} for workspace routes`
  const selectionDescription = computed(
    () => `Choose one ${ownershipLabel.value} ${singular} above before opening deeper console routes.`
  )
  const selectionHelp = computed(
    () =>
      `Overview totals above include all ${ownershipLabel.value} ${plural}. Select one here when you want deeper console routes to work against a specific ${singular}.`
  )
  const activeSelectionTitle = `Active ${singular} selected`
  const quickActionsTitle = `Pick an active ${singular} first`
  const quickActionsDescription = computed(
    () =>
      `The overview is showing all ${ownershipLabel.value} ${plural}. Select one above to enable deeper console routes.`
  )
  const singleOverviewTitle = `${capitalize(singular)} overview`

  return {
    ownershipLabel,
    scopeLabel,
    targetListTitle,
    selectionTitle,
    selectionDescription,
    selectionHelp,
    activeSelectionTitle,
    quickActionsTitle,
    quickActionsDescription,
    singleOverviewTitle,
  }
}
