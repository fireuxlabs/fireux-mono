import { readString } from 'fireux-core/runtime/server/utils/records/read'

export const menuMediaReviewActions = [
  'keep',
  'reprocess-ai',
  'generate',
  'none',
] as const

export type MenuMediaReviewAction = (typeof menuMediaReviewActions)[number]

export type MenuMediaReviewDecision = {
  action: MenuMediaReviewAction
  candidate_url: string
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const menuMediaReviewKey = (sectionIndex: number, itemIndex: number) =>
  `${sectionIndex}:${itemIndex}`

export function normalizeMenuMediaReview(value: unknown) {
  const source = record(value)
  return Object.fromEntries(
    Object.entries(source).flatMap(([key, entry]) => {
      if (!/^\d+:\d+$/.test(key)) return []
      const row = record(entry)
      const action = readString(row.action) as MenuMediaReviewAction
      if (!menuMediaReviewActions.includes(action)) return []
      return [
        [
          key,
          {
            action,
            candidate_url: readString(row.candidate_url),
          } satisfies MenuMediaReviewDecision,
        ],
      ]
    })
  ) as Record<string, MenuMediaReviewDecision>
}
