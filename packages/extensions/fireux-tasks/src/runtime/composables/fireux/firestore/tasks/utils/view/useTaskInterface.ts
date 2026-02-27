import type { Task } from '../../../../../../models/task.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace TaskCard {
  export type Card = {
    id: string
    title: string
    subtitle: string
    status: Task['status']
    to: string
  }
}

export function useTaskInterface() {
  function card(target?: Task | null | undefined): TaskCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const due = safeString(target.due_date)

    return {
      id,
      title: safeString(target.title) || id,
      subtitle:
        [safeString(target.source), due ? `due ${due}` : '', safeString(target.linked_entity_type)]
          .filter(Boolean)
          .join(' · ') || 'No task metadata',
      status: target.status,
      to: '/console/portfolio/tasks',
    }
  }

  function searchText(target: Task): string {
    return [
      target.id,
      target.title,
      target.description,
      target.source,
      target.due_date,
      target.linked_entity_type,
      target.linked_entity_id,
    ]
      .map((value) => safeString(value))
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    card,
    searchText,
  }
}
