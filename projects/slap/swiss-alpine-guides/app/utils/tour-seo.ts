import { buildAppLandingJsonLd, type FireuxSeoBuilderContext } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { operator } from '../content/operator'
import { tourPages, type TourPage } from '../content/tour-pages'

/** Project the same visible catalogue and contact facts through Core's SEO graph. */
export function buildTourJsonLd(context: FireuxSeoBuilderContext, page?: TourPage) {
  const base = buildAppLandingJsonLd({ appName: operator.name, canonicalUrl: context.canonicalUrl, description: context.description, image: context.image, language: 'en', title: context.title })
  if (!base || Array.isArray(base)) return null
  const graph = base['@graph'] as Record<string, unknown>[]
  const business = graph.find(item => item['@type'] === 'Organization')!
  Object.assign(business, {
    '@type': 'LocalBusiness', telephone: operator.telephone, email: operator.email,
    address: { '@type': 'PostalAddress', streetAddress: operator.streetAddress, postalCode: operator.postalCode, addressLocality: operator.addressLocality, addressCountry: operator.addressCountry },
  })
  const webpage = graph.find(item => item['@type'] === 'WebPage')!
  if (page) {
    const serviceId = `${context.canonicalUrl}#service`
    const breadcrumbsId = `${context.canonicalUrl}#breadcrumbs`
    Object.assign(webpage, { mainEntity: { '@id': serviceId }, breadcrumb: { '@id': breadcrumbsId } })
    graph.push({ '@type': 'Service', '@id': serviceId, name: page.name, description: page.description, url: context.canonicalUrl, provider: { '@id': `${context.origin}/#organization` } })
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbsId, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Heliskiing in Interlaken', item: `${context.origin}/` },
      { '@type': 'ListItem', position: 2, name: page.name, item: context.canonicalUrl },
    ] })
  } else {
    const listId = `${context.canonicalUrl}#tours`
    webpage.mainEntity = { '@id': listId }
    graph.push({ '@type': 'ItemList', '@id': listId, itemListElement: tourPages.map((tour, index) => ({ '@type': 'ListItem', position: index + 1, name: tour.name, url: context.absoluteUrl(tour.path) })) })
  }
  return base
}
