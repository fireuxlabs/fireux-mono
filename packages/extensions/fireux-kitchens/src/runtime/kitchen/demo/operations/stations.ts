import type { KitchenStation } from '../../models/station.model.ts'
import {
  deanosKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from '../core/fixtures'
import { station } from './station-builders'

export const deanosKitchenDemoStations: KitchenStation[] = [
  station(
    deanosKitchenDemoIdentity,
    'prep',
    'Prep',
    'Cold prep, sauces and batch work.',
    1
  ),
  station(
    deanosKitchenDemoIdentity,
    'grill',
    'Grill',
    'Burgers and hot holding.',
    2
  ),
  station(
    deanosKitchenDemoIdentity,
    'fryers',
    'Fryers',
    'Chicken and fries.',
    3
  ),
  station(
    deanosKitchenDemoIdentity,
    'drinks',
    'Drinks',
    'Shakes, coolers and garnish.',
    4
  ),
  station(
    deanosKitchenDemoIdentity,
    'pass',
    'Pass',
    'Final checks and guest handoff.',
    5
  ),
]

export const miseboxRestaurantKitchenDemoStations: KitchenStation[] = [
  station(
    miseboxRestaurantKitchenDemoIdentity,
    'hearth',
    'Hearth',
    'Wood-fired breads, vegetables and roasting.',
    1
  ),
  station(
    miseboxRestaurantKitchenDemoIdentity,
    'garden-pass',
    'Garden pass',
    'Cold assembly, drinks and final checks.',
    2
  ),
]

export const pizzaTheActionKitchenDemoStations: KitchenStation[] = [
  station(
    pizzaTheActionKitchenDemoIdentity,
    'pizza-oven',
    'Pizza oven',
    'Stretching, topping and wood-fired baking.',
    1
  ),
  station(
    pizzaTheActionKitchenDemoIdentity,
    'pizza-pass',
    'Pizza pass',
    'Sides, slicing and guest handoff.',
    2
  ),
]
