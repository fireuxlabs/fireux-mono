import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
  preview_base_url: '',
  preview_path_suffix: '',
  result_base_url: '',
  powered_by: {
    name: 'Go QR',
    url: 'https://go-qr.web.app',
    logo_url: 'https://go-qr.web.app/img/app/logo.svg',
  },
}))
