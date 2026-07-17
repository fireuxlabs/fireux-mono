import type { MenuManifestSection } from '../models/kitchen/menu/menu-detail.model'

export type MenuSectionLink = MenuManifestSection & {
  anchor: string
  headingId: string
}

export function menuSectionLinks(
  sections: MenuManifestSection[]
): MenuSectionLink[] {
  const anchors = new Set<string>()

  return sections.map((section, index) => {
    const slug = String(section.id || section.label || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const baseAnchor = `menu-section-${slug || `section-${index + 1}`}`
    let anchor = baseAnchor
    let collision = 2

    while (anchors.has(anchor)) {
      anchor = `${baseAnchor}-${collision}`
      collision += 1
    }
    anchors.add(anchor)

    return {
      ...section,
      anchor,
      headingId: `${anchor}-title`,
    }
  })
}
