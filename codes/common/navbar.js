(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  /*
   * =========================================================
   * GSAP + LENIS
   * =========================================================
   */

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0);

  if (!window.__ninjasScrollInit) {
    window.__ninjasScrollInit = true;

    window.lenis = {
      stop: function () {},
      start: function () {},
      on: function () {},
      raf: function () {},
      scrollTo: function () {},
    };

    var useLenis = window.matchMedia(
      "(min-width: 992px) and (hover: hover) and (pointer: fine)",
    ).matches;

    if (useLenis && typeof Lenis !== "undefined") {
      window.lenis = new Lenis();
      window.lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add(function (time) {
        window.lenis.raf(time * 1000);
      });
    }
  }

  // Keep these global because the homepage popup code uses the same helpers.
  window.lockScroll = function () {
    if (window.lenis && typeof window.lenis.stop === "function") {
      window.lenis.stop();
    }
  };

  window.unlockScroll = function () {
    var anotherOverlayIsOpen = document.querySelector(
      ".navigation_content.is-active, " +
        ".mobile-nav_popup.is-active, " +
        '[popup-name].is-active',
    );

    if (anotherOverlayIsOpen) return;

    if (window.lenis && typeof window.lenis.start === "function") {
      window.lenis.start();
    }
  };

  if (window.__ninjasNavbarInit) return;
  window.__ninjasNavbarInit = true;

  window.unlockScroll();

  var media = gsap.matchMedia();

  /*
   * =========================================================
   * DESKTOP NAV
   * =========================================================
   */

  media.add("(min-width: 992px)", function () {
    var navigationLinks = document.querySelectorAll(
      "#about, #customer, #resource, #service",
    );
    var navigationContents = document.querySelectorAll(".navigation_content");
    var closeButtons = document.querySelectorAll(
      '.navigation_content [button="nav-close"]',
    );

    function getActivePanel() {
      return document.querySelector(".navigation_content.is-active");
    }

    function closeDesktopNav() {
      navigationContents.forEach(function (content) {
        content.classList.remove("is-active");
      });

      window.unlockScroll();
    }

    function handleNavigationClick(event) {
      event.preventDefault();

      var id = event.currentTarget.id;
      if (!id) return;

      var targetPanel = document.querySelector('[nav-id="' + id + '"]');
      if (!targetPanel) return;

      var wasAlreadyActive = targetPanel.classList.contains("is-active");

      navigationContents.forEach(function (content) {
        content.classList.remove("is-active");
      });

      if (wasAlreadyActive) {
        window.unlockScroll();
        return;
      }

      targetPanel.classList.add("is-active");
      window.lockScroll();
    }

    function handleCloseButtonClick(event) {
      event.preventDefault();
      closeDesktopNav();
    }

    function handleDocumentClick(event) {
      var activePanel = getActivePanel();
      if (!activePanel) return;

      // Keep the nav open for clicks inside its panel or on any nav opener.
      if (activePanel.contains(event.target)) return;
      if (event.target.closest("#about, #customer, #resource, #service")) {
        return;
      }

      closeDesktopNav();
    }

    function handleEscape(event) {
      if (event.key !== "Escape" || !getActivePanel()) return;

      event.preventDefault();
      closeDesktopNav();
    }

    navigationLinks.forEach(function (link) {
      link.addEventListener("click", handleNavigationClick);
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", handleCloseButtonClick);
    });

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return function () {
      navigationLinks.forEach(function (link) {
        link.removeEventListener("click", handleNavigationClick);
      });

      closeButtons.forEach(function (button) {
        button.removeEventListener("click", handleCloseButtonClick);
      });

      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
      closeDesktopNav();
    };
  });

  /*
   * =========================================================
   * MOBILE NAV
   * =========================================================
   */

  media.add("(max-width: 991px)", function () {
    var mobileMenu = document.querySelector("#mobile-menu");
    var mobileNav = document.querySelector(".mobile-nav_popup");

    if (!mobileMenu || !mobileNav) return;

    var mobileContent =
      mobileNav.querySelector("[mobile-nav-content]") ||
      mobileNav.querySelector(".mobile-nav-content") ||
      mobileNav;
    var closeButton = mobileNav.querySelector('[button="nav-close"]');

    function isMobileNavOpen() {
      return mobileNav.classList.contains("is-active");
    }

    function openMobileNav() {
      mobileNav.classList.add("is-active");
      window.lockScroll();
    }

    function closeMobileNav() {
      mobileNav.classList.remove("is-active");
      window.unlockScroll();
    }

    function handleMobileMenuClick(event) {
      event.preventDefault();

      if (isMobileNavOpen()) closeMobileNav();
      else openMobileNav();
    }

    function handleCloseButtonClick(event) {
      event.preventDefault();
      closeMobileNav();
    }

    function handleDocumentClick(event) {
      if (!isMobileNavOpen()) return;

      // Keep the nav open for its opener and clicks inside the actual menu.
      if (mobileMenu.contains(event.target)) return;
      if (mobileContent.contains(event.target)) return;

      closeMobileNav();
    }

    function handleEscape(event) {
      if (event.key !== "Escape" || !isMobileNavOpen()) return;

      event.preventDefault();
      closeMobileNav();
    }

    mobileMenu.addEventListener("click", handleMobileMenuClick);
    closeButton?.addEventListener("click", handleCloseButtonClick);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return function () {
      mobileMenu.removeEventListener("click", handleMobileMenuClick);
      closeButton?.removeEventListener("click", handleCloseButtonClick);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
      closeMobileNav();
    };
  });

  /*
   * =========================================================
   * CURRENT NAV ITEM
   * =========================================================
   */

  function setCurrentNavigationItem() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    var groups = {
      about: ["/our-journey", "/team"],
      customer: ["/case-studies", "/wall-of-love", "/customers"],
      resource: ["/blog", "/content-portfolio", "/design-portfolio"],
      service: ["/services"],
    };

    Object.keys(groups).some(function (id) {
      var matches = groups[id].some(function (base) {
        return path === base || path.indexOf(base + "/") === 0;
      });

      if (!matches) return false;

      var navigationItem = document.getElementById(id);
      navigationItem?.classList.add("is-current");

      return true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setCurrentNavigationItem, {
      once: true,
    });
  } else {
    setCurrentNavigationItem();
  }
})();
