import { readonly, ref, shallowRef } from 'vue'

/** Shared publication lifecycle. The domain supplies its authorized command. */
export function usePublish() {
  const publishing = ref(false)
  const publishError = shallowRef<unknown>(null)

  async function publish<Result>(command: () => Promise<Result>): Promise<Result> {
    if (publishing.value) throw new Error('Publication is already in progress.')
    publishing.value = true
    publishError.value = null
    try {
      return await command()
    } catch (cause) {
      publishError.value = cause
      throw cause
    } finally {
      publishing.value = false
    }
  }

  return {
    publish,
    publishing: readonly(publishing),
    publishError: readonly(publishError),
  }
}
