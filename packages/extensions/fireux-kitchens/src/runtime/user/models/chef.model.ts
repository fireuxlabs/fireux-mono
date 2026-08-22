import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type ChefGalleryItem = { name: string; image_url: string }
export type Chef = FireuxStamped & { id: string; kind: 'chef'; title: string; summary: string; chef_bio: string; chef_image: string; chef_signature_dishes: string[]; chef_gallery: ChefGalleryItem[]; chef_organization_name: string }
