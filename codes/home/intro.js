gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
CustomEase.create("bounceOut", "M0,0 C0.34,1.56 0.64,1 1,1");

const introLogo = document.querySelector(".is-logo.is-intro");
const mainContentLogo = document.querySelector("#content-section .is-logo");
const introSection = document.querySelector("#home-intro"); // the trigger
const introTrigger = document.querySelector('[attr-name="intro-trigger"]'); // the trigger
const stickyNotesWrap = document.querySelector(".intro-animation"); // the wrapper -- move to Y center
const stickyNotes = document.querySelectorAll(".sticky-notes"); // should come to center and then spread out
const bigIntroText = document.querySelector("[big-text]"); //should become opacity 0
const notebookBg = document.querySelector("#home-intro .notebook-line"); //should become opacity 0
const contentSection = document.querySelector("#content-section");

// --- Intro Scroll Animation ---

// Convert vw/vh strings to pixels
function toPixels(value) {
  const num = parseFloat(value);
  if (value.includes("vw")) return (num / 100) * window.innerWidth;
  if (value.includes("vh")) return (num / 100) * window.innerHeight;
  return num;
}

// Scatter directions for each note (index 0-8) -- vectors past viewport edges
const scatterVectors = [
  { x: "-130vw", y: "-110vh" }, // card1: top-left
  { x: "-60vw", y: "-130vh" }, // card2: top
  { x: "20vw", y: "-130vh" }, // card3: top-center
  { x: "130vw", y: "-110vh" }, // card4: top-right
  { x: "-140vw", y: "20vh" }, // card5: left
  { x: "-130vw", y: "80vh" }, // card6: bottom-left
  { x: "10vw", y: "130vh" }, // card7: bottom
  { x: "130vw", y: "60vh" }, // card8: right
  { x: "80vw", y: "130vh" }, // card9: bottom-right
];

// Get the wrapper's vertical offset to the viewport center
function getWrapYOffset(el) {
  const rect = el.getBoundingClientRect();
  const elCY = rect.top + rect.height / 2;
  const vpCY = window.innerHeight / 2;
  return vpCY - elCY;
}

// Set transformOrigin only -- leave CSS transition intact so hover works on page load
// gsap.set(stickyNotes, { transformOrigin: "center center" });

const mm = gsap.matchMedia();

mm.add(
  {
    isDesktop: "(min-width: 768px)",
    isMobile: "(max-width: 767px)",
  },
  (context) => {
    const { isDesktop } = context.conditions;

    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: introTrigger,
        start: isDesktop ? "top bottom" : "top bottom",
        end: isDesktop ? "top top" : "bottom bottom",
        // scrub: 1.2,
        // markers: true,
        scrub: true,
        onEnter: () => {
          gsap.set(introSection, { pointerEvents: "none" });
        },
        onLeaveBack: () => {
          gsap.set(introSection, { pointerEvents: "auto" });
        },
      },
    });

    // -- Phase 1 (0 -> 0.5): move the wrapper and the text to the vertical center --
    introTl
    .to(
      stickyNotesWrap,
      {
        y: getWrapYOffset(stickyNotesWrap),
        ease: "none",
        duration: 0.5,
      },
      0
    ).to(
      bigIntroText,
      {
        y: getWrapYOffset(bigIntroText),
        opacity: 0,
        ease: "none",
        duration: 0.5,
      },
      0
    )
    .to(bigIntroText, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
    },"<0.2")
    .to(notebookBg, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
    },"<0.2")
    .to([contentSection], {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    },"<0.2");

    gsap.to("[main-content]", {
      opacity: 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: introTrigger,
        start: isDesktop ? "top 20%" : "top bottom",
        end: "top top",
        scrub: true,
      },
    });

    // -- Phase 2 (0.5 -> 1.0): scatter individual notes out of the viewport --
    stickyNotes.forEach((note, i) => {
      const vec = scatterVectors[i] || { x: "120vw", y: "-120vh" };

      // Fly out
      introTl.to(
        note,
        {
          x: toPixels(vec.x),
          y: toPixels(vec.y),
          scale: 0.5,
          ease: "power3.in",
          duration: 0.5,
        },
        0.5 + i * 0.01
      );

      // Fade to opacity 0 at the very edge/end of the animation (past viewport)
      introTl.to(note, { opacity: 0, duration: 0.05 }, 0.95 + i * 0.01);
    });
  }
);
