/** Table context comes from the dedicated entrance, never a customer table picker. */
export function tableServiceTableNumber(value: unknown): string {
  if (typeof value !== 'string') return ''
  const table = value.trim()
  return /[\p{L}\p{N}]/u.test(table) &&
    table.length <= 40 &&
    /^[\p{L}\p{N} ._-]+$/u.test(table)
    ? table
    : ''
}

export function tableServiceEntrancePath(
  kitchenSlug: string,
  tableNumber: unknown
): string {
  const table = tableServiceTableNumber(tableNumber)
  return kitchenSlug.trim() && table
    ? `/kitchens/${encodeURIComponent(kitchenSlug.trim())}/table-service/${encodeURIComponent(table)}`
    : ''
}
