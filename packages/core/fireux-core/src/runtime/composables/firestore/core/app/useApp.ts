import { useFireUXConfig } from '../../../FireUXConfig'
import { useFetchApp } from './useFetchApp'
import { useAppComputed } from './useAppComputed'
import { useAppEnsure } from './useAppEnsure'
import { useAppUpdate } from './useAppUpdate'
import { useAppUsers } from './subcollections/useAppUsers'

export function useApp() {
  const { appId } = useFireUXConfig()
  const { app } = useFetchApp(appId)
  const { appUsers } = useAppUsers()
  return {
    app,
    appUsers,
    ...useAppComputed(app),
    ...useAppEnsure(),
    ...useAppUpdate(app),
  }
}
