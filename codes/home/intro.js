gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
CustomEase.create("bounceOut", "M0,0 C0.34,1.56 0.64,1 1,1");

const logo = document.querySelector(".is-logo");
const introSection = document.querySelector("#home-intro"); // the trigger
const introTrigger = document.querySelector('[attr-name="intro-trigger"]'); // the trigger
const stickyNotesWrap = document.querySelector(".intro-animation"); // the wrapper Ã¢â‚¬â€ move to Y center
const stickyNotes = document.querySelectorAll(".sticky-notes"); // should come to center and then spread out
const bigIntroText = document.querySelector("[big-text]"); //should become opacity 0
const notebookBg = document.querySelector("#home-intro .notebook-line"); //should become opacity 0
const contentSection = document.querySelector("#content-section");

let animationTriggerStart,
  animationTriggerEnd,
  introLogoTriggerStart,
  introLogoTriggerEnd,
  mainContentLogo;
if (window.innerWidth >= 992) {
  animationTriggerStart = "top bottom";
  animationTriggerEnd = "bottom bottom";
  introLogoTriggerStart = "top top";
  introLogoTriggerEnd = "center center";
  mainContentLogo = document.querySelector(".is-logo.is-intro");
} else {
  animationTriggerStart = "top 60%";
  animationTriggerEnd = "bottom 90%";
  introLogoTriggerStart = "bottom 2%";
  introLogoTriggerEnd = "bottom top";
  mainContentLogo = document.querySelector(".brand_links");
}

// --- Intro Scroll Animation ---

// Convert vw/vh strings to pixels
function toPixels(value) {
  const num = parseFloat(value);
  if (value.includes("vw")) return (num / 100) * window.innerWidth;
  if (value.includes("vh")) return (num / 100) * window.innerHeight;
  return num;
}

// Scatter directions for each note (index 0Ã¢â‚¬â€œ8) Ã¢â‚¬â€ vectors past viewport edges
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

// Set transformOrigin only â€” leave CSS transition intact so hover works on page load
// gsap.set(stickyNotes, { transformOrigin: "center center" });

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: introTrigger,
    start: animationTriggerStart,
    end: animationTriggerEnd,
    // scrub: 1.2,
    // markers: true,
    scrub: true,
    onEnter: () => {
      // pointerEvents can't be scrubbed (non-numeric) â€” toggle manually
      gsap.set(introSection, { pointerEvents: "none" });
    },
    onLeaveBack: () => {
      // Restore pointer events and clear GSAP inline transforms so CSS hover works
      gsap.set(introSection, { pointerEvents: "auto" });
      // gsap.set(stickyNotes, { clearProps: "transform,x,y,scale,opacity" });
    },
  },
});

// Ã¢â€â‚¬Ã¢â€â‚¬ Phase 1 (0 Ã¢â€ â€™ 0.5): move the wrapper and the text to the vertical center Ã¢â€â‚¬Ã¢â€â‚¬
tl.to(
  stickyNotesWrap,
  {
    y: getWrapYOffset(stickyNotesWrap),
    ease: "none",
    duration: 0.5,
  },
  0
);

tl.to(
  bigIntroText,
  {
    y: getWrapYOffset(bigIntroText),
    opacity: 0,
    ease: "none",
    duration: 0.5,
  },
  0
);

// Ã¢â€â‚¬Ã¢â€â‚¬ New TL: fade out intro text and notebook bg later in the scroll Ã¢â€â‚¬Ã¢â€â‚¬
gsap.to([notebookBg, contentSection], {
  opacity: 0,
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: introTrigger,
    start: "top center",
    end: "top 30%",
    scrub: true,
  },
});

gsap.to([contentSection, "[main-content]", logo], {
  opacity: 1,
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: introTrigger,
    start: "top center",
    end: "bottom bottom",
    scrub: true,
  },
});

const logoCont = gsap.timeline({
  scrollTrigger: {
    trigger: introTrigger,
    start: introLogoTriggerStart,
    end: introLogoTriggerEnd,
    toggleActions: "play none none reverse",
  },
});

logoCont
  .to(mainContentLogo, {
    opacity: 0,
    ease: "power2.inOut",
    duration: 0,
  })
  .to(
    "[logo-head='main-content']",
    {
      opacity: 1,
      ease: "power2.inOut",
      duration: 0,
    },
    0
  );

// Ã¢â€â‚¬Ã¢â€â‚¬ Phase 2 (0.5 Ã¢â€ â€™ 1.0): scatter individual notes out of the viewport Ã¢â€â‚¬Ã¢â€â‚¬
stickyNotes.forEach((note, i) => {
  const vec = scatterVectors[i] || { x: "120vw", y: "-120vh" };

  // Fly out
  tl.to(
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
  tl.to(note, { opacity: 0, duration: 0.05 }, 0.95 + i * 0.01);
});