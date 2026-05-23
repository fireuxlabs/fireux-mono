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
    return await $fetch<TResponse>(endpoint, {
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
