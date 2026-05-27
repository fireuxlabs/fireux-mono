export type FireuxCreateIntent = 'create' | 'ensure' | 'provision'

export type FireuxCreateRoute =
  | 'firestore_add'
  | 'firestore_set'
  | 'server_api'
  | 'external_provider'
  | 'storage_upload'
  | 'composed'

export type FireuxCreatePlan = {
  intent: FireuxCreateIntent
  routes: FireuxCreateRoute[]
}

export const defineFireuxCreatePlan = <T extends FireuxCreatePlan>(plan: T): T => plan

