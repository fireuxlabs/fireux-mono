export type PublicActionButton = {
  label: string
  to?: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  loading?: boolean
  disabled?: boolean
  onClick?: (event: MouseEvent) => void | Promise<void>
}

export type PublicActionGroup = {
  label: string
  items: string[]
  color?: 'primary' | 'neutral'
}

export function visiblePublicActionGroups(groups: PublicActionGroup[]) {
  return groups.filter((group) => group.items.length > 0)
}
