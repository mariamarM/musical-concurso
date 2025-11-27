<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
type PillNavItem = {
  label: string
  href?: string
  ariaLabel?: string
}

interface PillNavProps {
  items: PillNavItem[]
  activeHref?: string
  className?: string
  ease?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
  onMobileMenuClick?: () => void
  initialLoadAnimation?: boolean
}

const props = withDefaults(defineProps<PillNavProps>(), {
  className: '',
  ease: 'power3.easeOut',
  baseColor: '#fff',
  pillColor: '#060010',
  hoveredPillTextColor: '#060010',
  initialLoadAnimation: true,
})

const resolvedPillTextColor = props.pillTextColor ?? props.baseColor
const isMobileMenuOpen = ref(false)
const circleRefs = ref<Array<HTMLSpanElement | null>>([])
const tlRefs = ref<Array<gsap.core.Timeline | null>>([])
const activeTweenRefs = ref<Array<gsap.core.Tween | null>>([])
const hamburgerRef = useTemplateRef('hamburgerRef')
const mobileMenuRef = useTemplateRef('mobileMenuRef')
const navItemsRef = useTemplateRef('navItemsRef')

watch(
  () => props.items,
  (items) => {
    circleRefs.value = new Array(items.length).fill(null)
    tlRefs.value = new Array(items.length).fill(null)
    activeTweenRefs.value = new Array(items.length).fill(null)
  },
  { immediate: true },
)

const layout = () => {
  circleRefs.value.forEach((circle) => {
    if (!circle?.parentElement) return

    const pill = circle.parentElement as HTMLElement
    const rect = pill.getBoundingClientRect()
    const { width: w, height: h } = rect
    const R = ((w * w) / 4 + h * h) / (2 * h)
    const D = Math.ceil(2 * R) + 2
    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
    const originY = D - delta

    circle.style.width = `${D}px`
    circle.style.height = `${D}px`
    circle.style.bottom = `-${delta}px`

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`,
    })

    const label = pill.querySelector<HTMLElement>('.pill-label')
    const white = pill.querySelector<HTMLElement>('.pill-label-hover')

    if (label) gsap.set(label, { y: 0 })
    if (white) gsap.set(white, { y: h + 12, opacity: 0 })

    const index = circleRefs.value.indexOf(circle)
    if (index === -1) return

    tlRefs.value[index]?.kill()
    const tl = gsap.timeline({ paused: true })

    tl.to(
      circle,
      { scale: 1.2, xPercent: -50, duration: 2, ease: props.ease, overwrite: 'auto' },
      0,
    )

    if (label) {
      tl.to(label, { y: -(h + 8), duration: 2, ease: props.ease, overwrite: 'auto' }, 0)
    }

    if (white) {
      gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
      tl.to(white, { y: 0, opacity: 1, duration: 2, ease: props.ease, overwrite: 'auto' }, 0)
    }

    tlRefs.value[index] = tl
  })
}

const onResize = () => layout()

onMounted(() => {
  layout()

  window.addEventListener('resize', onResize)

  if (document.fonts) {
    document.fonts.ready.then(layout).catch(() => {})
  }

  const menu = mobileMenuRef.value
  if (menu) {
    gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 })
  }

  if (props.initialLoadAnimation) {
    const navItems = navItemsRef.value

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' })
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease: props.ease,
      })
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

watch(
  () => [props.items, props.ease, props.initialLoadAnimation],
  () => {
    layout()
  },
  { deep: true },
)

const handleEnter = (i: number) => {
  const tl = tlRefs.value[i]
  if (!tl) return
  activeTweenRefs.value[i]?.kill()
  activeTweenRefs.value[i] = tl.tweenTo(tl.duration(), {
    duration: 0.3,
    ease: props.ease,
    overwrite: 'auto',
  })
}

const handleLeave = (i: number) => {
  const tl = tlRefs.value[i]
  if (!tl) return
  activeTweenRefs.value[i]?.kill()
  activeTweenRefs.value[i] = tl.tweenTo(0, {
    duration: 0.2,
    ease: props.ease,
    overwrite: 'auto',
  })
}

const toggleMobileMenu = () => {
  const newState = !isMobileMenuOpen.value
  isMobileMenuOpen.value = newState

  const hamburger = hamburgerRef.value
  const menu = mobileMenuRef.value

  if (hamburger) {
    const lines = hamburger.querySelectorAll('.hamburger-line')
    if (newState) {
      gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: props.ease })
      gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: props.ease })
    } else {
      gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: props.ease })
      gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: props.ease })
    }
  }

  if (menu) {
    if (newState) {
      gsap.set(menu, { visibility: 'visible' })
      gsap.fromTo(
        menu,
        { opacity: 0, y: 10, scaleY: 1 },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          duration: 0.3,
          ease: props.ease,
          transformOrigin: 'top center',
        },
      )
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease: props.ease,
        transformOrigin: 'top center',
        onComplete: () => {
          gsap.set(menu, { visibility: 'hidden' })
        },
      })
    }
  }

  props.onMobileMenuClick?.()
}

const isExternalLink = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('//') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('#')

const isRouterLink = (href?: string) => href && !isExternalLink(href)

const cssVars = computed(() => ({
  '--base': props.baseColor,
  '--pill-bg': props.pillColor,
  '--hover-text': props.hoveredPillTextColor,
  '--pill-text': resolvedPillTextColor,
  '--nav-h': '42px',
  '--pill-pad-x': '18px',
  '--pill-gap': '3px',
}))

const setCircleRef = (el: HTMLSpanElement | null, index: number) => {
  if (circleRefs.value.length > index) {
    circleRefs.value[index] = el
  }
}
</script>

<template>
  <div class="nav-container">
    <nav :class="['nav-main', className]" aria-label="Primary" :style="cssVars">
      <div ref="navItemsRef" class="nav-items">
        <ul role="menubar" class="nav-list">
          <li
            v-for="(item, i) in items"
            :key="item.href || `item-${i}`"
            class="nav-item"
            role="none"
          >
            <component
              :is="isRouterLink(item.href) ? RouterLink : 'a'"
              :to="isRouterLink(item.href) ? item.href : undefined"
              :href="!isRouterLink(item.href) ? item.href : undefined"
              class="nav-pill"
              :aria-label="item.ariaLabel || item.label"
              @mouseenter="handleEnter(i)"
              @mouseleave="handleLeave(i)"
            >
              <span
                class="hover-circle"
                aria-hidden="true"
                :ref="(el) => setCircleRef(el as HTMLSpanElement, i)"
              />
              <span class="label-stack">
                <span class="pill-label" :style="{ willChange: 'transform' }">
                  {{ item.label }}
                </span>
                <span class="pill-label-hover" aria-hidden="true">
                  {{ item.label }}
                </span>
              </span>
              <span v-if="activeHref === item.href" class="active-indicator" aria-hidden="true" />
            </component>
          </li>
        </ul>
      </div>

      <button
        ref="hamburgerRef"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
        :aria-expanded="isMobileMenuOpen"
        class="hamburger-button"
      >
        <span class="hamburger-line" />
        <span class="hamburger-line" />
      </button>
    </nav>

    <div
      ref="mobileMenuRef"
      class="mobile-menu"
      :style="{
        ...cssVars,
        background: 'var(--base, #f0f0f0)',
      }"
    >
      <ul class="mobile-list">
        <li v-for="item in items" :key="item.href || `mobile-${item.label}`">
          <component
            :is="isRouterLink(item.href) ? RouterLink : 'a'"
            :to="isRouterLink(item.href) ? item.href : undefined"
            :href="!isRouterLink(item.href) ? item.href : undefined"
            class="mobile-item"
            @mouseenter="
              (e: MouseEvent) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--base)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--hover-text, #fff)'
              }
            "
            @mouseleave="
              (e: MouseEvent) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--pill-bg, #fff)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--pill-text, #fff)'
              }
            "
          >
            {{ item.label }}
          </component>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.nav-container {
  position: absolute;
  top: 1em;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: auto;
}

.nav-main {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.nav-items {
  display: none;
  position: relative;
  align-items: center;
  border-radius: 9999px;
  height: var(--nav-h);
  background: var(--base, #000);
}

@media (min-width: 768px) {
  .nav-items {
    display: flex;
  }
}

.nav-list {
  display: flex;
  align-items: stretch;
  margin: 0;
  padding: 3px;
  height: 100%;
  list-style: none;
  gap: var(--pill-gap);
}

.nav-item {
  display: flex;
  height: 100%;
}

.nav-pill {
  display: inline-flex;
  box-sizing: border-box;
  position: relative;
  justify-content: center;
  align-items: center;
  padding-left: 0;
  padding-right: 0;
  border-radius: 9999px;
  height: 100%;
  overflow: hidden;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  line-height: 0;
  letter-spacing: 0.2px;
  white-space: nowrap;
  cursor: pointer;
  background: var(--pill-bg, #fff);
  color: var(--pill-text, var(--base, #000));
  padding-left: var(--pill-pad-x);
  padding-right: var(--pill-pad-x);
}

.hover-circle {
  display: block;
  bottom: 0;
  left: 50%;
  z-index: 1;
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  background: var(--base, #000);
  will-change: transform;
}

.label-stack {
  display: inline-block;
  z-index: 2;
  position: relative;
  line-height: 1;
}

.pill-label {
  display: inline-block;
  z-index: 2;
  position: relative;
  line-height: 1;
  will-change: transform;
}

.pill-label-hover {
  display: inline-block;
  top: 0;
  left: 0;
  z-index: 3;
  position: absolute;
  color: var(--hover-text, #fff);
  will-change: transform, opacity;
}

.active-indicator {
  bottom: -6px;
  left: 50%;
  z-index: 4;
  position: absolute;
  border-radius: 9999px;
  width: 12px;
  height: 12px;
  transform: translateX(-50%);
  background: var(--base, #000);
}

.hamburger-button {
  display: none;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  cursor: pointer;
  width: var(--nav-h);
  height: var(--nav-h);
  background: var(--base, #000);
}

@media (max-width: 767px) {
  .hamburger-button {
    display: flex;
  }
}

.hamburger-line {
  border-radius: 0.25rem;
  width: 1rem;
  height: 0.125rem;
  transform-origin: center;
  transition: all 0.2s ease;
  transition-duration: 10ms;
  background: var(--pill-bg, #fff);
}

.mobile-menu {
  display: none;
  top: 3em;
  right: 1rem;
  left: 1rem;
  z-index: 998;
  position: absolute;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 27px;
  transform-origin: top;
  background: var(--base, #f0f0f0);
}

@media (max-width: 767px) {
  .mobile-menu {
    display: block;
  }
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  padding: 3px;
  list-style: none;
}

.mobile-item {
  display: block;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-radius: 50px;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s ease;
  background: var(--pill-bg, #fff);
  color: var(--pill-text, #fff);
}
</style>
