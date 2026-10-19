import type { ServiceBasketLine } from './service-basket'
import { collectionOrder, collectionSelections } from './collection-checkout'

type CollectionSession = {
  lines: ServiceBasketLine[]
  name: string
  phone: string
  attempt: Record<string, unknown> | null
}
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 20000
const ids = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 100 && value.every(text)
const minor = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0

/** Discard malformed local data; restored amounts never replace server price validation. */
export function readCollectionSession(
  raw: string | null
): CollectionSession | null {
  if (!raw || raw.length > 500000) return null
  try {
    const saved = JSON.parse(raw)
    if (
      !record(saved) ||
      !text(saved.name) ||
      !text(saved.phone) ||
      !Array.isArray(saved.lines) ||
      saved.lines.length > 50
    )
      return null
    for (const line of saved.lines) {
      if (!record(line) || !record(line.source) || !record(line.choices))
        return null
      const { source, choices } = line
      if (
        !['key', 'itemId', 'name', 'currency', 'signature'].every((key) =>
          text(line[key])
        ) ||
        !['kitchenId', 'menuId', 'sectionId'].every((key) =>
          text(source[key])
        ) ||
        !ids(line.offeringIds) ||
        !ids(line.details) ||
        !minor(line.unitMinor) ||
        !minor(line.depositUnitMinor)
      )
        return null
      if (
        !text(choices.optionId) ||
        !ids(choices.extraIds) ||
        !record(choices.groups) ||
        Object.keys(choices.groups).length > 10 ||
        !Object.values(choices.groups).every(ids) ||
        !Number.isInteger(choices.quantity) ||
        Number(choices.quantity) < 1 ||
        Number(choices.quantity) > 99 ||
        (choices.bottle !== undefined &&
          !['deposit', 'exchange'].includes(String(choices.bottle)))
      )
        return null
    }
    const session = saved as CollectionSession
    if (session.attempt !== null) {
      const attempt = session.attempt
      if (
        !record(attempt) ||
        !record(attempt.order) ||
        !text(attempt.order.id) ||
        !attempt.order.id ||
        !session.lines.length
      )
        return null
      const first = session.lines[0]!
      const expected = {
        menuId: first.source.menuSlug || first.source.menuId,
        kitchenSlug: attempt.kitchenSlug,
        order: collectionOrder(
          session.lines,
          attempt.order.id,
          session.name,
          session.phone
        ),
        selections: collectionSelections(session.lines),
        expectedTotal:
          session.lines.reduce(
            (total, line) => total + line.unitMinor * line.choices.quantity,
            0
          ) / 100,
      }
      if (
        !text(attempt.kitchenSlug) ||
        JSON.stringify(attempt) !== JSON.stringify(expected)
      )
        return null
    }
    return session
  } catch {
    return null
  }
}
