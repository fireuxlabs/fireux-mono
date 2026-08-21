import {
  KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS,
  normalizeKitchenMisePriority,
  normalizeKitchenMiseStatus,
  normalizeKitchenMiseWorkflowStage,
  type KitchenMisePriority,
  type KitchenMiseStatus,
  type KitchenMiseTask,
  type KitchenMiseWorkflowStage,
} from './mise.model.ts'

export type KitchenMiseChecklistSummary = {
  done: boolean
  id: string
  label: string
}

export type KitchenMiseTaskSummary = {
  checklist: KitchenMiseChecklistSummary[]
  checklistDoneCount: number
  description: string
  estimatedMinutes: number
  id: string
  ingredientCount: number
  prepItemCount: number
  priority: KitchenMisePriority
  recipeId: string
  serviceDate: string
  station: string
  stationId: string
  status: KitchenMiseStatus
  title: string
  workflowStage: KitchenMiseWorkflowStage | ''
}

export type KitchenMiseWorkflowGroupValue =
  | KitchenMiseWorkflowStage
  | 'unsorted'

export type KitchenMiseTaskWorkflowGroup = {
  icon: string
  label: string
  tasks: KitchenMiseTaskSummary[]
  value: KitchenMiseWorkflowGroupValue
}

export type KitchenMiseTaskProjectionOptions = {
  stationNames?: Readonly<Record<string, string>>
}

const priorityRank: Record<KitchenMisePriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export const cleanKitchenMiseText = (value: unknown) =>
  String(value ?? '').trim()

export const kitchenMiseTitleCase = (value: unknown) => {
  const label = cleanKitchenMiseText(value).replaceAll(/[-_]+/g, ' ')
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
}

const positiveInteger = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0
}

const relationCount = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((item) => cleanKitchenMiseText(item))
    .filter(Boolean).length

const projectChecklist = (
  task: KitchenMiseTask
): KitchenMiseChecklistSummary[] =>
  task.checklist
    .map((item) => ({
      done: item.done === true,
      id: cleanKitchenMiseText(item.id),
      label: cleanKitchenMiseText(item.label),
    }))
    .filter((item) => item.id && item.label)

export const kitchenMisePriorityColor = (priority: KitchenMisePriority) => {
  if (priority === 'urgent') return 'error' as const
  if (priority === 'high') return 'warning' as const
  return 'neutral' as const
}

export const projectKitchenMiseTask = (
  task: KitchenMiseTask,
  options: KitchenMiseTaskProjectionOptions = {}
): KitchenMiseTaskSummary | null => {
  const id = cleanKitchenMiseText(task.id)
  if (!id) return null

  const stationId = cleanKitchenMiseText(task.station)
  const station =
    cleanKitchenMiseText(options.stationNames?.[stationId]) ||
    kitchenMiseTitleCase(stationId)
  const checklist = projectChecklist(task)

  return {
    checklist,
    checklistDoneCount: checklist.filter((item) => item.done).length,
    description: cleanKitchenMiseText(task.description),
    estimatedMinutes: positiveInteger(task.estimated_minutes),
    id,
    ingredientCount: relationCount(task.ingredient_ids),
    prepItemCount: relationCount(task.prep_item_ids),
    priority: normalizeKitchenMisePriority(task.priority),
    recipeId: cleanKitchenMiseText(task.recipe_id),
    serviceDate: cleanKitchenMiseText(task.service_date),
    station,
    stationId,
    status: normalizeKitchenMiseStatus(task.status),
    title: cleanKitchenMiseText(task.title) || 'Missing mise title',
    workflowStage: normalizeKitchenMiseWorkflowStage(task.workflow_stage),
  }
}

export const projectKitchenMiseTasks = (
  tasks: readonly KitchenMiseTask[],
  options: KitchenMiseTaskProjectionOptions = {}
) =>
  tasks.flatMap((task) => {
    const summary = projectKitchenMiseTask(task, options)
    return summary ? [summary] : []
  })

export const groupKitchenMiseTaskSummariesByWorkflow = (
  tasks: readonly KitchenMiseTaskSummary[]
): KitchenMiseTaskWorkflowGroup[] => {
  const options = [
    ...KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS,
    {
      value: 'unsorted' as const,
      label: 'Unsorted',
      icon: 'i-lucide-inbox',
    },
  ]

  return options.flatMap((option) => {
    const stageTasks = tasks
      .filter((task) =>
        option.value === 'unsorted'
          ? !task.workflowStage
          : task.workflowStage === option.value
      )
      .sort((left, right) => {
        const priorityDelta =
          priorityRank[left.priority] - priorityRank[right.priority]
        return (
          priorityDelta ||
          left.title.localeCompare(right.title) ||
          left.id.localeCompare(right.id)
        )
      })

    return stageTasks.length
      ? [
          {
            ...option,
            value: option.value,
            tasks: stageTasks,
          },
        ]
      : []
  })
}

/**
 * Transitional alias for callers moving from the old status-first board.
 */
export const groupKitchenMiseTaskSummaries =
  groupKitchenMiseTaskSummariesByWorkflow
