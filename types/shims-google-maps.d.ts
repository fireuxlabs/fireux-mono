// Minimal Google Maps namespace shims for typechecking without @types/google.maps
// Avoids TS errors where global 'google' is referenced dynamically.
// For richer typing, install @types/google.maps and remove this shim.

declare global {
  interface Window {
    google?: typeof google
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    namespace maps {
      namespace places {
        interface AutocompleteServicePrediction {
          place_id: string
          description: string
          structured_formatting?: any
          types?: string[]
        }
        class AutocompleteService {
          getPlacePredictions(
            request: { input: string; types?: string[] },
            callback: (
              predictions: AutocompleteServicePrediction[] | null,
              status: string
            ) => void
          ): void
        }
        class PlacesService {
          constructor(el: HTMLElement)
          getDetails(
            request: { placeId: string; fields?: string[] },
            callback: (place: any, status: string) => void
          ): void
        }
        const PlacesServiceStatus: Record<string, string>
      }
    }
  }
}

export {}
