export type KitchenAIHandoff = {
  userId: string
  kitchenId: string
  capability: 'menus'
  prompt: string
  createdAt: number
}

export function currentKitchenAIHandoff(
  value: KitchenAIHandoff | null,
  userId: string,
  kitchenId: string,
  now = Date.now()
): KitchenAIHandoff | null {
  if (
    !value ||
    value.userId !== userId ||
    !userId ||
    value.kitchenId !== kitchenId ||
    !kitchenId ||
    value.capability !== 'menus' ||
    typeof value.prompt !== 'string' ||
    !value.prompt.trim() ||
    !Number.isFinite(value.createdAt) ||
    !Number.isFinite(now) ||
    value.prompt.length > 2000 ||
    now < value.createdAt ||
    now - value.createdAt > 120_000
  )
    return null
  return value
}
