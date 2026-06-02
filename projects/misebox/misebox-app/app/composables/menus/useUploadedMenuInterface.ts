export type UploadedMenuSummary = {
  id: string
  slug: string
  name: string
  description: string
  status: string
  doc_name: string
  doc_type: string
  path: string
  qr_path: string
}

export type UploadedMenuCard = {
  id: string
  to: string
  qrTo: string
  title: string
  description: string
  meta: string
  status: string
}

/**
 * App-local uploaded menu document UI shape.
 *
 * This is intentionally not `useMenuInterface().light`: Kitchen `Menu` owns the
 * Kitchen Console/public menu stack, while uploaded menu documents are a thin
 * `/menus/**` link tool in the Misebox app.
 */
const displayDescription = (menu: UploadedMenuSummary) => {
  if (menu.description) return menu.description
  if (menu.doc_name) return menu.doc_name
  return 'Uploaded menu document.'
}

export function useUploadedMenuInterface() {
  function card(menu: UploadedMenuSummary): UploadedMenuCard | null {
    if (!menu.id || !menu.path) return null

    return {
      id: menu.id,
      to: menu.path,
      qrTo: menu.qr_path,
      title: menu.name,
      description: displayDescription(menu),
      meta: menu.doc_type,
      status: menu.status,
    }
  }

  return {
    card,
  }
}
