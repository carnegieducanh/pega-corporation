document.addEventListener("DOMContentLoaded", function () {
  /* ---- search toggle ---- */
  var searchTool = document.querySelector(".search-tool");
  var searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", function () {
    var open = searchTool.classList.toggle("open");
    searchBtn.setAttribute("aria-expanded", open);
    if (open) searchTool.querySelector("input").focus();
  });

  /* ---- language dropdown ---- */
  var langTool = document.querySelector(".lang-tool");
  var langBtn = document.getElementById("langBtn");
  langBtn.addEventListener("click", function () {
    var open = langTool.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".lang-menu button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".lang-menu button").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      langTool.classList.remove("open");
    });
  });

  document.addEventListener("click", function (e) {
    if (!searchTool.contains(e.target)) searchTool.classList.remove("open");
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
  var sectionTint = document.getElementById("sectionTint");
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

    sideNavItems.forEach(function (item) {
      item.classList.toggle("active", item.dataset.target === id);
    });

    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.dataset.activeSection = id;

    if (sectionTint) sectionTint.classList.toggle("active", id === "home");
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
});
