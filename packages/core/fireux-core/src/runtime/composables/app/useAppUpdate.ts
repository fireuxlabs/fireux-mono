// ~/composables/app/useAppUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Ref } from 'vue'

import type { AppDoc } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { validateAppField } from './utils/useAppValidation'
import { formatAppField } from './utils/useAppFormatting'
import type { AppSocialLinks } from './utils/useAppValidation'
import { useRequireUser } from '../auth/useRequireUser'

export function useAppUpdate(app: Ref<AppDoc | null | undefined>) {
  const db = useFirestore()
  const { appId: fallbackAppId } = useFireUXConfig()
  const { setDocument, deleteDocument } = useFirestoreManager()

  const resolveId = () => app.value?.id || fallbackAppId
  const requireId = () => {
    const id = resolveId()
    if (!id) throw new Error('No app id available.')
    return id
  }

  async function updateAppField2(field: string, value: any) {
    const id = requireId()
    await updateDoc(doc(db, 'apps', id), { [field]: value })
    return { success: true }
  }

  async function updateAppField(field: string, value: any) {
    const user = await useRequireUser()
    if (!user) throw new Error('User not authenticated')

    const validationError = validateAppField(field, value)
    if (validationError) throw new Error(validationError)

    const formattedValue = formatAppField(field, value)
    const id = requireId()
    await updateDoc(doc(db, 'apps', id), { [field]: formattedValue })
    return { success: true }
  }

  const updateDescription = (description: string) =>
    updateAppField('description', description)
  const updateAdmins = (adminIds: string[]) =>
    updateAppField('admin_ids', adminIds)
  const updateSocialLinks = (socialLinks: AppSocialLinks) =>
    updateAppField('social_links', socialLinks)

  async function profileToAppAction(
    action: 'add' | 'remove',
    subcollection: string,
    id: string | number,
    data?: any
  ) {
    const appId = requireId()
    if (action === 'add') {
      if (!data) throw new Error('Data is required for add action')
      await setDocument(`apps/${appId}/${subcollection}`, String(id), data)
      return { success: true, action: 'add' }
    }

    await deleteDocument(`apps/${appId}/${subcollection}`, String(id))
    return { success: true, action: 'remove' }
  }

  return {
    updateDescription,
    updateAdmins,
    updateSocialLinks,
    updateAppField,
    updateAppField2,
    profileToAppAction,
  }
}
