import type { PlaceBusinessHours } from './place.model'

export type GooglePlaceReview = {
  placeId: string
  name?: string
  phone?: string
  website?: string
  timezone?: string
  business_hours: PlaceBusinessHours | null
  hoursStatus: 'available' | 'missing' | 'unsupported'
  attributions: string[]
}
