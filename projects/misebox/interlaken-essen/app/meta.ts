import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'
import { interlakenPublicCopyEntries } from './content/sproochli-copy-public.ts'

const defaultCopy = (
  key:
    | 'app_meta_headline'
    | 'app_meta_positioning'
    | 'app_meta_promise'
    | 'app_meta_console_bridge'
    | 'app_meta_seo_description'
) => interlakenPublicCopyEntries[key].target_text

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
