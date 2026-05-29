import { defineEventHandler } from 'h3'
import { goQrProviderBaseUrl } from '../../utils/goQrProvider'
import {
  miseboxPublicBaseUrl,
  publicMenuBaseUrl,
  reservedPublicMenuSlugs,
} from '../../utils/menuPublicRecords'

type GoQrToolContract = {
  ok: boolean
  provider: {
    id: string
    name?: string
    url?: string
    logo_url?: string
    app_info_url: string
    base_url: string
  }
  tool: {
    id: string
    name: string
    upload_type: string
    accepts: string[]
    max_file_size_mb: number
    anonymous_max_creates: number
    result: {
      target_path_pattern: string
      qr_path_pattern: string
      label: string
    }
  }
  endpoints: {
    availability: string
    create: string
    app_info: string
  }
  slug: {
    label: string
    validation_label: string
    placeholder: string
    reserved: string[]
    taken_message: string
  }
  ui: {
    title: string
    description: string
    upload_label: string
    cta_label: string
    loading_label: string
    success_title: string
    open_target_label: string
    open_qr_label: string
  }
  preview: {
    base_url: string
    path_suffix: string
  }
  result_base_url?: string
}

const menuQrConsumerConfig = {
  resourceName: 'menu',
  displayLabel: 'QR Menu',
  qrCentreLabel: 'Menu',
  slugPlaceholder: 'my-restaurant-menu',
  description: 'Upload a menu, choose a short path, and get a QR menu.',
  acceptedFileTypes: ['application/pdf', '.doc', '.docx'],
  uploadDescription: 'PDF, DOC, or DOCX. Max 10 MB.',
  storageOwner: 'misebox',
}

function fallbackDocToolContract(providerBaseUrl: string): GoQrToolContract {
  return {
    ok: true,
    provider: {
      id: 'go-qr',
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: `${providerBaseUrl}/img/app/logo.png`,
      app_info_url: '/api/brand',
      base_url: providerBaseUrl,
    },
    tool: {
      id: 'doc',
      name: 'Doc',
      upload_type: 'doc',
      accepts: ['application/pdf', 'image/*', '.doc', '.docx'],
      max_file_size_mb: 10,
      anonymous_max_creates: 1,
      result: {
        target_path_pattern: '/:slug',
        qr_path_pattern: '/:slug/qr',
        label: 'Doc',
      },
    },
    endpoints: {
      availability: '/api/tools/doc/availability',
      create: '/api/tools/doc/create',
      app_info: '/api/brand',
    },
    slug: {
      label: 'Document path',
      validation_label: 'Document path',
      placeholder: 'my-doc',
      reserved: [],
      taken_message: 'This doc path is already taken.',
    },
    ui: {
      title: 'Upload a doc. Get a QR code.',
      description: 'Turn a doc into a shareable QR page.',
      upload_label: 'Upload your doc',
      cta_label: 'Create QR code',
      loading_label: 'Creating QR doc...',
      success_title: 'Your QR doc is ready',
      open_target_label: 'Open doc',
      open_qr_label: 'Open QR page',
    },
    preview: {
      base_url: providerBaseUrl,
      path_suffix: '/qr',
    },
  }
}

function sentenceCase(value: string) {
  return value ? `${value.slice(0, 1).toUpperCase()}${value.slice(1)}` : value
}

function menuToolConfig(contract: GoQrToolContract, providerBaseUrl: string) {
  const resource = menuQrConsumerConfig.resourceName
  const resourceTitle = sentenceCase(resource)
  const pathLabel = `${resourceTitle} path`

  return {
    ...contract,
    provider: {
      ...contract.provider,
      base_url: providerBaseUrl,
    },
    endpoints: {
      availability: '/api/menu-qr/availability',
      create: '/api/menus',
      app_info: '/api/menu-qr/brand',
    },
    tool: {
      ...contract.tool,
      accepts: menuQrConsumerConfig.acceptedFileTypes,
      result: {
        ...contract.tool.result,
        label: menuQrConsumerConfig.displayLabel,
      },
    },
    slug: {
      ...contract.slug,
      label: pathLabel,
      validation_label: pathLabel,
      placeholder: menuQrConsumerConfig.slugPlaceholder,
      reserved: reservedPublicMenuSlugs,
      taken_message: `This ${resource} path is already taken.`,
    },
    ui: {
      ...contract.ui,
      title: `Upload a ${resource}. Get a QR menu.`,
      description: menuQrConsumerConfig.description,
      upload_label: `Upload your ${resource}`,
      cta_label: 'Create QR menu',
      loading_label: 'Creating QR menu...',
      success_title: 'Your QR menu is ready',
      open_target_label: `Open ${resource}`,
      open_qr_label: 'Open QR page',
    },
    preview: {
      base_url: publicMenuBaseUrl(),
      path_suffix: '/qr',
    },
    result_base_url: miseboxPublicBaseUrl(),
    consumer_config: menuQrConsumerConfig,
  }
}

export default defineEventHandler(async () => {
  const goQrBaseUrl = goQrProviderBaseUrl()
  const contract = await $fetch<GoQrToolContract>(`${goQrBaseUrl}/api/tools/doc`)
    .catch(() => fallbackDocToolContract(goQrBaseUrl))

  return menuToolConfig(contract, goQrBaseUrl)
})
