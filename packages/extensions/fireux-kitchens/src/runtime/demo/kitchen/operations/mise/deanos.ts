import type { KitchenMiseTask } from '../../../../models/kitchen/mise.model'
import { deanosKitchenDemoPreparationMiseTasks } from './deanos-preparation'
import { deanosKitchenDemoProductionMiseTasks } from './deanos-production'
import { deanosKitchenDemoServiceMiseTasks } from './deanos-service'

export const deanosKitchenDemoMiseTasks: KitchenMiseTask[] = [
  ...deanosKitchenDemoPreparationMiseTasks,
  ...deanosKitchenDemoProductionMiseTasks,
  ...deanosKitchenDemoServiceMiseTasks,
]

