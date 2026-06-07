import { useState } from '#imports'

export function useMiseboxTenantChrome() {
  const chromeHidden = useState<boolean>(
    'misebox:tenant:chrome-hidden',
    () => false
  )

  const setChromeHidden = (value: boolean) => {
    chromeHidden.value = value
  }

  return {
    chromeHidden,
    setChromeHidden,
  }
}
