import { defineEventHandler } from 'h3'
import { goQrProviderBaseUrl } from '../../utils/goQrProvider'
import { menuQrPublicBaseUrl, reservedMenuQrSlugs } from '../../utils/menuQrDocuments'

type GoQrToolContract = {
  ok: boolean
  provider: {
    id: string
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
}

const menuQrConsumerConfig = {
  resourceName: 'menu',
  displayLabel: 'Food Menu',
  qrCentreLabel: 'Menu',
  slugPlaceholder: 'my-restaurant-menu',
  description: 'Create a scannable Food Menu QR page from a finished menu file.',
  acceptedFileTypes: ['application/pdf', '.doc', '.docx'],
  uploadDescription: 'PDF, DOC, or DOCX. Max 10 MB.',
  storageOwner: 'misebox',
}

function sentenceCase(value: string) {
  return value ? `${value.slice(0, 1).toUpperCase()}${value.slice(1)}` : value
}

function menuToolConfig(contract: GoQrToolContract, providerBaseUrl: string) {
  const resource = menuQrConsumerConfig.resourceName
  const resourceTitle = sentenceCase(resource)
  const pathLabel = `${resourceTitle} URL`

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
      reserved: reservedMenuQrSlugs,
      taken_message: `This ${resource} URL is already taken.`,
    },
    ui: {
      ...contract.ui,
      title: `Upload a ${resource}. Get a QR code.`,
      description: menuQrConsumerConfig.description,
      upload_label: `Upload your ${resource}`,
      cta_label: `Create ${resource} QR`,
      loading_label: `Creating ${resource} QR...`,
      success_title: `Your ${resource} QR is ready`,
      open_target_label: `Open ${resource}`,
      open_qr_label: 'Open QR page',
    },
    preview: {
      base_url: menuQrPublicBaseUrl(),
      path_suffix: '/qr',
    },
    consumer_config: menuQrConsumerConfig,
  }
}

export default defineEventHandler(async () => {
  const goQrBaseUrl = goQrProviderBaseUrl()
  const contract = await $fetch<GoQrToolContract>(`${goQrBaseUrl}/api/tools/public-doc`)

  return menuToolConfig(contract, goQrBaseUrl)
})
