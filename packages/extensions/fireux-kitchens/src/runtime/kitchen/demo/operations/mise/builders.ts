import {
  KitchenMiseTaskDefaults,
  type KitchenMiseTask,
} from '../../../models/mise.model.ts'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
} from '../../core/fixtures'
import type { KitchenDemoIdentity } from '../../core/types'
import { DEANOS_KITCHEN_DEMO_AS_OF_DATE } from '../Orders/history'

export type DemoMiseChecklistInput =
  | string
  | {
      done?: boolean
      label: string
    }

export const miseTask = (
  identity: KitchenDemoIdentity,
  id: string,
  title: string,
  stationId: string,
  status: KitchenMiseTask['status'],
  priority: KitchenMiseTask['priority'],
  estimatedMinutes: number,
  production: {
    checklist?: DemoMiseChecklistInput[]
    description?: string
    ingredientIds?: string[]
    prepItemIds?: string[]
    recipeId?: string
    workflowStage?: KitchenMiseTask['workflow_stage']
  } = {}
): KitchenMiseTask => {
  const serviceDate =
    identity.kitchenId === deanosKitchenDemoIdentity.kitchenId
      ? DEANOS_KITCHEN_DEMO_AS_OF_DATE
      : '2026-07-22'
  const resolvedStatus =
    identity.menuId === deanosKitchenDemoIdentity.menuId
      ? 'done'
      : status

  return {
  ...KitchenMiseTaskDefaults,
  id,
  kitchen_id: identity.kitchenId,
  title,
  description: production.description ?? '',
  station: stationId,
  workflow_stage: production.workflowStage ?? '',
  service_date: serviceDate,
  status: resolvedStatus,
  priority,
  estimated_minutes: estimatedMinutes,
  ingredient_ids: [...(production.ingredientIds ?? [])],
  prep_item_ids: [...(production.prepItemIds ?? [])],
  menu_id: identity.menuId,
  recipe_id: production.recipeId ?? '',
  checklist: (production.checklist ?? []).map((item, index) => ({
    id: `${id}-step-${index + 1}`,
    label: typeof item === 'string' ? item : item.label,
    done:
      resolvedStatus === 'done'
      || (typeof item !== 'string' && item.done === true),
  })),
  created: kitchenDemoCreated(
    identity,
    `${serviceDate}T07:00:00.000Z`
  ),
  updated: kitchenDemoUpdated(`${serviceDate}T08:00:00.000Z`),
  }
}

export type DemoRecipeMiseTaskInput = {
  identity: KitchenDemoIdentity
  minutes: number
  priority?: KitchenMiseTask['priority']
  recipeId: string
  stage: KitchenMiseTask['workflow_stage']
  station: string
  status?: KitchenMiseTask['status']
  title: string
}

export const recipeMiseTask = (
  input: DemoRecipeMiseTaskInput
): KitchenMiseTask => {
  const status = input.status ?? 'todo'
  const completedSteps = status === 'done'
    ? 3
    : status === 'in_progress'
      ? 1
      : 0

  return miseTask(
    input.identity,
    `batch-${input.recipeId}`,
    input.title,
    input.station,
    status,
    input.priority ?? 'normal',
    input.minutes,
    {
      recipeId: input.recipeId,
      workflowStage: input.stage,
      description: 'Prepare one labelled service batch from the linked recipe.',
      checklist: [
        { label: 'Weigh and check ingredients', done: completedSteps >= 1 },
        { label: 'Follow the batch method', done: completedSteps >= 2 },
        { label: 'Label, date and store', done: completedSteps >= 3 },
      ],
    }
  )
}
