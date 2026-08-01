export type ObjectArrayDateSortFields = {
  ongoingKey?: string
  fromYearKey?: string
  fromMonthKey?: string
  toYearKey?: string
  toMonthKey?: string
  startYearKey?: string
  endYearKey?: string
}

export const defaultObjectArrayDateSortFields: Required<ObjectArrayDateSortFields> = {
  ongoingKey: 'ongoing',
  fromYearKey: 'from_year',
  fromMonthKey: 'from_month',
  toYearKey: 'to_year',
  toMonthKey: 'to_month',
  startYearKey: 'start_year',
  endYearKey: 'end_year',
}

export function objectArrayHasDateFields(
  list: any[],
  fields: Required<ObjectArrayDateSortFields>
) {
  return list.some(
    (item) =>
      item &&
      (fields.ongoingKey in item ||
        fields.fromYearKey in item ||
        fields.fromMonthKey in item ||
        fields.toYearKey in item ||
        fields.toMonthKey in item ||
        fields.startYearKey in item ||
        fields.endYearKey in item)
  )
}

function monthToNumber(value: unknown): number | null {
  if (value == null) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return numeric
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ]
  const index = months.indexOf(raw.slice(0, 3))
  return index >= 0 ? index + 1 : null
}

function toNumber(value: unknown): number | null {
  const raw =
    typeof value === 'number' ? value : Number(String(value ?? '').trim())
  return Number.isFinite(raw) ? raw : null
}

function resolveDateParts(item: any, fields: Required<ObjectArrayDateSortFields>) {
  const ongoing = Boolean(item?.[fields.ongoingKey])
  const fromYear = toNumber(
    item?.[fields.fromYearKey] ?? item?.[fields.startYearKey]
  )
  const fromMonth = monthToNumber(item?.[fields.fromMonthKey])
  const toYear = toNumber(item?.[fields.toYearKey] ?? item?.[fields.endYearKey])
  const toMonth = monthToNumber(item?.[fields.toMonthKey])
  return {
    ongoing,
    startValue: fromYear ? fromYear * 12 + (fromMonth ?? 1) : null,
    endValue: ongoing
      ? Number.POSITIVE_INFINITY
      : toYear
        ? toYear * 12 + (toMonth ?? 1)
        : null,
  }
}

export function sortObjectArrayByDate(
  list: any[],
  fields: Required<ObjectArrayDateSortFields>
) {
  return list
    .map((item, index) => ({ item, index, ...resolveDateParts(item, fields) }))
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1
      const endDifference = (b.endValue ?? -Infinity) - (a.endValue ?? -Infinity)
      if (endDifference) return endDifference
      const startDifference =
        (b.startValue ?? -Infinity) - (a.startValue ?? -Infinity)
      return startDifference || a.index - b.index
    })
    .map((row) => row.item)
}
