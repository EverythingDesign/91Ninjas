const introSection = document.querySelector("#home-intro");
const introTrigger = document.querySelector('[attr-name="intro-trigger"]');
const stickyNotesWrap = document.querySelector(".intro-animation");
const stickyNotes = document.querySelectorAll(".sticky-notes");
const bigIntroText = document.querySelector("[big-text]");
const notebookBg = document.querySelector("#home-intro .notebook-line");
const contentSection = document.querySelector("#content-section");
const scrollIndicator = introSection?.querySelector(".scroll-indicator");
const introStorageKey = "91ninjas_intro_seen";
let introMedia;
let introSkipped = false;

function hasSeenIntro() {
  try {
    return window.localStorage.getItem(introStorageKey) === "1";
  } catch {
    // Storage may be disabled. Keep the normal first-visit experience usable.
    return false;
  }
}

function rememberIntro() {
  if (document.visibilityState === "hidden") return;

  try {
    window.localStorage.setItem(introStorageKey, "1");
  } catch {
    // The animation must still work when storage is unavailable or full.
  }
  document.removeEventListener("visibilitychange", rememberIntro);
}

function skipIntro(restorePosition = false) {
  if (!introSection || !contentSection || introSkipped) return;

  // Preserve the visitor's position within the content on a cached Back visit.
  const contentOffset = Math.max(0, -contentSection.getBoundingClientRect().top);
  introMedia?.revert();
  introMedia = undefined;
  introSkipped = true;
  document.documentElement.setAttribute("data-ninjas-intro", "skip");

  // Also work when only intro.js is installed; the Head snippet prevents flashing.
  introSection.style.setProperty("display", "none", "important");
  introTrigger?.style.setProperty("display", "none", "important");
  contentSection.style.setProperty("margin-top", "0px", "important");
  [contentSection, ...document.querySelectorAll(
    '#content-section [main-content], [logo-head="main-content"], .brand_links',
  )].forEach((element) => {
    element.style.setProperty("opacity", "1", "important");
    element.style.setProperty("visibility", "visible", "important");
  });

  requestAnimationFrame(() => {
    window.lenis?.resize?.();
    window.ScrollTrigger?.refresh();
    if (restorePosition) {
      window.scrollTo({ top: contentOffset, behavior: "instant" });
      window.lenis?.scrollTo?.(contentOffset, { immediate: true, force: true });
    }
  });
}

if (hasSeenIntro() || document.documentElement.getAttribute("data-ninjas-intro") === "skip") {
  skipIntro();
}

if (introSection && contentSection) {
  window.addEventListener("pageshow", (event) => {
    // A restored page does not rerun the Head code or this script.
    if (event.persisted && hasSeenIntro()) skipIntro(true);
  });
}

console.log("yyy");
function toPixels(value) {
  const number = parseFloat(value);

  if (value.includes("vw")) return (number / 100) * window.innerWidth;
  if (value.includes("vh")) return (number / 100) * window.innerHeight;

  return number;
}

const scatterVectors = [
  { x: "-130vw", y: "-110vh" },
  { x: "-60vw", y: "-130vh" },
  { x: "20vw", y: "-130vh" },
  { x: "130vw", y: "-110vh" },
  { x: "-140vw", y: "20vh" },
  { x: "-130vw", y: "80vh" },
  { x: "10vw", y: "130vh" },
  { x: "130vw", y: "60vh" },
  { x: "80vw", y: "130vh" },
];

function getWrapYOffset(element) {
  const rect = element.getBoundingClientRect();
  const elementCenter = rect.top + rect.height / 2;
  const viewportCenter = window.innerHeight / 2;

  return viewportCenter - elementCenter;
}

if (
  !introSkipped &&
  introSection &&
  introTrigger &&
  stickyNotesWrap &&
  bigIntroText &&
  notebookBg &&
  contentSection &&
  typeof gsap !== "undefined" &&
  typeof ScrollTrigger !== "undefined"
) {
  gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
  CustomEase.create("bounceOut", "M0,0 C0.34,1.56 0.64,1 1,1");
  introMedia = gsap.matchMedia();

  introMedia.add(
    {
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
    },
    (context) => {
      const { isDesktop } = context.conditions;

      // The mobile trigger sits on the first viewport boundary. Clamping keeps
      // iOS Safari's changing browser chrome from producing negative start
      // coordinates and partially progressing the scrubbed animation at load.
      const startPosition = isDesktop
        ? "top bottom"
        : "clamp(top bottom)";

      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: introTrigger,
          start: startPosition,
          end: isDesktop ? "top top" : "bottom bottom",
          scrub: true,
          onEnter: () => {
            gsap.set(introSection, { pointerEvents: "none" });
          },
          onLeaveBack: () => {
            gsap.set(introSection, { pointerEvents: "auto" });
          },
        },
      });

      // Hide the prompt before the hero gives way to the content below.
      // Keeping it on the scrubbed timeline restores it when scrolling back up.
      if (scrollIndicator) {
        introTimeline.to(
          scrollIndicator,
          { autoAlpha: 0, duration: 0.15, ease: "none" },
          0,
        );
      }

      introTimeline
        .to(
          stickyNotesWrap,
          {
            y: getWrapYOffset(stickyNotesWrap),
            ease: "none",
            duration: 0.5,
          },
          0,
        )
        .to(
          bigIntroText,
          {
            y: getWrapYOffset(bigIntroText),
            opacity: 0,
            ease: "none",
            duration: 0.5,
          },
          0,
        )
        .to(
          bigIntroText,
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
          },
          "<0.2",
        )
        .to(
          notebookBg,
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
          },
          "<0.2",
        )
        .to(
          contentSection,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
          },
          "<0.2",
        );

      gsap.to("[main-content]", {
        opacity: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: introTrigger,
          start: isDesktop ? "top 20%" : startPosition,
          end: "top top",
          scrub: true,
        },
      });

      stickyNotes.forEach((note, index) => {
        const vector = scatterVectors[index] || {
          x: "120vw",
          y: "-120vh",
        };

        introTimeline.to(
          note,
          {
            x: toPixels(vector.x),
            y: toPixels(vector.y),
            scale: 0.5,
            ease: "power3.in",
            duration: 0.5,
          },
          0.5 + index * 0.01,
        );

        introTimeline.to(
          note,
          { opacity: 0, duration: 0.05 },
          0.95 + index * 0.01,
        );
      });
    },
  );

  // Record the first display, even if the visitor leaves before scrolling.
  document.addEventListener("visibilitychange", rememberIntro);
  rememberIntro();
}
