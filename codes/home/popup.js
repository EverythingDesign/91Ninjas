const popupPairs = [
  "marketer",
  "testimonial",
  "case-study",
  "chat",
  "gtm partners marquee",
  "book demo",
];

const popupControllers = [];

function stopLenis() {
  if (window.lenis && typeof window.lenis.stop === "function") {
    window.lenis.stop();
  }
}

function startLenisWhenSafe() {
  const anotherOverlayIsOpen = document.querySelector(
    '[popup-name].is-active, ' +
      ".navigation_content.is-active, " +
      ".mobile-nav_popup.is-active",
  );

  if (anotherOverlayIsOpen) return;

  if (window.lenis && typeof window.lenis.start === "function") {
    window.lenis.start();
  }
}

popupPairs.forEach((name) => {
  const trigger = document.querySelector(`[button-trigger-name="${name}"]`);
  const popup = document.querySelector(`[popup-name="${name}"]`);

  if (!trigger || !popup) return;

  const popupWrap = popup.closest("[popup-wrap]");
  const popupContent =
    popup.querySelector("[popup-content]") ||
    popup.querySelector(".popup_content") ||
    popup.querySelector(".popup_wrap") ||
    popup;
  const closePopup = popup.querySelector(`[button="close-popup"]`);
  const outerClose = popup.querySelector(`[close-popup]`);

  function isOpen() {
    return popup.classList.contains("is-active");
  }

  function close() {
    popup.classList.remove("is-active");
    popupWrap?.classList.remove("is-active");

    // Restart Lenis only when no popup or navigation overlay remains open.
    startLenisWhenSafe();
  }

  function open() {
    popup.classList.add("is-active");
    popupWrap?.classList.add("is-active");
    stopLenis();

    if (name === "chat") {
      const typeElement = document.querySelector("[type-animation]");

      if (!typeElement) return;

      const text =
        typeElement.dataset.typeText || typeElement.textContent || "";

      typeElement.dataset.typeText = text;
      typeElement.textContent = "";

      gsap.fromTo(
        typeElement,
        { text: { value: "" } },
        {
          duration: 1.5,
          text: { value: text, delimiter: "" },
          ease: "none",
        },
      );
    }
  }

  trigger.addEventListener("click", () => {
    if (isOpen()) close();
    else open();
  });

  closePopup?.addEventListener("click", close);
  outerClose?.addEventListener("click", close);

  popupControllers.push({
    trigger,
    popup,
    popupContent,
    isOpen,
    close,
  });
});

// Close every active popup when Escape is pressed.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const openPopups = popupControllers.filter(({ isOpen }) => isOpen());
  if (openPopups.length === 0) return;

  event.preventDefault();
  openPopups.forEach(({ close }) => close());
});

// [popup-name] covers the full viewport on the Webflow site, so use its inner
// content panel as the boundary. Clicking the surrounding popup background is
// therefore treated as an outside click.
document.addEventListener("click", (event) => {
  popupControllers.forEach(({ trigger, popupContent, isOpen, close }) => {
    if (!isOpen()) return;
    if (
      trigger.contains(event.target) ||
      popupContent.contains(event.target)
    ) {
      return;
    }

    close();
  });
});
