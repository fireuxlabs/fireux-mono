import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type CompanyStamp = {
  at: FirebaseTimestamp
}

export type Company = {
  id: string
  created: CompanyStamp
  updated: CompanyStamp
}
