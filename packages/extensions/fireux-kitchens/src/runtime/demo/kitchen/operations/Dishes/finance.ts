export type KitchenDemoDishFinance = {
  dishId: string
  quantitySold: number
}

/**
 * Fictional, deterministic Dish-level figures for the Deanos Product Demo.
 *
 * These quantities are presentation fixtures, not Orders, KitchenSales,
 * FinancialFacts, customer performance, or a projection of live data.
 * Revenue remains derived by the consuming Product Demo from the shared
 * estimator's resolved selling price.
 */
export const deanosKitchenDemoDishFinance: KitchenDemoDishFinance[] = [
  { dishId: 'deanos-classic', quantitySold: 186 },
  { dishId: 'double-trouble', quantitySold: 94 },
  { dishId: 'swiss-melt', quantitySold: 73 },
  { dishId: 'hot-honey-chicken', quantitySold: 142 },
  { dishId: 'ranch-chicken', quantitySold: 68 },
  { dishId: 'crispy-cauliflower', quantitySold: 81 },
  { dishId: 'skin-on-fries', quantitySold: 264 },
  { dishId: 'dirty-deanos-fries', quantitySold: 97 },
  { dishId: 'onion-rings', quantitySold: 153 },
  { dishId: 'salted-caramel-shake', quantitySold: 54 },
  { dishId: 'cherry-vanilla-shake', quantitySold: 39 },
  { dishId: 'house-lemonade', quantitySold: 121 },
  { dishId: 'classic-smash-slider-platter', quantitySold: 28 },
  { dishId: 'hot-honey-chicken-slider-platter', quantitySold: 22 },
  { dishId: 'cauliflower-slider-platter', quantitySold: 31 },
  { dishId: 'party-fries-tray', quantitySold: 37 },
  { dishId: 'party-onion-ring-platter', quantitySold: 29 },
  { dishId: 'party-lemonade', quantitySold: 18 },
  { dishId: 'party-strawberry-lime-cooler', quantitySold: 16 },
  { dishId: 'party-cucumber-mint-cooler', quantitySold: 14 },
  { dishId: 'deanos-christmas-stack', quantitySold: 61 },
  { dishId: 'turkey-dinner-burger', quantitySold: 47 },
  { dishId: 'pigs-in-blankets-waffle-fries', quantitySold: 52 },
  { dishId: 'fried-brie-bites', quantitySold: 44 },
  { dishId: 'stuffed-mini-yorkshires', quantitySold: 36 },
  { dishId: 'gingerbread-caramel-shake', quantitySold: 49 },
]
