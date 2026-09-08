gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
CustomEase.create("bounceOut", "M0,0 C0.34,1.56 0.64,1 1,1");

const introSection = document.querySelector("#home-intro");
const introTrigger = document.querySelector('[attr-name="intro-trigger"]');
const stickyNotesWrap = document.querySelector(".intro-animation");
const stickyNotes = document.querySelectorAll(".sticky-notes");
const bigIntroText = document.querySelector("[big-text]");
const notebookBg = document.querySelector("#home-intro .notebook-line");
const contentSection = document.querySelector("#content-section");

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
  introSection &&
  introTrigger &&
  stickyNotesWrap &&
  bigIntroText &&
  notebookBg &&
  contentSection
) {
  const media = gsap.matchMedia();

  media.add(
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
            gsap.to(".scroll-indicator", {opacity: 0, duration: 0.5, ease: "power2.inOut"});
            gsap.set(introSection, { pointerEvents: "none" });
          },
          onLeaveBack: () => {
            gsap.to(".scroll-indicator", {opacity: 1, duration: 0.5, ease: "power2.inOut"});
            gsap.set(introSection, { pointerEvents: "auto" });
          },
        },
      });

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
}
