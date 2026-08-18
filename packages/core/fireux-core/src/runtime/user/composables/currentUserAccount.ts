import type { User } from 'firebase/auth'
import type {
  CurrentUserAccountResponse,
} from '../models/user-account.model.ts'

type CurrentUserAccountUser = Pick<User, 'getIdToken' | 'uid'>

export const CURRENT_USER_ACCOUNT_ASYNC_DATA_KEY = 'current-user-account'

export async function fetchCurrentUserAccount(
  user: CurrentUserAccountUser
): Promise<CurrentUserAccountResponse> {
  const token = await user.getIdToken()
  const response = await $fetch<CurrentUserAccountResponse>(
    '/api/internal/user/account',
    { headers: { authorization: `Bearer ${token}` } }
  )

  if (
    response.ok !== true ||
    (response.account !== null && response.account.id !== user.uid)
  ) {
    throw new Error('Current User account returned an invalid response.')
  }

  return response
}
