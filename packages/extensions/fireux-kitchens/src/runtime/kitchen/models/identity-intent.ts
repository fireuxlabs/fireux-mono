import type { PlaceIdentityProposal } from 'fireux-places/runtime/place/models/identity-edit'
export type KitchenIdentityIntent = {
  action: 'read' | 'update' | 'none'
  fields: PlaceIdentityProposal
  message: string
}
export const kitchenIdentityPurpose =
  'Read and edit your Kitchen’s public identity.'
export const kitchenIdentityBoundary =
  'Edit your profile, branding, photos, contact details and location in Venue profile. The Identity overview manages your Kitchen listing and directory visibility; shared currency is edited with the venue details. Operating hours and appearance have their own pages. AI prepares changes for you to review; it does not save them automatically.'
