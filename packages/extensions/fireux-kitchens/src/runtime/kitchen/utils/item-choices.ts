import type {
  ItemChoiceGroup,
  ItemChoiceSelection,
} from '../models/item-choice.model'
const record = (value: unknown): value is Record<string, any> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))
const id = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[a-zA-Z0-9_-]{1,160}$/.test(value) &&
  !['__proto__', 'constructor', 'prototype'].includes(value)
const unique = (values: string[]) => new Set(values).size === values.length
const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max
const amount = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  Number.isSafeInteger(Math.round(value * 100)) &&
  Math.abs(value * 100 - Math.round(value * 100)) < 0.000001
export function normalizeItemChoiceGroups(value: unknown): ItemChoiceGroup[] {
  if (!Array.isArray(value) || value.length > 10)
    throw new Error('Add up to ten choice groups.')
  const groups = value.map((group): ItemChoiceGroup => {
    if (
      !record(group) ||
      Object.keys(group).some(
        (key) =>
          !['id', 'name', 'min', 'max', 'pricing', 'options'].includes(key)
      ) ||
      !id(group.id) ||
      !text(group.name, 80) ||
      !['full', 'additional'].includes(group.pricing) ||
      !Array.isArray(group.options) ||
      !group.options.length ||
      group.options.length > 50
    )
      throw new Error(
        'Each choice group needs a name and between one and fifty choices.'
      )
    if (
      !Number.isInteger(group.min) ||
      group.min < 0 ||
      group.min > group.options.length ||
      (group.max !== null &&
        (!Number.isInteger(group.max) ||
          group.max < Math.max(1, group.min) ||
          group.max > group.options.length))
    )
      throw new Error(`Review selection limits for ${group.name}.`)
    if (group.pricing === 'full' && (group.min !== 1 || group.max !== 1))
      throw new Error('Full Item prices require exactly one choice.')
    const options = group.options.map((option) => {
      if (
        !record(option) ||
        Object.keys(option).some(
          (key) => !['id', 'label', 'price'].includes(key)
        ) ||
        !id(option.id) ||
        !text(option.label, 140) ||
        !amount(option.price)
      )
        throw new Error(
          'Choices need stable identifiers, names and non-negative prices with up to two decimals.'
        )
      return { id: option.id, label: option.label.trim(), price: option.price }
    })
    if (
      !unique(options.map((option) => option.id)) ||
      !unique(options.map((option) => option.label.toLowerCase()))
    )
      throw new Error(
        'Use unique choice names and identifiers within each group.'
      )
    return {
      id: group.id,
      name: group.name.trim(),
      min: group.min,
      max: group.max,
      pricing: group.pricing,
      options,
    }
  })
  if (
    !unique(groups.map((group) => group.id)) ||
    groups.filter((group) => group.pricing === 'full').length > 1
  )
    throw new Error(
      'Use unique group identifiers and at most one full-price group.'
    )
  return groups
}
/** Explicit groups win. Historical flat choices are projected, never written on read. */
export function readItemChoiceGroups(item: {
  choice_groups?: unknown
  choiceGroups?: unknown
  price_options?: any[]
  priceOptions?: any[]
  add_ons?: any[]
  addOns?: any[]
}): ItemChoiceGroup[] {
  const explicit = item.choice_groups ?? item.choiceGroups
  if (explicit !== undefined) return normalizeItemChoiceGroups(explicit)
  const variants = item.price_options || item.priceOptions || []
  const extras = item.add_ons || item.addOns || []
  const key = (option: any, index: number) =>
    option.id ||
    String(option.label || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') ||
    `option-${index + 1}`
  return [
    ...(variants.length
      ? [
          {
            id: 'legacy-variants',
            name: 'Variants',
            min: 1,
            max: 1,
            pricing: 'full' as const,
            options: variants.map((option, index) => ({
              id: key(option, index),
              label: option.label,
              price: option.price,
            })),
          },
        ]
      : []),
    ...(extras.length
      ? [
          {
            id: 'legacy-extras',
            name: 'Extras',
            min: 0,
            max: null,
            pricing: 'additional' as const,
            options: extras.map((option, index) => ({
              id: key(option, index),
              label: option.label,
              price: option.price,
            })),
          },
        ]
      : []),
  ]
}
export function priceItemChoices(
  base: number,
  groups: ItemChoiceGroup[],
  selections: ItemChoiceSelection,
  partial = false
) {
  if (
    !amount(base) ||
    !record(selections) ||
    Object.keys(selections).some(
      (key) => !groups.some((group) => group.id === key)
    )
  )
    throw new Error('Review the Item choices.')
  let full = Math.round(base * 100),
    extra = 0
  const details: string[] = []
  const selected: ItemChoiceSelection = {}
  for (const group of groups) {
    const ids = selections[group.id] ?? []
    if (
      !Array.isArray(ids) ||
      !unique(ids) ||
      ids.some((value) => typeof value !== 'string') ||
      ids.length > (group.max ?? group.options.length) ||
      (!partial && ids.length < group.min)
    )
      throw new Error(
        `${group.name}: choose ${group.min === group.max ? group.min : `${group.min} to ${group.max ?? group.options.length}`} option(s).`
      )
    selected[group.id] = [...ids].sort()
    for (const choiceId of ids) {
      const option = group.options.find((option) => option.id === choiceId)
      if (!option || !amount(option.price))
        throw new Error(`A choice in ${group.name} is no longer available.`)
      details.push(`${group.name}: ${option.label}`)
      if (group.pricing === 'full') full = Math.round(option.price * 100)
      else extra += Math.round(option.price * 100)
    }
  }
  if (!Number.isSafeInteger(full + extra))
    throw new Error('Item price is invalid.')
  return { unitMinor: full + extra, details, selections: selected }
}
export function toggleItemChoice(
  groups: ItemChoiceGroup[],
  selections: ItemChoiceSelection,
  groupId: string,
  optionId: string
): ItemChoiceSelection {
  const group = groups.find((group) => group.id === groupId)
  if (!group || !group.options.some((option) => option.id === optionId))
    return selections
  const current = selections[groupId] || []
  const next = current.includes(optionId)
    ? group.min === 1 && group.max === 1
      ? current
      : current.filter((id) => id !== optionId)
    : group.max === 1
      ? [optionId]
      : current.length < (group.max ?? group.options.length)
        ? [...current, optionId]
        : current
  return { ...selections, [groupId]: next }
}

export function itemChoiceRule(group: ItemChoiceGroup) {
  if (group.min === 1 && group.max === 1) return 'Pick one'
  if (group.min === 0 && group.max === 1) return 'Optional one'
  if (group.max === null)
    return group.min ? `Pick at least ${group.min}` : 'Pick any'
  return group.min === group.max
    ? `Pick ${group.min}`
    : `Pick ${group.min}–${group.max}`
}
