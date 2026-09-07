const popupPairs = [
  "marketer",
  "testimonial",
  "case-study",
  "chat",
  "gtm partners marquee",
  "book demo",
];

popupPairs.forEach((name) => {
  const trigger = document.querySelector(`[button-trigger-name="${name}"]`);
  const chatTrigger = document.querySelector(`[button-trigger-name="chat"]`);
  const popup = document.querySelector(`[popup-name="${name}"]`);
  const popupWrap = popup.closest("[popup-wrap]");
  const closePopup = popup.querySelector(`[button="close-popup"]`);
  const outerClose = popup.querySelector(`[close-popup]`);

  if (!trigger || !popup) return;

  trigger.addEventListener("click", () => {
    // const popupWrap = popup.parentElement?.querySelector(`[popup-wrap]`);

    // console.log(popupWrap);
    if (popupWrap) {
      popupWrap.classList.toggle("is-active");
    }
    const isActive = popup.classList.toggle("is-active");
    isActive ? lockScroll() : unlockScroll();
    if (trigger == chatTrigger) {
      const typeEl = document.querySelector("[type-animation]");
      const text = typeEl.textContent;
      typeEl.textContent = "";

      gsap.fromTo(
        typeEl,
        {
          text: { value: "" },
        },
        {
          duration: 1.5,
          text: {
            value: text,
            delimiter: "",
          },
          ease: "none",
        }
      );
    }
    if (outerClose) {
      outerClose.addEventListener("click", () => {
        popup.classList.remove("is-active");
        if (popupWrap) {
          popupWrap.classList.remove("is-active");
        }
        unlockScroll();
      });
    }
  });
  closePopup.addEventListener("click", () => {
    popup.classList.remove("is-active");
    if (popupWrap) {
      popupWrap.classList.remove("is-active");
    }
    unlockScroll();
  });
});