export type WorkspaceSidebarMode = 'compact' | 'expanded' | 'all'

/** Expanded keeps normal group behaviour; all starts every group open. */
export function workspaceSidebarNext(mode: WorkspaceSidebarMode): {
  mode: WorkspaceSidebarMode
  label: string
  icon: string
} {
  if (mode === 'compact') return {mode:'expanded',label:'Expand sidebar',icon:'i-lucide-panel-left-open'}
  if (mode === 'expanded') return {mode:'all',label:'Expand all groups',icon:'i-lucide-list-tree'}
  return {mode:'compact',label:'Use compact sidebar',icon:'i-lucide-panel-left-close'}
}
