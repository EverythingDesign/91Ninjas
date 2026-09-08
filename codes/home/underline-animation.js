(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  if (window.__ninjasUnderlineAnimationInit) return;
  window.__ninjasUnderlineAnimationInit = true;

  gsap.registerPlugin(ScrollTrigger);

  const underlines = gsap.utils.toArray(
    ".content_text.var-1, " +
      ".content_text.var-2, " +
      ".content_text.var-3, " +
      ".content_text.var-4",
  );
  const highlightReveals = gsap.utils.toArray(
    ".big-arrow_wrap .highlight-svg_wrap, " +
      ".list .highlighted-content_wrap .highlight-svg_wrap",
  );
  const clickArrows = gsap.utils.toArray(".click-arrow");

  function initializeClickArrows() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.set(clickArrows, { animationPlayState: "paused" });

    if (reducedMotion || clickArrows.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      gsap.set(clickArrows, { animationPlayState: "running" });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          gsap.set(entry.target, {
            animationPlayState: entry.isIntersecting ? "running" : "paused",
          });
        });
      },
      { threshold: 0.01 },
    );

    clickArrows.forEach(function (arrow) {
      observer.observe(arrow);
    });
  }

  initializeClickArrows();

  if (underlines.length === 0 && highlightReveals.length === 0) return;

  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", function () {
    underlines.forEach(function (underline) {
      gsap.fromTo(
        underline,
        {
          backgroundPosition: "left bottom",
          backgroundRepeat: "no-repeat",
          backgroundSize: "0% auto",
        },
        {
          backgroundSize: "100% auto",
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: underline,
            start: "clamp(top 85%)",
            once: true,
          },
        },
      );
    });

    highlightReveals.forEach(function (highlight) {
      gsap.fromTo(
        highlight,
        {
          clipPath: "inset(0 100% 0 0)",
          WebkitClipPath: "inset(0 100% 0 0)",
        },
        {
          clipPath: "inset(0 0% 0 0)",
          WebkitClipPath: "inset(0 0% 0 0)",
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger:
              highlight.closest(".big-arrow_wrap") ||
              highlight.closest(".highlighted-content_wrap") ||
              highlight,
            start: "clamp(top 85%)",
            once: true,
          },
        },
      );
    });
  });

  media.add("(prefers-reduced-motion: reduce)", function () {
    gsap.set(underlines, {
      backgroundPosition: "left bottom",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% auto",
    });

    if (highlightReveals.length > 0) {
      gsap.set(highlightReveals, {
        clipPath: "inset(0 0% 0 0)",
        WebkitClipPath: "inset(0 0% 0 0)",
      });
    }
  });
})();
