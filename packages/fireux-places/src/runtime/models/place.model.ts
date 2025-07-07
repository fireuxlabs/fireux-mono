export interface Place {
  place_id: string
  formatted_address: string
  name?: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  address_components: AddressComponent[]
  types: string[]
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface SimpleAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
}

export interface PlaceAutocompleteResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  types: string[]
}
