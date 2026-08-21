import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'

export const CompanyStorage = {
  shape: 'public/root',
  path: 'companies/{placeId}',
  collection: 'companies',
  idParam: 'placeId',
} as const

export const CompanyRoleRecord = defineFireuxEntity({
  kind: 'record',
  name: 'Company',
  family: ['place'],
  identity: 'root',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  root: CompanyStorage.path,
  parent: 'Place',
  notes: [
    'Company is an exact stamps-only same-id role marker over a required canonical Place.',
    'Company stores no Place identity and has no independent lifecycle or App support.',
  ],
})
