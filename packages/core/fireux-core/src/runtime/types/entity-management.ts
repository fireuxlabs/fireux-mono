/** Shared management scope; domain owners retain records and authority. */
export type FireuxEntityManagement =
  | { mode: 'root' }
  | { mode: 'workspace' }
  | { mode: 'app'; app_id: string }
