import { useFireUXConfig } from '../../../FireUXConfig'
import { useAppFetch } from './main/useAppFetch'
import { useAppComputed } from './main/useAppComputed'
import { useAppEnsure } from './main/useAppEnsure'
import { useAppUpdate } from './main/useAppUpdate'
import { useAppUsers } from './subcollections/useAppUsers'

export function useApp() {
  const { appId } = useFireUXConfig()
  const { app } = useAppFetch(appId)
  const { appUsers } = useAppUsers()
  return {
    app,
    appUsers,
    ...useAppComputed(app),
    ...useAppEnsure(),
    ...useAppUpdate(app),
  }
}
