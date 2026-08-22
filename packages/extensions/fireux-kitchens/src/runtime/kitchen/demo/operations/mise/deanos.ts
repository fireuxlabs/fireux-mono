import type { KitchenMiseTask } from '../../../utils/mise.ts'
import { deanosKitchenDemoPreparationMiseTasks } from './deanos-preparation'
import { deanosKitchenDemoProductionMiseTasks } from './deanos-production'
import { deanosKitchenDemoServiceMiseTasks } from './deanos-service'

export const deanosKitchenDemoMiseTasks: KitchenMiseTask[] = [
  ...deanosKitchenDemoPreparationMiseTasks,
  ...deanosKitchenDemoProductionMiseTasks,
  ...deanosKitchenDemoServiceMiseTasks,
]
