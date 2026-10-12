import type { AvatarProps } from '@nuxt/ui'
import { placeIdentityMedia } from 'fireux-places/runtime/place/utils/place-identity-media'
import type { KitchenSurface } from '../models/kitchen-interface.model'

/** Workspace identity consumes Place brand media without changing photo roles. */
export function kitchenWorkspaceAvatar(
  kitchen?: KitchenSurface | null
): AvatarProps {
  const media = placeIdentityMedia({
    logo_image: kitchen?.logo_image || kitchen?.logo_image_url,
    image_url: kitchen?.display_image_url || kitchen?.image_url,
    media_backdrop_color: kitchen?.media_backdrop_color,
  })
  return {
    src: media.imageUrl || undefined,
    alt: kitchen?.display_name || kitchen?.name || kitchen?.id || 'Kitchen',
    icon: 'i-lucide-chef-hat',
    ...(media.imageFit === 'contain'
      ? {
          class: 'rounded-md overflow-hidden',
          style: media.imageBackground
            ? { backgroundColor: media.imageBackground }
            : undefined,
          ui: { image: 'object-contain p-0.5' },
        }
      : {}),
  }
}
