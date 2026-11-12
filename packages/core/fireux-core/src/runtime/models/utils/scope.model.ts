export type FireuxRootVisibility = 'app' | 'ecosystem' | 'public'

export type FireuxEntityManagement =
  | { mode: 'root' }
  | { mode: 'workspace' }
  | { mode: 'app'; app_id: string }

export const FireuxEntityManagementDefaults: FireuxEntityManagement = {
  mode: 'root',
}
