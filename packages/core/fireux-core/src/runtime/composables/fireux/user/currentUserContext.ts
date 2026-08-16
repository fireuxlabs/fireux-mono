import type { User } from 'firebase/auth'
import type {
  CurrentUserContextResponse,
  UpdateCurrentUserContextResponse,
} from '../../../models/operations/user-context.model'

type CurrentUserContextUser = Pick<User, 'getIdToken' | 'uid'>

export const CURRENT_USER_CONTEXT_ASYNC_DATA_KEY = 'current-user-context'

export async function fetchCurrentUserContext(
  user: CurrentUserContextUser
): Promise<CurrentUserContextResponse> {
  const token = await user.getIdToken()
  return $fetch<CurrentUserContextResponse>('/api/internal/user/context', {
    headers: { authorization: `Bearer ${token}` },
  })
}

export async function updateCurrentUserContext(
  user: CurrentUserContextUser,
  context: string
): Promise<UpdateCurrentUserContextResponse> {
  const token = await user.getIdToken()
  return $fetch<UpdateCurrentUserContextResponse>(
    '/api/internal/user/context',
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body: { context },
    }
  )
}
