type Gsap = (typeof import('gsap'))['gsap']

export function animateLandingStickySurfaces(
  gsap: Gsap,
  root: HTMLElement
) {
  const pricing = root.querySelector<HTMLElement>('.landing-pricing-strip')
  if (!pricing) return

  const operationRail = root.parentElement?.querySelector<HTMLElement>(
    '.landing-operation-rail'
  )
  const header = document.querySelector<HTMLElement>(
    '[data-fireux-header-root]'
  )
  const details = [
    ...pricing.querySelectorAll<HTMLElement>('[data-landing-pricing-detail]'),
  ]
  const plans = [
    ...pricing.querySelectorAll<HTMLElement>('[data-landing-pricing-plan]'),
  ]

  const chromeExit = gsap.timeline({
    scrollTrigger: {
      trigger: pricing,
      start: 'top 55%',
      end: 'top 64px',
      scrub: 0.65,
    },
  })
  if (header) {
    chromeExit.to(
      header,
      { autoAlpha: 0, ease: 'none', yPercent: -110 },
      0
    )
  }
  if (operationRail) {
    chromeExit.to(
      operationRail,
      { autoAlpha: 0, ease: 'none', yPercent: -110 },
      0.12
    )
  }
  chromeExit.to(pricing, { ease: 'none', top: 0 }, 0.2)

  gsap.fromTo(
    pricing,
    { autoAlpha: 1, yPercent: 0 },
    {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: pricing,
        start: 'top -96px',
        end: '+=24%',
        scrub: 0.45,
      },
      yPercent: -110,
    }
  )

  if (!details.length) return
  const compactPricing = gsap.timeline({
    scrollTrigger: {
      trigger: pricing,
      start: 'top 32%',
      end: 'top 0px',
      scrub: 0.65,
    },
  })
  compactPricing
    .fromTo(
      details,
      { height: (_, detail) => detail.scrollHeight },
      {
        autoAlpha: 0,
        duration: 0.42,
        ease: 'power2.inOut',
        filter: 'blur(4px)',
        height: 0,
        marginTop: 0,
        transformOrigin: 'top',
        y: -8,
      },
      0
    )
    .to(
      plans,
      {
        duration: 0.55,
        ease: 'power2.inOut',
        paddingBottom: 8,
        paddingTop: 8,
        rowGap: 0,
      },
      0.18
    )
    .to(
      pricing,
      {
        duration: 0.5,
        ease: 'power2.inOut',
        paddingBottom: 8,
        paddingTop: 8,
      },
      0.24
    )
}
