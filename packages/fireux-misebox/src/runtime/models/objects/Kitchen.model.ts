import type { FirestoreObject } from 'fireux-core/src/runtime/models/objects/object.model'

export interface Kitchen extends FirestoreObject {
  name: string
  description?: string
  chefId: string
  cuisine: string[]
  location: {
    address: string
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  capacity: number
  priceRange: {
    min: number
    max: number
    currency: string
  }
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  amenities: string[]
  images: string[]
  isActive: boolean
  rating?: number
  reviewCount?: number
}

export type CreateKitchen = Omit<
  Kitchen,
  'slug' | 'appId' | 'created_at' | 'updated_at' | 'creator_id'
>
export type UpdateKitchen = Partial<CreateKitchen>
