import { readString } from 'fireux-core/runtime/server/utils/records/read'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../models/menu-item.model.ts'
import type { KitchenMenuCurrentShape } from './current'
import type { KitchenMenuDraftSection } from './sections'
import { hasIncludedMenuChoiceCue } from '../ai/choices'

export type KitchenMenuProcessFlag = {
  code: string
  level: 'info' | 'warning' | 'error'
  message: string
  item?: string
  section?: string
}

export function kitchenMenuBaselineFlags(input: {
  filesCount: number
  currentStatus: string
  currentSectionsCount: number
  currentItemsCount: number
}) {
  const flags: KitchenMenuProcessFlag[] = [
    {
      code: 'source-files-ready',
      level: 'info',
      message: `${input.filesCount} source file(s) ready for extraction.`,
    },
    {
      code: 'published-menu-baseline',
      level: input.currentStatus === 'published' ? 'info' : 'warning',
      message: `Current menu status is ${input.currentStatus || 'unknown'}.`,
    },
  ]

  if (!input.currentSectionsCount) {
    flags.push({
      code: 'no-current-sections',
      level: 'warning',
      message: 'The current menu has no active sections to compare.',
    })
  }

  if (!input.currentItemsCount) {
    flags.push({
      code: 'no-current-items',
      level: 'warning',
      message: 'The current menu has no active dish-backed items to compare.',
    })
  }

  return flags
}

const normalizeKey = (value: unknown) =>
  readString(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const wordSet = (value: string) => new Set(
  normalizeKey(value).split(/\s+/g).filter((word) => word.length > 2)
)

const overlapScore = (left: string, right: string) => {
  const leftWords = wordSet(left)
  const rightWords = wordSet(right)
  if (!leftWords.size || !rightWords.size) return 0

  let overlap = 0
  for (const word of leftWords) if (rightWords.has(word)) overlap += 1
  return (overlap * 2) / (leftWords.size + rightWords.size)
}

const sameSection = (left: string, right: string) =>
  normalizeKey(left) === normalizeKey(right)

function flatCurrentItems(current: KitchenMenuCurrentShape) {
  return current.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
      add_ons: normalizeMenuItemAddOns(item.add_ons),
      price_options: normalizeMenuItemPriceOptions(item.price_options),
    }))
  )
}

function flatDraftItems(sections: KitchenMenuDraftSection[]) {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
      add_ons: normalizeMenuItemAddOns(item.add_ons),
      price_options: normalizeMenuItemPriceOptions(item.price_options),
    }))
  )
}

const similarEnough = (
  current: ReturnType<typeof flatCurrentItems>[number],
  draft: ReturnType<typeof flatDraftItems>[number]
) => {
  const score = overlapScore(current.name, draft.name)
  const samePrice = Boolean(
    current.price &&
      draft.price &&
      Math.abs(current.price - draft.price) < 0.05
  )

  return sameSection(current.section, draft.section) &&
    (score >= 0.55 || (samePrice && score >= 0.25))
}

const pairItems = (
  currentItems: ReturnType<typeof flatCurrentItems>,
  draftItems: ReturnType<typeof flatDraftItems>
) => {
  const pairs: Array<{
    current: ReturnType<typeof flatCurrentItems>[number]
    draft: ReturnType<typeof flatDraftItems>[number]
    exact: boolean
  }> = []
  const usedCurrent = new Set<number>()
  const usedDraft = new Set<number>()
  const addPair = (currentIndex: number, draftIndex: number, exact: boolean) => {
    pairs.push({
      current: currentItems[currentIndex],
      draft: draftItems[draftIndex],
      exact,
    })
    usedCurrent.add(currentIndex)
    usedDraft.add(draftIndex)
  }

  currentItems.forEach((current, currentIndex) => {
    const draftIndex = draftItems.findIndex(
      (draft, index) =>
        !usedDraft.has(index) &&
        current.key &&
        current.key === draft.key
    )

    if (draftIndex < 0) return
    addPair(currentIndex, draftIndex, true)
  })

  currentItems.forEach((current, currentIndex) => {
    if (usedCurrent.has(currentIndex)) return

    const draftIndex = draftItems.findIndex(
      (draft, index) =>
        !usedDraft.has(index) && similarEnough(current, draft)
    )

    if (draftIndex < 0) return
    addPair(currentIndex, draftIndex, false)
  })

  return {
    pairs,
    missing: currentItems.filter((_, index) => !usedCurrent.has(index)),
    added: draftItems.filter((_, index) => !usedDraft.has(index)),
  }
}

const priceOptionsCount = (
  items: ReturnType<typeof flatCurrentItems> | ReturnType<typeof flatDraftItems>
) => items.reduce((count, item) => count + item.price_options.length, 0)
const addOnsCount = (
  items: ReturnType<typeof flatCurrentItems> | ReturnType<typeof flatDraftItems>
) => items.reduce((count, item) => count + item.add_ons.length, 0)

const addFlag = (
  flags: KitchenMenuProcessFlag[],
  code: string,
  level: KitchenMenuProcessFlag['level'],
  message: string,
  item: string,
  section: string
) => flags.push({ code, level, message, item, section })

const optionKey = (option: { id?: string; label: string }) =>
  normalizeKey(option.label) || normalizeKey(option.id)

const missingOptions = <T extends { id?: string; label: string }>(
  current: T[],
  draft: T[]
) => {
  const draftKeys = new Set(draft.map(optionKey).filter(Boolean))
  return current.filter((option) => !draftKeys.has(optionKey(option)))
}

const optionWithKey = <T extends { id?: string; label: string }>(
  options: T[],
  key: string
) => options.find((option) => optionKey(option) === key)

export function compareKitchenMenuDraftToCurrent(
  current: KitchenMenuCurrentShape,
  draftSections: KitchenMenuDraftSection[]
) {
  const flags: KitchenMenuProcessFlag[] = []
  const currentItems = flatCurrentItems(current)
  const draftItems = flatDraftItems(draftSections)
  const matched = pairItems(currentItems, draftItems)

  for (const item of matched.missing) {
    addFlag(flags, 'missing-in-extraction', 'warning',
      `${item.name} exists in the current menu but was not found in the draft.`,
      item.name, item.section)
  }

  for (const item of matched.added) {
    addFlag(flags, 'new-in-extraction', 'info',
      `${item.name} was found in the draft but is not in the current menu.`,
      item.name, item.section)
  }

  for (const { current, draft, exact } of matched.pairs) {
    if (!exact && current.name !== draft.name) {
      addFlag(flags, 'name-changed', 'info',
        `${current.name} appears as ${draft.name} in the draft.`,
        draft.name, draft.section)
    }

    if (current.price && draft.price && Math.abs(current.price - draft.price) >= 0.05) {
      addFlag(flags, 'price-diff', 'warning',
        `${current.name} price differs: current ${current.price}, AI ${draft.price}.`,
        current.name, current.section)
    }

    const missingVariants = missingOptions(
      current.price_options,
      draft.price_options
    )
    if (missingVariants.length) {
      addFlag(flags, 'variants-missing-in-extraction', 'error',
        `${current.name} would lose variant(s): ${missingVariants.map((option) => option.label).join(', ')}.`,
        current.name, current.section)
    }
    for (const currentOption of current.price_options) {
      const draftOption = optionWithKey(
        draft.price_options,
        optionKey(currentOption)
      )
      if (
        draftOption &&
        Math.abs(currentOption.price - draftOption.price) >= 0.05
      ) {
        addFlag(flags, 'variant-price-diff', 'warning',
          `${current.name} · ${currentOption.label} differs: current ${currentOption.price}, AI ${draftOption.price}.`,
          current.name, current.section)
      }
    }

    const missingAddOns = missingOptions(current.add_ons, draft.add_ons)
    if (missingAddOns.length) {
      addFlag(flags, 'add-ons-missing-in-extraction', 'error',
        `${current.name} would lose add-on(s): ${missingAddOns.map((option) => option.label).join(', ')}.`,
        current.name, current.section)
    }
    for (const currentOption of current.add_ons) {
      const draftOption = optionWithKey(draft.add_ons, optionKey(currentOption))
      if (
        draftOption &&
        Math.abs(currentOption.price - draftOption.price) >= 0.05
      ) {
        addFlag(flags, 'add-on-price-diff', 'warning',
          `${current.name} · ${currentOption.label} differs: current ${currentOption.price}, AI ${draftOption.price}.`,
          current.name, current.section)
      }
    }
  }

  for (const item of draftItems) {
    if (
      !item.price_options.length &&
      hasIncludedMenuChoiceCue(item)
    ) {
      addFlag(flags, 'unstructured-choice-language', 'warning',
        `${item.name} contains alternative wording but has no required variants. Check whether choices such as “fries or rice” should be price options.`,
        item.name, item.section)
    }

    if (!item.price_options.length) continue

    addFlag(flags, 'variants-found', 'info',
      `${item.name} has ${item.price_options.length} variant option(s) in the draft.`,
      item.name, item.section)

    const current = matched.pairs.find((pair) => pair.draft === item)?.current
    if (!current || current.price_options.length >= item.price_options.length) continue

    addFlag(flags, 'variants-need-review', 'warning',
      `${item.name} has ${item.price_options.length} draft option(s), but the current menu has ${current.price_options.length}.`,
      item.name, item.section)
  }

  for (const item of matched.missing) {
    if (!item.price_options.length) continue

    addFlag(flags, 'variants-missing-in-extraction', 'error',
      `${item.name} and its current menu variants are missing from the draft.`,
      item.name, item.section)
  }

  for (const item of draftItems) {
    if (!item.add_ons.length) continue

    addFlag(flags, 'add-ons-found', 'info',
      `${item.name} has ${item.add_ons.length} add-on option(s) in the draft.`,
      item.name, item.section)

    const current = matched.pairs.find((pair) => pair.draft === item)?.current
    if (!current || current.add_ons.length >= item.add_ons.length) continue

    addFlag(flags, 'add-ons-need-review', 'warning',
      `${item.name} has ${item.add_ons.length} draft add-on(s), but the current menu has ${current.add_ons.length}.`,
      item.name, item.section)
  }

  for (const item of matched.missing) {
    if (!item.add_ons.length) continue

    addFlag(flags, 'add-ons-missing-in-extraction', 'error',
      `${item.name} and its current menu add-ons are missing from the draft.`,
      item.name, item.section)
  }

  return {
    flags,
    counts: {
      extracted_sections: draftSections.length,
      extracted_items: draftItems.length,
      current_add_ons: addOnsCount(currentItems),
      extracted_add_ons: addOnsCount(draftItems),
      current_price_options: priceOptionsCount(currentItems),
      extracted_price_options: priceOptionsCount(draftItems),
    },
  }
}
