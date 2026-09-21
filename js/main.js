document.addEventListener('DOMContentLoaded', function () {

  /* ---- search toggle ---- */
  var searchTool = document.querySelector('.search-tool');
  var searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', function () {
    var open = searchTool.classList.toggle('open');
    searchBtn.setAttribute('aria-expanded', open);
    if (open) searchTool.querySelector('input').focus();
  });

  /* ---- language dropdown ---- */
  var langTool = document.querySelector('.lang-tool');
  var langBtn = document.getElementById('langBtn');
  langBtn.addEventListener('click', function () {
    var open = langTool.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.lang-menu button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.lang-menu button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      langTool.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!searchTool.contains(e.target)) searchTool.classList.remove('open');
    if (!langTool.contains(e.target)) langTool.classList.remove('open');
  });

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('#nav a').forEach(function (link) {
    link.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });

  /* ---- section side-nav + header theme ---- */
  var sideNavItems = document.querySelectorAll('.side-nav li');
  var sections = document.querySelectorAll('.section');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      var theme = entry.target.dataset.navTheme;

      sideNavItems.forEach(function (item) {
        item.classList.toggle('active', item.dataset.target === id);
      });

      document.body.classList.toggle('theme-dark', theme === 'dark');
    });
  }, { threshold: 0.6 });

  sections.forEach(function (section) { observer.observe(section); });

  sideNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = document.getElementById(item.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---- home gallery video slider ---- */
  var slider = document.getElementById('videoSlider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dots = slider.querySelectorAll('.slider-dots button');
    var current = 0;

    function goToSlide(index) {
      slides[current].classList.remove('active');
      slides[current].pause();
      dots[current].classList.remove('active');

      current = index;

      slides[current].classList.add('active');
      dots[current].classList.add('active');
      slides[current].currentTime = 0;
      slides[current].play();
    }

    slides.forEach(function (video, index) {
      video.addEventListener('ended', function () {
        goToSlide((index + 1) % slides.length);
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { goToSlide(index); });
    });
  }

});
