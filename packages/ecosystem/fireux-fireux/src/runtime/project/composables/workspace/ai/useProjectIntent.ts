import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
export function useProjectIntent() {
  async function request<T>(body: Record<string, unknown>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const token = await Promise.race([
        useRequireUser().then((user) => user.getIdToken()),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(new Error('Sign-in verification timed out. Try again.')),
            10_000
          )
        }),
      ])
      return (await $fetch<T>('/api/workspace/project/intent', {
        method: 'POST',
        timeout: 60_000,
        retry: 0,
        headers: { authorization: `Bearer ${token}` },
        body,
      })) as T
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
  return { request }
}
