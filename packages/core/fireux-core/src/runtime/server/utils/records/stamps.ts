import { FieldValue } from 'firebase-admin/firestore'

export type ServerAuditStampOptions = {
  by: string
  appId?: string
}

export const serverTimestamp = () => FieldValue.serverTimestamp()

export function serverAuditStamp(options: ServerAuditStampOptions) {
  return {
    at: serverTimestamp(),
    by: options.by,
    ...(options.appId ? { app_id: options.appId } : {}),
  }
}
