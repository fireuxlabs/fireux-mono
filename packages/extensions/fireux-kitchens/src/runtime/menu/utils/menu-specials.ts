import type { MenuManifestContent } from '../models/menu-detail.model.ts'

export const shouldEmbedMenuSpecials = (input: {
  sourceMenuId: string
  primaryMenuId?: string
  specialsEnabled?: boolean
  specialsMenuId?: string
}) => Boolean(
  input.specialsEnabled === true &&
  input.primaryMenuId &&
  input.sourceMenuId === input.primaryMenuId &&
  input.specialsMenuId &&
  input.specialsMenuId !== input.primaryMenuId
)

export const menuSpecialsContent = (input: {
  id: string
  name: string
  description: string
  sections: MenuManifestContent['sections']
}): MenuManifestContent => ({
  id: input.id,
  name: input.name || 'Daily Specials',
  description: input.description,
  sections: input.sections,
})
