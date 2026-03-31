import { computed } from 'vue'
import { useRuntimeConsoleBase } from '../console/useRuntimeConsoleBase'
import { useFireUXConfig } from '../FireUXConfig'
import { useConsoleEntryState } from '../ui/useConsoleEntryState'
import { useFirestoreRead } from '../../firestore/operations/useFirestoreRead'
import { useProjectInterface } from '../../firestore/system/project/utils/view/useProjectInterface'
import { useUser } from '../../firestore/core/user/useUser'
import type { ConsoleProject, Project } from '../../../models/system/project.model'
import { getReadOnlyProjectScenarios } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'
import { useRuntimeProject } from './useRuntimeProject'

const normalizeString = (value: unknown): string => String(value || '').trim()

export function useRuntimeProjectOverview() {
  const runtime = useRuntimeProject()
  const { appId } = useFireUXConfig()
  const { uid } = useConsoleEntryState()
  const { canOwnMultipleConsoles } = useUser()
  const { setRuntimeProject } = useRuntimeProjectSelection()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { interface: projectInterface } = useProjectInterface()
  const projectSource = firestoreFetchCollection<Project>('projects')
  const projectOverlays = appId
    ? firestoreFetchCollection<ConsoleProject>(`apps/${appId}/projects`)
    : null
  const readOnlyScenarios = computed(() => getReadOnlyProjectScenarios())

  const accessibleProjectIds = computed(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return new Set<string>()

    const ids = new Set<string>()

    for (const overlay of projectOverlays?.value ?? []) {
      const id = normalizeString((overlay as any)?.id)
      if (!id) continue
      if ((overlay as any)?.console_enabled === false) continue

      const adminIds = Array.isArray((overlay as any)?.admin_ids)
        ? (overlay as any).admin_ids
            .map((value: unknown) => normalizeString(value))
            .filter(Boolean)
        : []

      if (adminIds.includes(currentUid)) {
        ids.add(id)
      }
    }

    for (const entry of projectSource.value ?? []) {
      const id = normalizeString((entry as any)?.id)
      const ownerUserId = normalizeString((entry as any)?.owner_user_id)
      if (id && ownerUserId === currentUid) {
        ids.add(id)
      }
    }

    return ids
  })

  const ownedProjects = computed(() =>
    (projectSource.value ?? []).filter((entry) =>
      accessibleProjectIds.value.has(normalizeString((entry as any)?.id))
    )
  )

  const ownedProjectPills = computed(() =>
    ownedProjects.value
      .map((entry) => projectInterface(entry))
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const readOnlyProjectPills = computed(() =>
    readOnlyScenarios.value
      .map((entry) =>
        projectInterface({
          ...(entry.project ?? {}),
          id: entry.id,
        } as Project)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const selection = useRuntimeConsoleBase({
    runtime,
    owned: ownedProjects,
    readOnly: readOnlyScenarios,
    canOwnMultiple: canOwnMultipleConsoles,
    ownedId: (entry) => normalizeString((entry as any)?.id),
    readOnlyId: (entry) => normalizeString(entry.id),
    ownedItem: (entry) => entry,
    readOnlyItem: (entry) => entry.project ?? null,
  })

  const activeProject = selection.activeItem
  const activeProjectPill = computed(() =>
    activeProject.value ? projectInterface(activeProject.value as Project) : null
  )

  const ownershipPending = computed(
    () =>
      projectSource.value === undefined ||
      (Boolean(appId) && projectOverlays?.value === undefined)
  )

  const setActiveOwnedProject = (projectId: string) => {
    const resolvedId = normalizeString(projectId)
    if (!resolvedId) return
    setRuntimeProject({
      projectId: resolvedId,
      mode: runtime.isReadOnly.value ? 'read-only' : 'live',
    })
  }

  return {
    runtime,
    ownedProjects,
    ownedProjectPills,
    readOnlyScenarios,
    readOnlyProjectPills,
    activeProject,
    activeProjectPill,
    hasActiveProject: selection.hasActiveItem,
    canOwnMultipleConsoles,
    canSelectMultipleLive: selection.canSelectMultipleLive,
    canSelectMultipleReadOnly: selection.canSelectMultipleReadOnly,
    showSelector: selection.showSelector,
    isOperatorOverview: selection.isOperatorOverview,
    ownershipPending,
    setActiveOwnedProject,
  }
}
