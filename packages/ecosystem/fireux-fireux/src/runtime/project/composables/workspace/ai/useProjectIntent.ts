import { useRoute } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'

export function useProjectIntent() {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const { selectedId } = useWorkspace('project')
  const route = useRoute()
  const captureIntent = useCommandScope([
    currentUser,
    session.appUser,
    selectedId,
    () => config.appId,
    () => route.fullPath,
  ])

  async function request<T>(body: Record<string, unknown>): Promise<T> {
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    // Match the JSON transport before credentials can yield to another context.
    const payload = JSON.parse(JSON.stringify(body)) as Record<string, unknown>
    const obsolete = () =>
      new Error('Project AI context changed. Send your request again.')
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const token = await Promise.race([
        useRequireUser().then((user) => {
          if (!isCurrent() || user.uid !== uid) throw obsolete()
          return user.getIdToken()
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(new Error('Sign-in verification timed out. Try again.')),
            10_000
          )
        }),
      ])
      if (!isCurrent()) throw obsolete()
      const result = await $fetch<T>('/api/workspace/project/intent', {
        method: 'POST',
        timeout: 60_000,
        retry: 0,
        headers: { authorization: `Bearer ${token}` },
        body: payload,
      })
      if (!isCurrent()) throw obsolete()
      return result as T
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
  return { request }
}
