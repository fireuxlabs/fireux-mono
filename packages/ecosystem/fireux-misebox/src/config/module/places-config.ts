export const getPlacesConfig = () => ({
  enabled: true,
  types: ['kitchens', 'companies'],
  googleAutocompleteTypeFilters: {
    kitchen: [
      'restaurant',
      'cafe',
      'bar',
      'bakery',
      'meal_delivery',
      'meal_takeaway',
      'food',
      'food_truck',
    ],
  },
})
