export const menuProcessText = (value: unknown) => String(value ?? '').trim()
export const menuProcessRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export const menuProcessRecords = (value: unknown) =>
  Array.isArray(value) ? value.map(menuProcessRecord) : []

export const menuProcessNumberText = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? String(number) : '0'
}

export const menuProcessPriceText = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? `CHF ${number}` : ''
}

export const menuProcessOptionLabel = (option: Record<string, unknown>) =>
  menuProcessText(option.label) ||
  [menuProcessText(option.quantity), menuProcessText(option.unit)]
    .filter(Boolean)
    .join(' ')
