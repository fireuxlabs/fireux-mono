import type { User } from 'firebase/auth'
import type { CurrentAppContextResponse } from '../models/app-context.model.ts'

export const CURRENT_APP_CONTEXT_ASYNC_DATA_KEY = 'current-app-context'

type CurrentAppContextUser = Pick<User, 'getIdToken' | 'uid'>

export async function fetchCurrentAppContext(
  user: CurrentAppContextUser
): Promise<CurrentAppContextResponse> {
  const token = await user.getIdToken()
  const response = await $fetch<CurrentAppContextResponse>(
    '/api/internal/app/context',
    {
      headers: { authorization: `Bearer ${token}` },
    }
  )

  if (
    response.ok !== true ||
    !response.appId ||
    (response.membership !== null &&
      (!response.membership || response.membership.id !== user.uid))
  ) {
    throw new Error('Current App context returned an invalid response.')
  }

  return response
}
