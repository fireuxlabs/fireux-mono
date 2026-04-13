import type { Task } from '../../../../../../models/task.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace TaskCard {
  export type Card = {
    id: string
    imageUrl: string
    title: string
    subtitle: string
    meta: string
    status: Task['status']
    badges: string[]
    summary: string
    to: string
  }
}

export function useTaskInterface() {
  type TaskPill = TaskCard.Card
  type TaskCell = TaskCard.Card
  type TaskPreview = TaskCard.Card
  type TaskProfile = TaskCard.Card

  function buildInterface(target?: Task | null | undefined): TaskCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const due = safeString(target.due_date)

    return {
      id,
      imageUrl: '',
      title: safeString(target.title) || id,
      subtitle:
        [safeString(target.source), due ? `due ${due}` : '', safeString(target.linked_entity_type)]
          .filter(Boolean)
          .join(' · ') || 'No task metadata',
      meta: due ? `due ${due}` : '',
      status: target.status,
      badges: [],
      summary: safeString(target.description),
      to: '/console/portfolio/tasks',
    }
  }

  function pill(target?: Task | null | undefined): TaskPill | null {
    return buildInterface(target)
  }

  function cell(target?: Task | null | undefined): TaskCell | null {
    return buildInterface(target)
  }

  function preview(target?: Task | null | undefined): TaskPreview | null {
    return buildInterface(target)
  }

  function profile(target?: Task | null | undefined): TaskProfile | null {
    return buildInterface(target)
  }

  return { pill, cell, preview, profile }
}
