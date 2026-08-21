import type { KitchenMiseTask } from '../../../models/mise.model.ts'
import {
  deanosKitchenDemoIdentity,
  deanosXmasMenuDemoIdentity,
} from '../../core/fixtures'
import { miseTask } from './builders'

export const deanosKitchenDemoProductionMiseTasks: KitchenMiseTask[] = [
  miseTask(
    deanosKitchenDemoIdentity,
    'cook-smoked-bacon',
    'Cook and portion smoked bacon',
    'grill',
    'todo',
    'high',
    25,
    {
      workflowStage: 'cook_chill',
      prepItemIds: ['cooked-smoked-bacon'],
      checklist: [
        'Cook bacon until crisp',
        'Drain and cool safely',
        'Portion for service',
      ],
    }
  ),
  miseTask(
    deanosXmasMenuDemoIdentity,
    'roast-xmas-turkey',
    'Roast, chill and portion turkey',
    'grill',
    'todo',
    'high',
    90,
    {
      workflowStage: 'cook_chill',
      prepItemIds: ['roast-turkey'],
      checklist: [
        'Roast turkey to safe core temperature',
        'Record temperature',
        'Chill, slice and label',
      ],
    }
  ),
]
