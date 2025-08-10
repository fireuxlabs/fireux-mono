## Scope & links
Places integration: place picker and service areas (scope + planned).
- See repo root CONTEXT.md for principles.
- See docs/STRUCTURE_GUIDE.md for workspace conventions.

Last updated: 2025-08-10
# FireUX Places

Location and places management system for FireUX applications with Google Places API integration.

## Features

- **Google Places Autocomplete**: Intelligent address suggestions with Google Places API
- **Simple Address Forms**: Lightweight manual address entry
- **Address Display**: Formatted address display components
- **Consistent UI**: Follows FireUX form component patterns
- **Mobile-First**: Responsive design for all screen sizes

## Installation

This package is automatically available when installed in a FireUX monorepo.

## Configuration

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['fireux-places'],
  fireuxPlaces: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    defaultCountry: 'US', // Optional, defaults to 'US'
    enableAutocomplete: true, // Optional, defaults to true
  },
})
```

## Components

### PlaceAutocomplete

Full-featured address input with Google Places autocomplete:

```vue
<FireMoleculesFormsPlaceAutocomplete
  label="Business Address"
  :firebase-value="location"
  placeholder="Start typing an address..."
  :update-function="updateLocation"
/>
```

### SimpleAddress

Lightweight manual address entry:

```vue
<FireMoleculesFormsSimpleAddress
  label="Shipping Address"
  :firebase-value="shippingAddress"
  :update-function="updateShippingAddress"
/>
```

### AddressDisplay

Display formatted addresses:

```vue
<FireMoleculesDisplayAddressDisplay
  :place="selectedPlace"
  :show-coordinates="true"
/>
```

## Usage Examples

### In Job Listings

```vue
<FireMoleculesFormsPlaceAutocomplete
  label="Job Location"
  :firebase-value="job.location"
  :update-function="updateJobLocation"
/>
```

### In Restaurant Management

```vue
<FireMoleculesFormsPlaceAutocomplete
  label="Kitchen Address"
  :firebase-value="kitchen.address"
  :update-function="updateKitchenAddress"
/>
```

### Simple User Profile

```vue
<FireMoleculesFormsSimpleAddress
  label="Home Address"
  :firebase-value="user.address"
  :update-function="updateUserAddress"
/>
```

- Follows FireUX component patterns

## Installation

```bash
# Add to your nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'fireux-places'
  ],
  fireuxPlaces: {
    googlePlacesApiKey: 'your-api-key',
    defaultCountry: 'US',
    enableAutocomplete: true
  }
})
```

## Components

- `FirePlacesAutocomplete` - Address autocomplete input
- `FirePlacesDisplay` - Display formatted addresses
- `FirePlacesSimple` - Simple city/state/country form

## Composables

- `usePlaces()` - Core places management
- `useGooglePlaces()` - Google Places API integration

## Models

- `Place` - Complete place object from Google
- `SimpleAddress` - Basic address fields
- `PlaceAutocompleteResult` - Autocomplete search results
