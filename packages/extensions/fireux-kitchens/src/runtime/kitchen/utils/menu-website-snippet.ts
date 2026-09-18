import { menuRoutePath, type MenuRouteScope } from './kitchen-menu-route.ts'
import type { KitchenService } from '../models/service.model'
import type { KitchenMenu } from '../../menu/models/kitchen-menu.model'

export const websiteOrderContexts = [
  'browse',
  'collection',
  'delivery',
  'pre_order',
] as const
export type WebsiteOrderContext = (typeof websiteOrderContexts)[number]

/** Keep previews local; published buttons use the App's configured customer site. */
export function menuWebsiteOrigin(requestOrigin: string, siteUrl?: string) {
  try {
    const request = new URL(requestOrigin)
    if (request.hostname === 'workspace.localhost') {
      request.hostname = 'localhost'
      return request.origin
    }
    if (['localhost', '127.0.0.1', '[::1]'].includes(request.hostname))
      return request.origin
    return new URL(siteUrl || requestOrigin).origin
  } catch {
    return ''
  }
}

export function availableWebsiteInteractions(
  menu: Pick<KitchenMenu, 'id' | 'status' | 'doc'>,
  service: KitchenService
) {
  if (
    menu.status !== 'published' ||
    !service.enabled ||
    !service.menu_ids.includes(menu.id)
  )
    return []
  return websiteOrderContexts.filter((context) =>
    service.interactions.some(
      (row) =>
        row.type === context &&
        row.enabled &&
        (row.type === 'browse' ||
          (row.availability?.paused !== true &&
            !menu.doc?.url.trim() &&
            Boolean(service.hours?.timezone && service.hours.windows.length)))
    )
  )
}

export function menuWebsiteOrderUrl(input: {
  origin: string
  scope: MenuRouteScope
  menuId: string
  context: WebsiteOrderContext
  serviceId: string
}) {
  if (!websiteOrderContexts.includes(input.context) || !input.serviceId?.trim())
    return ''
  try {
    const origin = new URL(input.origin)
    if (
      !['https:', 'http:'].includes(origin.protocol) ||
      origin.username ||
      origin.password
    )
      return ''
    if (
      origin.protocol === 'http:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
    )
      return ''
    const path = menuRoutePath({
      ...input,
      context: input.context === 'browse' ? 'generic' : input.context,
    })
    return path ? new URL(path, origin.origin).href : ''
  } catch {
    return ''
  }
}

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&#39;')

export function menuWebsiteSnippet(
  url: string,
  label: 'Order now' | 'View Menu' = 'Order now'
) {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return ''
  }
  if (
    !['https:', 'http:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  )
    return ''
  if (
    parsed.protocol === 'http:' &&
    !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  )
    return ''
  const target = escapeAttribute(parsed.href)
  return `<div data-misebox-ordering>
  <a href="${target}" target="_blank" rel="noopener" style="display:inline-block;padding:calc(var(--spacing, 0.25em) * 3) calc(var(--spacing, 0.25em) * 5);border-radius:8px;background:#17201a;color:white;text-decoration:none;font:600 16px system-ui">${escapeAttribute(label)}</a>
  <dialog aria-label="${label === 'View Menu' ? 'View Menu' : 'Order from this menu'}" style="box-sizing:border-box;width:min(960px,96vw);max-width:96vw;height:92dvh;max-height:92dvh;padding:0;border:0;border-radius:12px;background:white">
    <form method="dialog" style="height:48px;display:flex;align-items:center;justify-content:flex-end;padding:0 calc(var(--spacing, 0.25em) * 3)">
      <button aria-label="${label === 'View Menu' ? 'Close Menu' : 'Close ordering'}" style="padding:calc(var(--spacing, 0.25em) * 2) calc(var(--spacing, 0.25em) * 4);font:600 16px system-ui;cursor:pointer">Close</button>
    </form>
    <iframe data-src="${target}" title="Menu and checkout" style="display:block;width:100%;height:calc(100% - 48px);border:0"></iframe>
  </dialog>
</div>
<script>
(function () {
  var root = document.currentScript.previousElementSibling;
  var link = root.querySelector('a');
  var dialog = root.querySelector('dialog');
  var frame = root.querySelector('iframe');
  link.addEventListener('click', function (event) {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    if (!frame.hasAttribute('src')) frame.src = frame.getAttribute('data-src');
    dialog.showModal();
  });
})();
</script>`
}
