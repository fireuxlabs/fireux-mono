import type { PlaceSearchSource } from './place-search'
import type { PlaceImageShade } from '../utils/place-spine'

export namespace PlaceCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    shortName: string
    formattedAddress: string
    shortAddress: string
    imageUrl: string
    coverImageUrl: string
    description: string
    categoryLabels: string[]
    imageShade?: PlaceImageShade
    source?: PlaceSearchSource
    collection?: string
    claimedBy?: string
  }
}
