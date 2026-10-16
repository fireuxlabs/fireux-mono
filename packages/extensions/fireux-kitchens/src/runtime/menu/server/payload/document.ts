import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readKitchenPublicOfferings } from '../../../kitchen/utils/public-offerings'
import type {
  MenuDetailPayload,
  MenuDocumentFileKind,
} from '../../models/menu-detail.model'
import {
  compactMenuFile,
  hasMenuFile,
  menuFileKind,
  readMenuDocumentKind,
  readMenuFile,
} from './file'
import { menuPayloadPresentation } from './presentation'
import type { MenuPayloadScope } from './types'
export function buildMenuDocumentPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): MenuDetailPayload {
  const file = readMenuFile(data)
  const fileKind = menuFileKind({
    file,
    storedKind: readMenuDocumentKind(data),
  }) as MenuDocumentFileKind
  return {
    kind: 'document',
    document: {
      ...(data.audience === 'private_link'
        ? { audience: 'private_link' as const }
        : {}),
      id: menuId,
      name: readRecordString(data, 'name') || menuId,
      description: readRecordString(data, 'description'),
      ...(scope.kitchenId
        ? {
            offerings: readKitchenPublicOfferings(
              scope.kitchen_offerings,
              scope.kitchenMenuId || ''
            ),
          }
        : {}),
      ...menuPayloadPresentation(data, scope, Boolean(scope.kitchenId)),
      fileKind,
      ...(hasMenuFile(file) ? { file: compactMenuFile(file) } : {}),
    },
  }
}
