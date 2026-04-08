/* ─── PropPulse — script.js ─────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Smooth scroll ──────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH;
    window.scrollTo({ top: top, behavior: 'smooth' });
    // Close mobile nav if open
    closeNav();
  });

  /* ── Nav: shadow on scroll + active state ───────────────────────────────── */
  var nav = document.getElementById('nav');
  function handleNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Mobile hamburger ────────────────────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');

  function closeNav() {
    if (hamburger && navLinks) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    }
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('open');
      }
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeNav();
    });
  }

  /* ── Logo image fallback ─────────────────────────────────────────────────── */
  var logoImgs = document.querySelectorAll('.logo-img');
  logoImgs.forEach(function (img) {
    function onError() {
      img.style.display = 'none';
      var fallback = img.parentElement.querySelector('.logo-text-fallback');
      if (fallback) fallback.style.display = 'inline';
    }
    img.addEventListener('error', onError);
    if (img.complete && img.naturalWidth === 0) onError();
  });

  /* ── Stat counter animation ─────────────────────────────────────────────── */
  var stats = document.querySelectorAll('.stat-number');
  if (stats.length === 0) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateStat(el) {
    var target   = parseFloat(el.getAttribute('data-target'));
    var suffix   = el.getAttribute('data-suffix') || '';
    var isDecimal = el.getAttribute('data-decimal') === 'true';
    var duration  = 1800; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = easeOutQuart(progress);
      var current  = target * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure final value is exact
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(function (stat) {
      observer.observe(stat);
    });
  } else {
    // Fallback: just show final values
    stats.forEach(function (stat) {
      var target   = parseFloat(stat.getAttribute('data-target'));
      var suffix   = stat.getAttribute('data-suffix') || '';
      var isDecimal = stat.getAttribute('data-decimal') === 'true';
      stat.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    });
  }

  /* ── Fade-in on scroll (cards) ──────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var style = document.createElement('style');
    style.textContent = [
      '.fade-in { opacity: 0; transform: translateY(20px);',
      '  transition: opacity 0.55s ease, transform 0.55s ease; }',
      '.fade-in.visible { opacity: 1; transform: translateY(0); }'
    ].join('\n');
    document.head.appendChild(style);

    var fadeTargets = document.querySelectorAll(
      '.service-card, .why-item, .pricing-card, .client-card'
    );
    fadeTargets.forEach(function (el) { el.classList.add('fade-in'); });

    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger siblings
          var siblings = Array.from(entry.target.parentElement.children);
          var idx = siblings.indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, idx * 80);
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeTargets.forEach(function (el) { fadeObserver.observe(el); });
  }

})();
