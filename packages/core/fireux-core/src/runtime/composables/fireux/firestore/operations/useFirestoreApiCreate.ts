import { refreshNuxtData } from 'nuxt/app'
type FirestoreApiCreateOptions = {
  query?: Record<string, unknown>
  headers?: HeadersInit
}

export function useFirestoreApiCreate() {
  async function createDocument<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options: FirestoreApiCreateOptions = {}
  ) {
    return await $fetch<TResponse, string, 'POST'>(endpoint, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: 'POST',
      body: body as any,
      query: options.query,
      headers: options.headers,
    })
  }

  return {
    createDocument,
  }
}
