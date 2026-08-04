import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import { animateLandingStickySurfaces } from './landing-sticky-motion'
type LandingRootRef = Readonly<{
  value: HTMLElement | null
}>

type RevealDirection = 'left' | 'right' | 'scale' | 'up'
type Gsap = (typeof import('gsap'))['gsap']
type ScrollTriggerPlugin =
  (typeof import('gsap/ScrollTrigger'))['ScrollTrigger']
type GsapTween = ReturnType<Gsap['to']>
type GsapContext = ReturnType<Gsap['context']>
type GsapMatchMedia = ReturnType<Gsap['matchMedia']>
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
let gsapPromise:
  | Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerPlugin }>
  | undefined

function loadGsap() {
  gsapPromise ||= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).then(([gsapModule, scrollTriggerModule]) => ({
    gsap: gsapModule.gsap,
    ScrollTrigger: scrollTriggerModule.ScrollTrigger,
  }))
  return gsapPromise
}
function revealFrom(direction: RevealDirection) {
  if (direction === 'left') {
    return { autoAlpha: 0, filter: 'blur(6px)', x: -48, y: 0 }
  }
  if (direction === 'right') {
    return { autoAlpha: 0, filter: 'blur(6px)', x: 48, y: 0 }
  }
  if (direction === 'scale') {
    return { autoAlpha: 0, filter: 'blur(8px)', scale: 0.94, y: 20 }
  }
  return { autoAlpha: 0, filter: 'blur(4px)', y: 36 }
}
function revealDelay(element: HTMLElement) {
  const value = getComputedStyle(element)
    .getPropertyValue('--landing-reveal-delay')
    .trim()
  if (!value) return 0

  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return 0
  return value.endsWith('ms') ? amount / 1000 : amount
}
export function useLandingMotion(landingRoot: LandingRootRef) {
  const activeRevealObservers = new Set<IntersectionObserver>()
  const activeTweens = new Set<GsapTween>()
  let disposed = false
  let gsap: Gsap | null = null
  let heroContext: GsapContext | null = null
  let heroMedia: GsapMatchMedia | null = null
  let animationFrame = 0

  function animateImmersiveChapters(root: HTMLElement) {
    if (!gsap || !root.classList.contains('landing-product--immersive')) return

    const hero = root.querySelector<HTMLElement>('.landing-product__hero')
    const preview = root.querySelector<HTMLElement>(
      '[data-landing-hero-part="preview"]'
    )
    const copy = root.querySelector<HTMLElement>('.landing-product__hero-copy')
    const entities = [...root.querySelectorAll<HTMLElement>(
      '[data-landing-motion-entity]'
    )]
    const orbitSphere = root.querySelector<HTMLElement>('.landing-card-orbit__sphere')
    if (hero && preview && copy) {
      const handoff = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=85%',
          scrub: 1,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        },
      })
      handoff.to(copy, { autoAlpha: 0, scale: 0.78, xPercent: -28 }, 0)
      handoff.to(preview, { scale: 1.24, xPercent: -22, yPercent: 8 }, 0)
      if (entities.length) {
        handoff.to(entities, {
          autoAlpha: 0,
          ease: 'none',
          filter: 'blur(10px)',
          rotation: (index) => (index % 2 ? -18 : 18),
          scale: 1.45,
          stagger: 0.055,
          xPercent: (_, entity) =>
            entity.dataset.landingMotionEntity === 'app' ? 130 : -130,
          yPercent: (_, entity) =>
            entity.dataset.landingMotionEntity === 'app' ? 80 : -55,
        }, 0)
      }
      if (orbitSphere) {
        handoff.to(orbitSphere, { autoAlpha: 0, rotation: 90, scale: 1.8 }, 0)
      }
      handoff.to(preview, {
        autoAlpha: 0,
        duration: 0.3,
        filter: 'blur(10px)',
        overwrite: 'auto',
        scale: 1.42,
      }, 0.35)
      handoff.set(preview, { visibility: 'hidden' }, 0.66)
    }

  }

  function animateHero(root: HTMLElement) {
    if (!gsap) return

    const parts = [
      ...root.querySelectorAll<HTMLElement>('[data-landing-hero-part]'),
    ]
    if (!parts.length) return

    heroContext = gsap.context(() => {
      heroMedia = gsap!.matchMedia()
      heroMedia.add(
        {
          compact: '(width < 48rem) and (prefers-reduced-motion: no-preference)',
          desktop: '(width >= 48rem) and (prefers-reduced-motion: no-preference)',
          reduce: REDUCED_MOTION_QUERY,
        },
        (mediaContext) => {
          const { compact, desktop, reduce } = mediaContext.conditions as {
            compact: boolean
            desktop: boolean
            reduce: boolean
          }

          if (reduce) {
            parts.forEach(makeVisible)
            return
          }

          const part = (name: string) =>
            root.querySelector<HTMLElement>(
              `[data-landing-hero-part="${name}"]`
            )
          const copyParts = ['badge', 'heading', 'description', 'actions']
            .map(part)
            .filter((element): element is HTMLElement => Boolean(element))
          const supportingParts = ['quiet-action', 'trust']
            .map(part)
            .filter((element): element is HTMLElement => Boolean(element))
          const preview = part('preview')
          const timeline = gsap!.timeline({
            defaults: { ease: 'power3.out' },
          })

          timeline.fromTo(
            copyParts,
            { autoAlpha: 0, filter: 'blur(8px)', y: compact ? 24 : 42 },
            {
              autoAlpha: 1,
              duration: compact ? 0.68 : 0.86,
              filter: 'blur(0px)',
              stagger: compact ? 0.08 : 0.11,
              y: 0,
            }
          )

          if (preview) {
            timeline.fromTo(
              preview,
              {
                autoAlpha: 0,
                filter: 'blur(12px)',
                scale: compact ? 0.97 : 0.9,
                x: desktop ? 72 : 0,
              },
              {
                autoAlpha: 1,
                duration: compact ? 0.82 : 1.18,
                filter: 'blur(0px)',
                scale: 1,
                x: 0,
              },
              compact ? 0.16 : 0.08
            )
          }

          if (supportingParts.length) {
            timeline.fromTo(
              supportingParts,
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                duration: 0.58,
                stagger: 0.08,
                y: 0,
              },
              '-=0.52'
            )
          }

          animateLandingStickySurfaces(gsap!, root)
          if (desktop) animateImmersiveChapters(root)
        }
      )
    }, root)
  }

  function makeVisible(element: HTMLElement) {
    element.classList.add('is-reveal-visible')
    element.style.removeProperty('opacity')
    element.style.removeProperty('transform')
    element.style.removeProperty('filter')
    element.style.removeProperty('visibility')
    element.style.removeProperty('will-change')
  }

  function prepareWithGsap(
    element: HTMLElement,
    direction: RevealDirection
  ) {
    if (!gsap || element.classList.contains('is-reveal-visible')) return

    gsap.set(element, {
      ...revealFrom(direction),
      transformOrigin: 'center',
      willChange: 'opacity, transform, filter',
    })
  }

  function observeReveal(
    element: HTMLElement,
    direction: RevealDirection = 'up'
  ) {
    element.dataset.reveal = direction

    if (
      window.matchMedia(REDUCED_MOTION_QUERY).matches ||
      !('IntersectionObserver' in window)
    ) {
      makeVisible(element)
      return
    }

    element.classList.add('is-reveal-ready')
    prepareWithGsap(element, direction)

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        activeRevealObservers.delete(observer)

        if (!gsap) {
          makeVisible(element)
          return
        }

        let tween: GsapTween
        tween = gsap.to(element, {
          autoAlpha: 1,
          delay: revealDelay(element),
          duration: direction === 'scale' ? 0.9 : 0.78,
          ease: 'power3.out',
          filter: 'blur(0px)',
          scale: 1,
          x: 0,
          y: 0,
          onComplete: () => {
            activeTweens.delete(tween)
            makeVisible(element)
          },
        })
        activeTweens.add(tween)
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    )

    activeRevealObservers.add(observer)
    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0
      if (!element.isConnected || disposed) return
      element.classList.add('is-reveal-armed')
      observer.observe(element)
    })
  }

  onMounted(async () => {
    landingRoot.value?.classList.add('is-motion-pending')
    await nextTick()

    const root = landingRoot.value
    if (!root) return
    const immersive = root.classList.contains('landing-product--immersive')
    const elements = [
      ...root.querySelectorAll<HTMLElement>('[data-landing-reveal]'),
    ].filter(
      (element) =>
        !immersive || !element.classList.contains('landing-pricing-strip')
    )
    elements.forEach((element) => {
      const direction = element.dataset.landingReveal as RevealDirection
      observeReveal(element, direction || 'up')
    })

    try {
      const runtime = await loadGsap()
      gsap = runtime.gsap
      gsap.registerPlugin(runtime.ScrollTrigger)
    } catch {
      gsap = null
      root.classList.remove('is-motion-pending')
    }

    if (disposed || !gsap || landingRoot.value !== root) return
    root.classList.add('is-gsap-motion')
    root.classList.remove('is-motion-pending')
    animateHero(root)

    elements.forEach((element) => {
      const direction = element.dataset.landingReveal as RevealDirection
      prepareWithGsap(element, direction || 'up')
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    if (animationFrame) cancelAnimationFrame(animationFrame)
    activeRevealObservers.forEach((observer) => observer.disconnect())
    activeRevealObservers.clear()
    activeTweens.forEach((tween) => tween.kill())
    activeTweens.clear()
    heroMedia?.revert()
    heroContext?.revert()
    heroMedia = null
    heroContext = null
    landingRoot.value?.classList.remove('is-motion-pending')
    landingRoot.value?.classList.remove('is-gsap-motion')
  })
}
