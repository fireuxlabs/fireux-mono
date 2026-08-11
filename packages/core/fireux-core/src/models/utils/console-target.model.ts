export const CONSOLE_TARGET_LIMIT = 50

export type ConsoleTargetIdItem = {
  id: string
}

export type ConsoleTargetsResponse<TItem extends ConsoleTargetIdItem = ConsoleTargetIdItem> = {
  ok: true
  appId: string
  family: string
  items: TItem[]
}
