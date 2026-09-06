import type { PlaceIdentityProposal } from 'fireux-places/runtime/place/models/identity-edit'
export type KitchenIdentityIntent = {
  action: 'read' | 'update' | 'none'
  fields: PlaceIdentityProposal
  message: string
}
export const kitchenIdentityPurpose =
  'Read and edit the selected Kitchen’s Place-owned venue identity.'
export const kitchenIdentityBoundary =
  'Name, tagline, address, phone, email, website, currency and timezone belong to the same-id Place. Changes use the existing Place command and its authority checks. Image uploads, opening hours, directory visibility and theme use their named controls; AI does not change them here.'
