import { kitchenMenuConfirmImportTool } from './confirm-import'
import { kitchenMenuImportFromSourceTool } from './import-from-source'
import { kitchenMenuReviewImportDraftTool } from './review-import-draft'

export const kitchenMenuDomainTools = [
  kitchenMenuReviewImportDraftTool,
  kitchenMenuConfirmImportTool,
] as const

export const kitchenMenuCompoundTools = [
  kitchenMenuImportFromSourceTool,
] as const

export const kitchenMenuTools = [
  ...kitchenMenuDomainTools,
  ...kitchenMenuCompoundTools,
] as const
