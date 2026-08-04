import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
import { interlakenPublicCopyEntries } from './content/sproochli-copy-public.ts'

const defaultCopy = (
  key:
    | 'app_meta_headline'
    | 'app_meta_positioning'
    | 'app_meta_promise'
    | 'app_meta_console_bridge'
    | 'app_meta_seo_description'
) => {
  const copy = interlakenPublicCopyEntries[key].translations.gsw

  if (!copy || copy.status !== 'approved')
    throw new Error(`Missing approved Swiss German app meta copy: ${key}`)

  return copy.text
}

export const metaContent = defineFireuxMeta({
  app: {
    id: 'interlaken-essen',
    name: 'Interlaken Essen',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Interlaken Essen',
    headline: defaultCopy('app_meta_headline'),
    positioning_html: defaultCopy('app_meta_positioning'),
    promise_html: defaultCopy('app_meta_promise'),
    console_bridge_html: defaultCopy('app_meta_console_bridge'),
  },
  seo: {
    title: 'Interlaken Essen',
    description: defaultCopy('app_meta_seo_description'),
  },
})
