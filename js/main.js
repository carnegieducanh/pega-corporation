document.addEventListener("DOMContentLoaded", function () {
  /* ---- mobile: split footer into its own full-page section ---- */
  var mobileFooterQuery = window.matchMedia("(max-width: 768px)");

  function splitFooterOut() {
    var impactSection = document.getElementById("impact");
    var footerEl = document.querySelector(".footer");
    if (!impactSection || !footerEl || !impactSection.contains(footerEl)) return;
    var footerSection = document.createElement("section");
    footerSection.className = "section footer-section";
    footerSection.id = "footer";
    footerSection.dataset.navTheme = "dark";
    footerSection.appendChild(footerEl);
    impactSection.insertAdjacentElement("afterend", footerSection);
  }

  function mergeFooterIn() {
    var footerSection = document.getElementById("footer");
    if (!footerSection) return;
    var footerEl = footerSection.querySelector(".footer");
    var impactContent = document.querySelector("#impact .impact-content");
    if (footerEl && impactContent) impactContent.appendChild(footerEl);
    footerSection.remove();
  }

  if (mobileFooterQuery.matches) splitFooterOut();

  /* ---- search overlay ---- */
  var searchBtn = document.getElementById("searchBtn");
  var searchOverlay = document.getElementById("searchOverlay");
  var searchOverlayInput = document.getElementById("searchOverlayInput");
  var searchOverlayClose = document.getElementById("searchOverlayClose");
  var searchOverlayForm = document.getElementById("searchOverlayForm");

  function openSearchOverlay() {
    searchOverlay.classList.add("open");
    searchOverlay.setAttribute("aria-hidden", "false");
    searchBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("search-open");
    searchOverlayInput.focus();
  }

  function closeSearchOverlay() {
    searchOverlay.classList.remove("open");
    searchOverlay.setAttribute("aria-hidden", "true");
    searchBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("search-open");
  }

  searchBtn.addEventListener("click", function () {
    if (searchOverlay.classList.contains("open")) closeSearchOverlay();
    else openSearchOverlay();
  });
  searchOverlayClose.addEventListener("click", closeSearchOverlay);
  searchOverlayForm.addEventListener("submit", function (e) {
    e.preventDefault();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && searchOverlay.classList.contains("open")) closeSearchOverlay();
  });

  /* ---- language dropdown ---- */
  var langTool = document.querySelector(".lang-tool");
  var langBtn = document.getElementById("langBtn");
  langBtn.addEventListener("click", function () {
    var open = langTool.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", open);
  });
  var langButtons = document.querySelectorAll(".lang-menu button, .nav-lang-btn");
  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      langButtons.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      langTool.classList.remove("open");
    });
  });

  document.addEventListener("click", function (e) {
    if (
      searchOverlay.classList.contains("open") &&
      !searchOverlay.contains(e.target) &&
      !searchBtn.contains(e.target)
    ) {
      closeSearchOverlay();
    }
    if (!langTool.contains(e.target)) langTool.classList.remove("open");
  });

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById("menuBtn");
  menuBtn.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll("#nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
  });

  /* ---- full-page section navigation (JS-driven, no native scroll) ---- */
  var sideNavItems = document.querySelectorAll(".side-nav li");
  var sideNavIndicator = document.querySelector(".side-nav-indicator");
  var sectionTint = document.getElementById("sectionTint");
  var introContent = document.getElementById("introContent");
  var container = document.getElementById("snapContainer");
  var sectionEls = Array.prototype.slice.call(container.querySelectorAll(".section"));
  var currentIndex = 0;
  var animating = false;
  var animTimer = null;
  var ANIM_MS = 700;

  function positionSections(activeIndex) {
    sectionEls.forEach(function (sec, i) {
      sec.style.transform = "translateY(" + (i - activeIndex) * 100 + "%)";
    });
  }

  function setActiveUI(index) {
    var target = sectionEls[index];
    var id = target.id;
    var theme = target.dataset.navTheme;

    var enteringItem = sideNavItems[index];
    var previousActiveItem = document.querySelector(".side-nav li.active");
    var previousIndex = previousActiveItem ? Array.prototype.indexOf.call(sideNavItems, previousActiveItem) : -1;

    if (enteringItem && previousIndex !== -1 && previousIndex !== index) {
      var enteringDot = enteringItem.querySelector(".dot");
      var neighborItem = sideNavItems[index + (index > previousIndex ? -1 : 1)];
      if (enteringDot && neighborItem) {
        var shift = neighborItem.offsetTop - enteringItem.offsetTop;
        enteringDot.style.setProperty("--exit-shift", shift + "px");
      }
    }

    sideNavItems.forEach(function (item) {
      item.classList.toggle("active", item.dataset.target === id);
    });

    if (sideNavIndicator && sideNavItems[index]) {
      var activeItem = sideNavItems[index];
      var activeLabel = activeItem.querySelector(".side-nav-label");
      var indicatorLabel = sideNavIndicator.querySelector(".side-nav-indicator-label");
      if (indicatorLabel && activeLabel) {
        indicatorLabel.textContent = activeLabel.textContent;
      }
      sideNavIndicator.style.transform = "translateY(" + activeItem.offsetTop + "px)";
    }

    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.dataset.activeSection = id;

    if (sectionTint) sectionTint.classList.toggle("active", id === "home");
    if (introContent) introContent.classList.toggle("leaving", id !== "intro");
  }

  function goToSection(index) {
    index = Math.max(0, Math.min(sectionEls.length - 1, index));
    if (index === currentIndex || animating) return;

    animating = true;
    currentIndex = index;
    positionSections(currentIndex);
    setActiveUI(currentIndex);

    window.clearTimeout(animTimer);
    animTimer = window.setTimeout(function () {
      animating = false;
    }, ANIM_MS);
  }

  positionSections(currentIndex);
  setActiveUI(currentIndex);

  // enable slide transitions only after the initial layout has been painted
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      container.classList.add("is-ready");
    });
  });

  /* ---- keep footer split/merge in sync when the viewport crosses the mobile breakpoint ---- */
  mobileFooterQuery.addEventListener("change", function (e) {
    var activeId = sectionEls[currentIndex] ? sectionEls[currentIndex].id : null;

    if (e.matches) {
      splitFooterOut();
    } else {
      mergeFooterIn();
    }

    sectionEls = Array.prototype.slice.call(container.querySelectorAll(".section"));
    var restoredIndex = sectionEls.findIndex(function (s) {
      return s.id === activeId;
    });
    currentIndex = restoredIndex !== -1 ? restoredIndex : Math.min(currentIndex, sectionEls.length - 1);

    positionSections(currentIndex);
    setActiveUI(currentIndex);
  });

  function atTop(el) {
    return el.scrollTop <= 0;
  }
  function atBottom(el) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  }

  container.addEventListener(
    "wheel",
    function (e) {
      if (animating) {
        e.preventDefault();
        return;
      }

      var current = sectionEls[currentIndex];

      if (e.deltaY > 0) {
        if (atBottom(current) && currentIndex < sectionEls.length - 1) {
          e.preventDefault();
          goToSection(currentIndex + 1);
        }
      } else if (e.deltaY < 0) {
        if (atTop(current) && currentIndex > 0) {
          e.preventDefault();
          goToSection(currentIndex - 1);
        }
      }
    },
    { passive: false },
  );

  var touchStartY = 0;
  var touchHandled = false;

  container.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.touches[0].clientY;
      touchHandled = false;
    },
    { passive: true },
  );

  container.addEventListener(
    "touchmove",
    function (e) {
      if (animating || touchHandled) return;

      var current = sectionEls[currentIndex];
      var deltaY = touchStartY - e.touches[0].clientY;
      var THRESHOLD = 40;

      if (deltaY > THRESHOLD && atBottom(current) && currentIndex < sectionEls.length - 1) {
        touchHandled = true;
        e.preventDefault();
        goToSection(currentIndex + 1);
      } else if (deltaY < -THRESHOLD && atTop(current) && currentIndex > 0) {
        touchHandled = true;
        e.preventDefault();
        goToSection(currentIndex - 1);
      }
    },
    { passive: false },
  );

  document.addEventListener("keydown", function (e) {
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || animating) return;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      goToSection(currentIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToSection(currentIndex - 1);
    }
  });

  sideNavItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var idx = sectionEls.findIndex(function (s) {
        return s.id === item.dataset.target;
      });
      if (idx !== -1) goToSection(idx);
    });
  });

  var logoLink = document.querySelector(".logo");
  if (logoLink) {
    logoLink.addEventListener("click", function (e) {
      e.preventDefault();
      goToSection(0);
    });
  }

  /* ---- home gallery video slider ---- */
  var slider = document.getElementById("videoSlider");
  if (slider) {
    var slides = slider.querySelectorAll(".slide");
    var dots = slider.querySelectorAll(".slider-dots button");
    var current = 0;

    function goToSlide(index) {
      slides[current].classList.remove("active");
      slides[current].pause();
      dots[current].classList.remove("active");

      current = index;

      slides[current].classList.add("active");
      dots[current].classList.add("active");
      slides[current].currentTime = 0;
      slides[current].play();
    }

    slides.forEach(function (video, index) {
      video.addEventListener("ended", function () {
        goToSlide((index + 1) % slides.length);
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        goToSlide(index);
      });
    });
  }

  /* ---- footer condensed tabs (iPad + mobile accordion) ---- */
  var footerCols = document.querySelectorAll(".footer-columns > .footer-col:not(.footer-brands)");
  if (footerCols.length) {
    var footerTabsQuery = window.matchMedia("(min-width: 769px) and (max-width: 1024px)");

    function ensureFooterTabDefault() {
      if (!footerTabsQuery.matches) return;
      var hasActive = Array.prototype.some.call(footerCols, function (c) {
        return c.classList.contains("active");
      });
      if (!hasActive) footerCols[0].classList.add("active");
    }

    ensureFooterTabDefault();
    footerTabsQuery.addEventListener("change", ensureFooterTabDefault);

    footerCols.forEach(function (col) {
      var heading = col.querySelector("h3");
      if (!heading) return;
      heading.addEventListener("click", function () {
        var wasActive = col.classList.contains("active");
        footerCols.forEach(function (c) {
          c.classList.remove("active");
        });
        if (!wasActive) col.classList.add("active");
      });
    });
  }

  /* ---- gallery tiles: play video only while hovered (desktop only) ---- */
  document.querySelectorAll(".tile-card").forEach(function (card) {
    var video = card.querySelector(".tile-video");
    if (!video) return;

    function playVideo() {
      if (!window.matchMedia("(min-width: 1201px)").matches) return;
      video.currentTime = 0;
      video.play();
    }
    function stopVideo() {
      video.pause();
    }

    card.addEventListener("mouseenter", playVideo);
    card.addEventListener("mouseleave", stopVideo);
    card.addEventListener("focus", playVideo);
    card.addEventListener("blur", stopVideo);
  });
});
