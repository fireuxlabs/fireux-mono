import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'bangin-coffee',
    name: 'Bangin Coffee',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Bangin Coffee',
    headline: 'Mobile coffee bar for events.',
    positioning_html:
      'Bangin Coffee is a Misebox tenant app for a mobile coffee and event bar.',
    promise_html:
      'Present the bar clearly today, then add the right Misebox entity layer when the coffee workflow is confirmed.',
    console_bridge_html:
      'Tenant operations can be connected once the Bangin Coffee entity family is agreed.',
  },
  seo: {
    title: 'Bangin Coffee',
    description:
      'Mobile coffee bar serving in-house roasted coffee for weddings, corporate events, festivals, and private parties.',
  },
})
